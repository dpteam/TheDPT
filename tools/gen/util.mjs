// Общие утилиты генератора: запись файлов и бинарные энкодеры, написанные руками.
// Ни одной внешней зависимости. Только node:*.

import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { encodePNG, encodeICO, crc32 } from '../lib/png.mjs';
import { gzipCompress } from '../lib/deflate.mjs';
import { render } from '../lib/render.mjs';

export const OUT = new Map(); // относительный путь -> Buffer
const LOWERCASE = new Map(); // защита от коллизий на нечувствительных к регистру ФС

export function add(rel, data) {
  const buf = Buffer.isBuffer(data) ? data : Buffer.from(String(data), 'utf8');
  if (OUT.has(rel)) throw new Error(`дубль пути: ${rel}`);
  const lower = rel.toLowerCase();
  const twin = LOWERCASE.get(lower);
  if (twin && twin !== rel) throw new Error(`пути ${twin} и ${rel} совпадут на Windows`);
  LOWERCASE.set(lower, rel);
  OUT.set(rel, buf);
  return buf;
}

export function flush(root) {
  let n = 0;
  for (const [rel, buf] of OUT) {
    const abs = path.join(root, rel);
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    fs.writeFileSync(abs, buf);
    n++;
  }
  return n;
}

/* ─────────────────────────── текст ─────────────────────────── */

export const morse = (text) => {
  const table = {
    A: '.-', B: '-...', C: '-.-.', D: '-..', E: '.', F: '..-.', G: '--.', H: '....',
    I: '..', J: '.---', K: '-.-', L: '.-..', M: '--', N: '-.', O: '---', P: '.--.',
    Q: '--.-', R: '.-.', S: '...', T: '-', U: '..-', V: '...-', W: '.--', X: '-..-',
    Y: '-.--', Z: '--..', 0: '-----', 1: '.----', 2: '..---', 3: '...--', 4: '....-',
    5: '.....', 6: '-....', 7: '--...', 8: '---..', 9: '----.',
  };
  return [...text.toUpperCase()]
    .map((c) => (c === ' ' ? '/' : table[c] ?? '?'))
    .join(' ');
};

/* ─────────────────────────── картинки ─────────────────────────── */

export const png = (size) => encodePNG(size, size, render(size));
export const ico = (sizes) => encodeICO(sizes.map((s) => ({ size: s, png: png(s) })));
export const cur = (size, hotspot) =>
  encodeICO([{ size, png: png(size) }], { cursor: true, hotspot });

/** BMP 24-bit, bottom-up, без сжатия. */
export function bmp(width, height, rgba) {
  const rowSize = Math.ceil((width * 3) / 4) * 4;
  const pixels = Buffer.alloc(rowSize * height);
  for (let y = 0; y < height; y++) {
    const src = height - 1 - y;
    for (let x = 0; x < width; x++) {
      const i = (src * width + x) * 4;
      const o = y * rowSize + x * 3;
      const a = rgba[i + 3] / 255;
      // накладываем на тёмный фон, чтобы не было прозрачности
      pixels[o] = Math.round(rgba[i + 2] * a);
      pixels[o + 1] = Math.round(rgba[i + 1] * a);
      pixels[o + 2] = Math.round(rgba[i] * a);
    }
  }
  const header = Buffer.alloc(54);
  header.write('BM', 0, 'latin1');
  header.writeUInt32LE(54 + pixels.length, 2);
  header.writeUInt32LE(54, 10);
  header.writeUInt32LE(40, 14);
  header.writeInt32LE(width, 18);
  header.writeInt32LE(height, 22);
  header.writeUInt16LE(1, 26);
  header.writeUInt16LE(24, 28);
  header.writeUInt32LE(pixels.length, 34);
  header.writeInt32LE(2835, 38);
  header.writeInt32LE(2835, 42);
  return Buffer.concat([header, pixels]);
}

