// Свой deflate: фиксированные коды Хаффмана плюс жадный LZ77.
//
// Зачем не zlib: системный zlib на разных платформах и версиях сжимает по-разному,
// и один и тот же исходник даёт разные байты. А нам нужно, чтобы `git status`
// после пересборки был пустым и на Ubuntu в CI, и на Windows, и на macOS.
// Этот код зависит только от входных данных, поэтому байты всегда одинаковые.
//
// Формат: RFC 1951, блок один, BTYPE=01 (fixed Huffman), BFINAL=1.

import { crc32, adler32 } from './checksum.mjs';

/* ── таблицы длин и расстояний из RFC 1951, раздел 3.2.5 ── */

const LEN_BASE = [
  3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31,
  35, 43, 51, 59, 67, 83, 99, 115, 131, 163, 195, 227, 258,
];
const LEN_EXTRA = [
  0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2,
  3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0,
];
const DIST_BASE = [
  1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97, 129, 193,
  257, 385, 513, 769, 1025, 1537, 2049, 3073, 4097, 6145, 8193, 12289, 16385, 24577,
];
const DIST_EXTRA = [
  0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6,
  7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13,
];

const WINDOW = 32768;
const MAX_MATCH = 258;
const MAX_CHAIN = 32; // компромисс между степенью сжатия и временем сборки

class BitWriter {
  constructor() {
    this.bytes = [];
    this.acc = 0;
    this.bits = 0;
  }

  /** Обычные данные deflate пишутся младшим битом вперёд. */
  writeBits(value, count) {
    this.acc |= value << this.bits;
    this.bits += count;
    while (this.bits >= 8) {
      this.bytes.push(this.acc & 0xff);
      this.acc >>>= 8;
      this.bits -= 8;
    }
  }

  /** Коды Хаффмана пишутся старшим битом вперёд, поэтому значение разворачиваем. */
  writeCode(value, count) {
    let reversed = 0;
    for (let i = 0; i < count; i++) reversed = (reversed << 1) | ((value >>> i) & 1);
    this.writeBits(reversed, count);
  }

  finish() {
    if (this.bits > 0) {
      this.bytes.push(this.acc & 0xff);
      this.acc = 0;
      this.bits = 0;
    }
    return Buffer.from(this.bytes);
  }
}

/** Фиксированное дерево литералов: 8/9/7/8 бит по диапазонам RFC. */
function writeLiteral(writer, symbol) {
  if (symbol <= 143) writer.writeCode(0x30 + symbol, 8);
  else if (symbol <= 255) writer.writeCode(0x190 + (symbol - 144), 9);
  else if (symbol <= 279) writer.writeCode(symbol - 256, 7);
  else writer.writeCode(0xc0 + (symbol - 280), 8);
}

function lengthCode(length) {
  if (length === 258) return [285, 0, 0]; // у 258 свой код без дополнительных бит
  let i = 0;
  while (i + 1 < LEN_BASE.length && LEN_BASE[i + 1] <= length) i++;
  return [257 + i, LEN_EXTRA[i], length - LEN_BASE[i]];
}

function distanceCode(distance) {
  let i = 0;
  while (i + 1 < DIST_BASE.length && DIST_BASE[i + 1] <= distance) i++;
  return [i, DIST_EXTRA[i], distance - DIST_BASE[i]];
}

/**
 * Сжимает буфер в «сырой» deflate-поток (без zlib/gzip-обёртки).
 * @param {Buffer} data
 * @returns {Buffer}
 */
export function deflateRaw(data) {
  const input = Buffer.isBuffer(data) ? data : Buffer.from(data);
  const writer = new BitWriter();
  writer.writeBits(1, 1); // BFINAL
  writer.writeBits(1, 2); // BTYPE = 01, фиксированные коды

  const n = input.length;
  // Цепочки хешей, как в zlib: хеш трёх байт -> последняя позиция, prev -> предыдущая.
  const head = new Int32Array(1 << 16).fill(-1);
  const prev = new Int32Array(n).fill(-1);
  const hashAt = (p) => ((input[p] << 10) ^ (input[p + 1] << 5) ^ input[p + 2]) & 0xffff;

  const insert = (p) => {
    const h = hashAt(p);
    prev[p] = head[h];
    head[h] = p;
  };

  let i = 0;
  while (i < n) {
    let bestLen = 0;
    let bestDist = 0;

    if (i + 2 < n) {
      let candidate = head[hashAt(i)];
      let chain = 0;
      while (candidate >= 0 && i - candidate <= WINDOW && chain < MAX_CHAIN) {
        // быстрый отсев: проверяем байт сразу за текущим лучшим совпадением
        if (input[candidate + bestLen] === input[i + bestLen]) {
          let len = 0;
          while (len < MAX_MATCH && i + len < n && input[candidate + len] === input[i + len]) len++;
          if (len > bestLen) {
            bestLen = len;
            bestDist = i - candidate;
            if (len >= MAX_MATCH) break;
          }
        }
        candidate = prev[candidate];
        chain++;
      }
      insert(i);
    }

    if (bestLen >= 3) {
      const [symbol, extraBits, extra] = lengthCode(bestLen);
      writeLiteral(writer, symbol);
      if (extraBits) writer.writeBits(extra, extraBits);
      const [distSymbol, distExtraBits, distExtra] = distanceCode(bestDist);
      writer.writeCode(distSymbol, 5);
      if (distExtraBits) writer.writeBits(distExtra, distExtraBits);

      // Позиции внутри совпадения тоже попадают в словарь, иначе повторы не найдутся.
      for (let j = 1; j < bestLen; j++) {
        if (i + j + 2 < n) insert(i + j);
      }
      i += bestLen;
    } else {
      writeLiteral(writer, input[i]);
      i++;
    }
  }

  writeLiteral(writer, 256); // конец блока
  return writer.finish();
}

/** Обёртка zlib, как её ждёт PNG: заголовок 0x78 0xDA и Adler-32 в конце. */
export function zlibCompress(data) {
  const input = Buffer.isBuffer(data) ? data : Buffer.from(data);
  const tail = Buffer.alloc(4);
  tail.writeUInt32BE(adler32(input), 0);
  return Buffer.concat([Buffer.from([0x78, 0xda]), deflateRaw(input), tail]);
}

/** Обёртка gzip: MTIME=0, OS=255 (неизвестна) — чтобы файл не зависел от платформы. */
export function gzipCompress(data) {
  const input = Buffer.isBuffer(data) ? data : Buffer.from(data);
  const header = Buffer.from([0x1f, 0x8b, 0x08, 0x00, 0x00, 0x00, 0x00, 0x00, 0x02, 0xff]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32LE(crc32(input), 0);
  const size = Buffer.alloc(4);
  size.writeUInt32LE(input.length >>> 0, 0);
  return Buffer.concat([header, deflateRaw(input), crc, size]);
}
