// Минимальный PNG/ICO-энкодер без зависимостей.
// Умеет ровно одно: RGBA-растр -> валидный PNG. Нам большего и не надо.
// Сжатие — свой deflate из `deflate.mjs`, поэтому байты не зависят от версии zlib.

import { crc32 } from './checksum.mjs';
import { zlibCompress } from './deflate.mjs';

export { crc32 };

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const body = Buffer.concat([Buffer.from(type, 'latin1'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([len, body, crc]);
}

/** Предсказание Пейта из RFC 2083. */
function paeth(a, b, c) {
  const p = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);
  if (pa <= pb && pa <= pc) return a;
  return pb <= pc ? b : c;
}

/**
 * Строит отфильтрованную строку. Фильтры нужны не для красоты: на градиентах
 * соседние пиксели почти одинаковые, и после вычитания предиктора остаются нули,
 * которые deflate упаковывает почти бесплатно.
 */
function filterRow(type, cur, prev, stride, bpp) {
  const out = Buffer.alloc(stride);
  for (let i = 0; i < stride; i++) {
    const a = i >= bpp ? cur[i - bpp] : 0;
    const b = prev ? prev[i] : 0;
    const c = prev && i >= bpp ? prev[i - bpp] : 0;
    let value;
    switch (type) {
      case 0: value = cur[i]; break;
      case 1: value = cur[i] - a; break;
      case 2: value = cur[i] - b; break;
      case 3: value = cur[i] - ((a + b) >> 1); break;
      default: value = cur[i] - paeth(a, b, c); break;
    }
    out[i] = value & 0xff;
  }
  return out;
}

/** Эвристика из спецификации: минимальная сумма абсолютных значений байтов. */
function cost(row) {
  let sum = 0;
  for (let i = 0; i < row.length; i++) sum += row[i] < 128 ? row[i] : 256 - row[i];
  return sum;
}

/**
 * @param {number} width
 * @param {number} height
 * @param {Buffer} rgba  width*height*4 байт
 * @returns {Buffer} PNG
 */
export function encodePNG(width, height, rgba) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type: RGBA
  ihdr[10] = 0; // deflate
  ihdr[11] = 0; // фильтры выбираются адаптивно
  ihdr[12] = 0; // no interlace

  // Каждая строка: байт номера фильтра + отфильтрованные пиксели.
  const stride = width * 4;
  const bpp = 4;
  const raw = Buffer.alloc((stride + 1) * height);
  let prev = null;
  for (let y = 0; y < height; y++) {
    const cur = rgba.subarray(y * stride, (y + 1) * stride);
    let best = null;
    let bestType = 0;
    let bestCost = Infinity;
    for (let type = 0; type < 5; type++) {
      const row = filterRow(type, cur, prev, stride, bpp);
      const rowCost = cost(row);
      if (rowCost < bestCost) {
        bestCost = rowCost;
        best = row;
        bestType = type;
      }
    }
    raw[y * (stride + 1)] = bestType;
    best.copy(raw, y * (stride + 1) + 1);
    prev = cur;
  }

  const idat = zlibCompress(raw);
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

/**
 * ICO/CUR-контейнер с PNG-полезной нагрузкой (поддерживается Windows Vista+).
 * У курсора (type 2) вместо planes/bitcount в каталоге лежат координаты хотспота.
 * @param {{size:number, png:Buffer}[]} entries
 * @param {{cursor?: boolean, hotspot?: [number, number]}} options
 */
export function encodeICO(entries, { cursor = false, hotspot = [0, 0] } = {}) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(cursor ? 2 : 1, 2); // 1 = icon, 2 = cursor
  header.writeUInt16LE(entries.length, 4);

  const dir = Buffer.alloc(16 * entries.length);
  let offset = 6 + dir.length;
  entries.forEach((entry, i) => {
    const at = i * 16;
    dir[at] = entry.size >= 256 ? 0 : entry.size;
    dir[at + 1] = entry.size >= 256 ? 0 : entry.size;
    dir[at + 2] = 0; // палитра
    dir[at + 3] = 0;
    dir.writeUInt16LE(cursor ? hotspot[0] : 1, at + 4);
    dir.writeUInt16LE(cursor ? hotspot[1] : 32, at + 6);
    dir.writeUInt32LE(entry.png.length, at + 8);
    dir.writeUInt32LE(offset, at + 12);
    offset += entry.png.length;
  });

  return Buffer.concat([header, dir, ...entries.map((e) => e.png)]);
}