/** TGA 32-bit, top-left origin, без RLE. */
export function tga(width, height, rgba) {
  const header = Buffer.alloc(18);
  header[2] = 2; // uncompressed true-color
  header.writeUInt16LE(width, 12);
  header.writeUInt16LE(height, 14);
  header[16] = 32;
  header[17] = 0x28; // 8 alpha bits + top-left
  const body = Buffer.alloc(width * height * 4);
  for (let i = 0; i < width * height; i++) {
    body[i * 4] = rgba[i * 4 + 2];
    body[i * 4 + 1] = rgba[i * 4 + 1];
    body[i * 4 + 2] = rgba[i * 4];
    body[i * 4 + 3] = rgba[i * 4 + 3];
  }
  return Buffer.concat([header, body]);
}

/** Netpbm: P6 (rgb), P5 (gray), P4 (1-bit). */
export function ppm(width, height, rgba) {
  const head = Buffer.from(`P6\n# TheDPT\n${width} ${height}\n255\n`, 'latin1');
  const body = Buffer.alloc(width * height * 3);
  for (let i = 0; i < width * height; i++) {
    const a = rgba[i * 4 + 3] / 255;
    body[i * 3] = Math.round(rgba[i * 4] * a);
    body[i * 3 + 1] = Math.round(rgba[i * 4 + 1] * a);
    body[i * 3 + 2] = Math.round(rgba[i * 4 + 2] * a);
  }
  return Buffer.concat([head, body]);
}

export function pgm(width, height, rgba) {
  const head = Buffer.from(`P5\n${width} ${height}\n255\n`, 'latin1');
  const body = Buffer.alloc(width * height);
  for (let i = 0; i < width * height; i++) {
    const a = rgba[i * 4 + 3] / 255;
    const lum =
      0.2126 * rgba[i * 4] * a + 0.7152 * rgba[i * 4 + 1] * a + 0.0722 * rgba[i * 4 + 2] * a;
    body[i] = Math.round(lum);
  }
  return Buffer.concat([head, body]);
}

export function pbm(width, height, rgba) {
  const rowBytes = Math.ceil(width / 8);
  const head = Buffer.from(`P4\n${width} ${height}\n`, 'latin1');
  const body = Buffer.alloc(rowBytes * height);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const lum = 0.2126 * rgba[i] + 0.7152 * rgba[i + 1] + 0.0722 * rgba[i + 2];
      // 1 = чёрный
      if (rgba[i + 3] > 64 && lum < 128) body[y * rowBytes + (x >> 3)] |= 0x80 >> (x & 7);
    }
  }
  return Buffer.concat([head, body]);
}

/** XBM — C-исходник с монохромным растром. */
export function xbm(name, width, height, rgba) {
  const rowBytes = Math.ceil(width / 8);
  const bytes = [];
  for (let y = 0; y < height; y++) {
    for (let b = 0; b < rowBytes; b++) {
      let byte = 0;
      for (let bit = 0; bit < 8; bit++) {
        const x = b * 8 + bit;
        if (x >= width) continue;
        const i = (y * width + x) * 4;
        const lum = 0.2126 * rgba[i] + 0.7152 * rgba[i + 1] + 0.0722 * rgba[i + 2];
        if (rgba[i + 3] > 64 && lum > 128) byte |= 1 << bit;
      }
      bytes.push(byte);
    }
  }
  const lines = [];
  for (let i = 0; i < bytes.length; i += 12) {
    lines.push(
      '  ' + bytes.slice(i, i + 12).map((v) => `0x${v.toString(16).padStart(2, '0')}`).join(', '),
    );
  }
  return `/* X BitMap — TheDPT */
#define ${name}_width ${width}
#define ${name}_height ${height}
static unsigned char ${name}_bits[] = {
${lines.join(',\n')}
};
`;
}

/** XPM3 — цветной растр текстом. */
export function xpm(name, width, height, rgba) {
  const palette = new Map();
  const symbols = '#%&*+-.;:=@$ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const index = (r, g, b) => {
    const q = `${r >> 5},${g >> 5},${b >> 5}`;
    if (!palette.has(q)) {
      palette.set(q, {
        ch: symbols[palette.size] ?? '?',
        hex: `#${[r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')}`,
      });
    }
    return palette.get(q).ch;
  };
  const rows = [];
  for (let y = 0; y < height; y++) {
    let row = '';
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const a = rgba[i + 3] / 255;
      row += index(
        Math.round(rgba[i] * a),
        Math.round(rgba[i + 1] * a),
        Math.round(rgba[i + 2] * a),
      );
    }
    rows.push(`"${row}",`);
  }
  const colors = [...palette.values()].map((c) => `"${c.ch} c ${c.hex}",`);
  return `/* XPM — TheDPT */
static char *${name}[] = {
"${width} ${height} ${palette.size} 1",
${colors.join('\n')}
${rows.join('\n')}
};
`;
}

/** GIF89a с LZW, поддержка нескольких кадров. */
export function gif(width, height, frames, delayCs = 40, loop = 0) {
  const parts = [];
  const head = Buffer.alloc(13);
  head.write('GIF89a', 0, 'latin1');
  head.writeUInt16LE(width, 6);
  head.writeUInt16LE(height, 8);
  head[10] = 0x80 | 0x07; // GCT есть, 256 цветов
  head[11] = 0; // фон
  head[12] = 0;
  parts.push(head);
  // Глобальная палитра: 6x6x6 куб + серые
  const gct = Buffer.alloc(768);
  let k = 0;
  const levels = [0, 51, 102, 153, 204, 255];
  for (let r = 0; r < 6; r++)
    for (let g = 0; g < 6; g++)
      for (let b = 0; b < 6; b++) {
        gct[k++] = levels[r];
        gct[k++] = levels[g];
        gct[k++] = levels[b];
      }
  for (; k < 768; k++) gct[k] = k % 256;
  parts.push(gct);

  // NETSCAPE2.0 для цикла
  const app = Buffer.concat([
    Buffer.from([0x21, 0xff, 0x0b]),
    Buffer.from('NETSCAPE2.0', 'latin1'),
    Buffer.from([0x03, 0x01, loop & 0xff, (loop >> 8) & 0xff, 0x00]),
  ]);
  parts.push(app);

  for (const frame of frames) {
    const gce = Buffer.from([0x21, 0xf9, 0x04, 0x04, delayCs & 0xff, delayCs >> 8, 0x00, 0x00]);
    parts.push(gce);
    const desc = Buffer.alloc(10);
    desc[0] = 0x2c;
    desc.writeUInt16LE(0, 1);
    desc.writeUInt16LE(0, 3);
    desc.writeUInt16LE(width, 5);
    desc.writeUInt16LE(height, 7);
    desc[9] = 0;
    parts.push(desc);
    parts.push(lzwBlock(frame, 8));
  }
  parts.push(Buffer.from([0x3b]));
  return Buffer.concat(parts);
}

function lzwBlock(indices, minCodeSize) {
  const clear = 1 << minCodeSize;
  const eoi = clear + 1;
  let dict = new Map();
  let next = eoi + 1;
  let codeSize = minCodeSize + 1;
  const out = [];
  let cur = 0;
  let bits = 0;
  const emit = (code) => {
    cur |= code << bits;
    bits += codeSize;
    while (bits >= 8) {
      out.push(cur & 0xff);
      cur >>>= 8;
      bits -= 8;
    }
  };
  const reset = () => {
    dict = new Map();
    next = eoi + 1;
    codeSize = minCodeSize + 1;
  };
  emit(clear);
  reset();
  let prefix = indices[0];
  for (let i = 1; i < indices.length; i++) {
    const c = indices[i];
    const key = (prefix << 8) | c;
    if (dict.has(key)) {
      prefix = dict.get(key);
      continue;
    }
    emit(prefix);
    dict.set(key, next++);
    if (next - 1 === 1 << codeSize && codeSize < 12) codeSize++;
    if (next > 4095) {
      emit(clear);
      reset();
    }
    prefix = c;
  }
  emit(prefix);
  emit(eoi);
  if (bits > 0) out.push(cur & 0xff);

  const blocks = [Buffer.from([minCodeSize])];
  for (let i = 0; i < out.length; i += 255) {
    const slice = Buffer.from(out.slice(i, i + 255));
    blocks.push(Buffer.from([slice.length]), slice);
  }
  blocks.push(Buffer.from([0]));
  return Buffer.concat(blocks);
}

/** Индексы 256-цветной палитры из RGBA по кубу 6x6x6. */
export function quantize(rgba, width, height, invert = false) {
  const out = new Uint8Array(width * height);
  for (let i = 0; i < width * height; i++) {
    const a = rgba[i * 4 + 3] / 255;
    const r = Math.round((rgba[i * 4] * a) / 51);
    const g = Math.round((rgba[i * 4 + 1] * a) / 51);
    const b = Math.round((rgba[i * 4 + 2] * a) / 51);
    let idx = r * 36 + g * 6 + b;
    if (invert) idx = idx < 128 ? 215 : 40;
    out[i] = idx;
  }
  return out;
}

/* ─────────────────────────── звук ─────────────────────────── */

export function wav(samples, sampleRate = 44100) {
  const data = Buffer.alloc(samples.length * 2);
  samples.forEach((v, i) => {
    const s = Math.max(-1, Math.min(1, v));
    data.writeInt16LE(Math.round(s * 32767), i * 2);
  });
  const header = Buffer.alloc(44);
  header.write('RIFF', 0, 'latin1');
  header.writeUInt32LE(36 + data.length, 4);
  header.write('WAVEfmt ', 8, 'latin1');
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(1, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(sampleRate * 2, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write('data', 36, 'latin1');
  header.writeUInt32LE(data.length, 40);
  return Buffer.concat([header, data]);
}

/** Морзянка "DPT" -> массив сэмплов. */
export function morseSamples(sampleRate = 44100, freq = 720, dot = 0.09) {
  const units = morse('DPT').split(' ');
  const out = [];
  const gap = Math.round(dot * sampleRate * 0.9);
  const tone = (len) => {
    const n = Math.round(len * sampleRate);
    for (let i = 0; i < n; i++) {
      const env = Math.min(1, i / 220, (n - i) / 220);
      out.push(Math.sin((2 * Math.PI * freq * i) / sampleRate) * 0.5 * env);
    }
  };
  const silence = (len) => {
    const n = Math.round(len * sampleRate);
    for (let i = 0; i < n; i++) out.push(0);
  };
  units.forEach((sym, si) => {
    if (sym === '/') {
      silence(dot * 3);
      return;
    }
    [...sym].forEach((ch, ci) => {
      tone(ch === '.' ? dot : dot * 3);
      if (ci < sym.length - 1) silence(dot);
    });
    if (si < units.length - 1) silence(dot * 3);
  });
  return out;
}

/** AIFF (big-endian PCM). */
export function aiff(samples, sampleRate = 44100) {
  const data = Buffer.alloc(samples.length * 2);
  samples.forEach((v, i) => data.writeInt16BE(Math.round(Math.max(-1, Math.min(1, v)) * 32767), i * 2));
  const ssnd = Buffer.alloc(8);
  ssnd.writeUInt32BE(0, 0);
  ssnd.writeUInt32BE(0, 4);
  const ssndChunk = Buffer.concat([Buffer.from('SSND', 'latin1'), be32(data.length + 8), ssnd, data]);

  // 80-битный extended float для частоты дискретизации
  const ext = (n) => {
    const buf = Buffer.alloc(10);
    const e = Math.floor(Math.log2(n));
    const mant = BigInt(Math.round((n / 2 ** e) * 2 ** 63));
    buf.writeUInt16BE(16383 + e, 0);
    buf.writeBigUInt64BE(mant, 2);
    return buf;
  };
  const comm = Buffer.alloc(18);
  comm.writeUInt16BE(1, 0); // каналы
  comm.writeUInt32BE(samples.length, 2); // кадры
  comm.writeUInt16BE(16, 6); // бит
  ext(sampleRate).copy(comm, 8);
  const commChunk = Buffer.concat([Buffer.from('COMM', 'latin1'), be32(18), comm]);

  const body = Buffer.concat([Buffer.from('AIFF', 'latin1'), commChunk, ssndChunk]);
  return Buffer.concat([Buffer.from('FORM', 'latin1'), be32(body.length), body]);
}

const be32 = (n) => {
  const b = Buffer.alloc(4);
  b.writeUInt32BE(n >>> 0, 0);
  return b;
};

/** Sun/NeXT AU — 8-bit μ-law. */
export function au(samples, sampleRate = 8000) {
  const step = Math.max(1, Math.floor(44100 / sampleRate));
  const vals = [];
  for (let i = 0; i < samples.length; i += step) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    // μ-law
    const mu = 255;
    const sign = s < 0 ? 0x80 : 0;
    const mag = Math.log(1 + mu * Math.abs(s)) / Math.log(1 + mu);
    vals.push(sign | (Math.round(mag * 127) & 0x7f));
  }
  const header = Buffer.alloc(24);
  header.write('.snd', 0, 'latin1');
  header.writeUInt32BE(24, 4);
  header.writeUInt32BE(vals.length, 8);
  header.writeUInt32BE(1, 12); // μ-law
  header.writeUInt32BE(sampleRate, 16);
  header.writeUInt32BE(1, 20);
  return Buffer.concat([header, Buffer.from(vals)]);
}

/** MIDI: морзянка одной дорожкой. */
export function midi() {
  const ticksPerQuarter = 96;
  const events = [];
  let t = 0;
  const push = (delta, bytes) => events.push({ delta, bytes });
  // Program change: square lead
  push(0, [0xc0, 80]);
  const units = morse('DPT').split(' ');
  const dot = 24; // ticks
  units.forEach((sym, si) => {
    if (sym === '/') {
      t += dot * 3;
      return;
    }
    [...sym].forEach((ch, ci) => {
      const len = ch === '.' ? dot : dot * 3;
      push(t, [0x90, 76, 100]);
      push(len, [0x80, 76, 0]);
      t = 0;
      if (ci < sym.length - 1) t += dot;
    });
    if (si < units.length - 1) t += dot * 3;
  });
  push(0, [0xff, 0x2f, 0x00]);

  const track = [];
  for (const e of events) {
    let delta = e.delta;
    const vlq = [];
    vlq.unshift(delta & 0x7f);
    while ((delta >>= 7)) vlq.unshift((delta & 0x7f) | 0x80);
    track.push(...vlq, ...e.bytes);
  }
  const trackBuf = Buffer.from(track);
  const header = Buffer.from([
    0x4d, 0x54, 0x68, 0x64, 0, 0, 0, 6, 0, 0, 0, 1, (ticksPerQuarter >> 8) & 0xff, ticksPerQuarter & 0xff,
  ]);
  const trackHead = Buffer.concat([
    Buffer.from('MTrk', 'latin1'),
    be32(trackBuf.length),
  ]);
  return Buffer.concat([header, trackHead, trackBuf]);
}

/* ─────────────────────────── архивы ─────────────────────────── */

/** ZIP без сжатия (store) — руками, со всеми заголовками. */
export function zip(entries) {
  const locals = [];
  const central = [];
  let offset = 0;
  const now = new Date(2026, 10, 12, 12, 0, 0);
  const dosTime =
    (now.getHours() << 11) | (now.getMinutes() << 5) | Math.floor(now.getSeconds() / 2);
  const dosDate =
    ((now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate();

  for (const entry of entries) {
    const name = Buffer.from(entry.name, 'utf8');
    const data = Buffer.isBuffer(entry.data) ? entry.data : Buffer.from(entry.data, 'utf8');
    const crc = crc32(data);

    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(0x0800, 6); // UTF-8
    local.writeUInt16LE(0, 8); // store
    local.writeUInt16LE(dosTime, 10);
    local.writeUInt16LE(dosDate, 12);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(data.length, 18);
    local.writeUInt32LE(data.length, 22);
    local.writeUInt16LE(name.length, 26);
    local.writeUInt16LE(0, 28);
    locals.push(local, name, data);

    const cen = Buffer.alloc(46);
    cen.writeUInt32LE(0x02014b50, 0);
    cen.writeUInt16LE(20, 4);
    cen.writeUInt16LE(20, 6);
    cen.writeUInt16LE(0x0800, 8);
    cen.writeUInt16LE(0, 10);
    cen.writeUInt16LE(dosTime, 12);
    cen.writeUInt16LE(dosDate, 14);
    cen.writeUInt32LE(crc, 16);
    cen.writeUInt32LE(data.length, 20);
    cen.writeUInt32LE(data.length, 24);
    cen.writeUInt16LE(name.length, 28);
    cen.writeUInt16LE(0, 30);
    cen.writeUInt16LE(0, 32);
    cen.writeUInt16LE(0, 34);
    cen.writeUInt16LE(0, 36);
    cen.writeUInt32LE(0, 38);
    cen.writeUInt32LE(offset, 42);
    central.push(cen, name);

    offset += local.length + name.length + data.length;
  }

  const centralBuf = Buffer.concat(central);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(0, 4);
  end.writeUInt16LE(0, 6);
  end.writeUInt16LE(entries.length, 8);
  end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(centralBuf.length, 12);
  end.writeUInt32LE(offset, 16);
  end.writeUInt16LE(0, 20);
  return Buffer.concat([...locals, centralBuf, end]);
}

/** USTAR. mtime фиксирован, чтобы сборка была воспроизводимой. */
export function tar(entries) {
  const blocks = [];
  const octal = (n, len) => n.toString(8).padStart(len - 1, '0') + '\0';
  const mtime = 1762948800; // 2026-11-12T12:00:00Z
  for (const entry of entries) {
    const data = Buffer.isBuffer(entry.data) ? entry.data : Buffer.from(entry.data, 'utf8');
    const name = Buffer.from(entry.name, 'utf8');
    const header = Buffer.alloc(512);
    name.copy(header, 0);
    header.write(octal(0o644, 8), 100, 'latin1');
    header.write(octal(0, 8), 108, 'latin1');
    header.write(octal(0, 8), 116, 'latin1');
    header.write(octal(data.length, 12), 124, 'latin1');
    header.write(octal(mtime, 12), 136, 'latin1');
    header.write('        ', 148, 'latin1');
    header.write('0', 156, 'latin1');
    header.write('ustar\0', 257, 'latin1');
    header.write('00', 263, 'latin1');
    header.write('dpt', 265, 'latin1');
    header.write('dpt', 297, 'latin1');
    let sum = 0;
    for (const b of header) sum += b;
    header.write(sum.toString(8).padStart(6, '0') + '\0 ', 148, 'latin1');
    blocks.push(header, data, Buffer.alloc((512 - (data.length % 512)) % 512));
  }
  blocks.push(Buffer.alloc(1024));
  return Buffer.concat(blocks);
}

// gzip собираем сами: у zlib в заголовке байт ОС зависит от платформы.
export const gzip = (data) => gzipCompress(Buffer.from(data));
// Brotli оставляем из node:zlib — свой энкодер ради одной строки писать нерационально.
// Его выход зависит от версии brotli в Node, поэтому в check-repro он помечен «мягким».
export const brotli = (data) => zlib.brotliCompressSync(Buffer.from(data));

/* ─────────────────────────── документы ─────────────────────────── */

/** Минимальный PDF 1.4 с текстом Helvetica. */
export function pdf(lines) {
  const escape = (s) =>
    s
      .replace(/[^\x20-\x7e]/g, '?')
      .replace(/([\\()])/g, '\\$1');
  const content = [
    'BT',
    '/F1 42 Tf',
    '60 700 Td',
    '60 TL',
    ...lines.flatMap((line, i) => (i === 0 ? [`(${escape(line)}) Tj`] : [`T*`, `(${escape(line)}) Tj`])),
    'ET',
  ].join('\n');

  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    `<< /Length ${content.length} >>\nstream\n${content}\nendstream`,
  ];

  // Всё в latin1, поэтому длина строки = длина в байтах.
  let out = '%PDF-1.4\n';
  const offsets = [];
  objects.forEach((obj, i) => {
    offsets.push(out.length);
    out += `${i + 1} 0 obj\n${obj}\nendobj\n`;
  });
  const xref = out.length;
  out += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const off of offsets) out += `${String(off).padStart(10, '0')} 00000 n \n`;
  out += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return Buffer.from(out, 'latin1');
}

/** RTF с UTF-8 -> \uN экранированием. */
export function rtf(text) {
  const esc = [...text]
    .map((ch) => {
      const code = ch.codePointAt(0);
      if (ch === '\n') return '\\par\n';
      if (ch === '\\' || ch === '{' || ch === '}') return '\\' + ch;
      if (code > 127) return `\\u${code}?`;
      return ch;
    })
    .join('');
  return `{\\rtf1\\ansi\\deff0{\\fonttbl{\\f0\\fswiss Helvetica;}}{\\colortbl;\\red124\\green92\\blue255;}\\f0\\fs48\\cf1\n${esc}\\par\n}`;
}
