// Шрифты: BDF, PSF, AFM — текстом и байтами. TTF/WOFF собираем вручную по таблицам.

import zlib from 'node:zlib';
import { add } from './util.mjs';
import { GLYPHS, GLYPH_W } from '../lib/render.mjs';

const CELL = 128; // единиц на клетку сетки 5x7
const ROWS = 7;
const COLS = GLYPH_W;
const CAP = CELL * ROWS; // 896
const ADVANCE = CELL * GLYPH_W + 192;

/** Контуры глифа из пиксельной сетки: каждый включённый пиксель — прямоугольник. */
function contours(ch) {
  const glyph = GLYPHS[ch];
  const out = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (glyph[r][c] !== '1') continue;
      const x0 = c * CELL + 64;
      const x1 = x0 + CELL;
      const y1 = CAP - r * CELL;
      const y0 = y1 - CELL;
      out.push([
        [x0, y0],
        [x1, y0],
        [x1, y1],
        [x0, y1],
      ]);
    }
  }
  return out;
}

function glyfEntry(points) {
  if (points.length === 0) return Buffer.alloc(0);
  const flat = points.flat();
  const xs = flat.map((p) => p[0]);
  const ys = flat.map((p) => p[1]);
  const head = Buffer.alloc(10);
  head.writeInt16BE(points.length, 0);
  head.writeInt16BE(Math.min(...xs), 2);
  head.writeInt16BE(Math.min(...ys), 4);
  head.writeInt16BE(Math.max(...xs), 6);
  head.writeInt16BE(Math.max(...ys), 8);

  const ends = Buffer.alloc(points.length * 2);
  points.forEach((_, i) => ends.writeUInt16BE((i + 1) * 4 - 1, i * 2));

  const instrLen = Buffer.alloc(2);
  const flags = Buffer.alloc(flat.length, 0x01); // on-curve, координаты по 2 байта
  const xCoords = Buffer.alloc(flat.length * 2);
  const yCoords = Buffer.alloc(flat.length * 2);
  // В glyf координаты хранятся как разности с предыдущей точкой.
  let prevX = 0;
  let prevY = 0;
  flat.forEach(([x, y], i) => {
    xCoords.writeInt16BE(x - prevX, i * 2);
    yCoords.writeInt16BE(y - prevY, i * 2);
    prevX = x;
    prevY = y;
  });
  return Buffer.concat([head, ends, instrLen, flags, xCoords, yCoords]);
}

const pad4 = (buf) => {
  const rem = buf.length % 4;
  return rem === 0 ? buf : Buffer.concat([buf, Buffer.alloc(4 - rem)]);
};

const tableChecksum = (buf) => {
  const padded = pad4(buf);
  let sum = 0;
  for (let i = 0; i < padded.length; i += 4) sum = (sum + padded.readUInt32BE(i)) >>> 0;
  return sum;
};

function buildTTF() {
  const glyphs = [Buffer.alloc(0), ...['D', 'P', 'T'].map((c) => glyfEntry(contours(c)))];
  const loca = Buffer.alloc((glyphs.length + 1) * 2);
  let offset = 0;
  glyphs.forEach((g, i) => {
    loca.writeUInt16BE(offset / 2, i * 2);
    offset += g.length;
  });
  loca.writeUInt16BE(offset / 2, glyphs.length * 2);
  const glyf = Buffer.concat(glyphs);

  const head = Buffer.alloc(54);
  head.writeUInt32BE(0x00010000, 0);
  head.writeUInt32BE(0x00010000, 4);
  head.writeUInt32BE(0, 8); // checkSumAdjustment — считается в конце
  head.writeUInt32BE(0x5f0f3cf5, 12);
  head.writeUInt16BE(0x0003, 16);
  head.writeUInt16BE(1024, 18);
  const secs = 3888000000;
  head.writeUInt32BE(0, 20);
  head.writeUInt32BE(secs, 24);
  head.writeUInt32BE(0, 28);
  head.writeUInt32BE(secs, 32);
  head.writeInt16BE(64, 36);
  head.writeInt16BE(0, 38);
  head.writeInt16BE(ADVANCE - 192, 40);
  head.writeInt16BE(CAP, 42);
  head.writeUInt16BE(0, 44);
  head.writeUInt16BE(8, 46);
  head.writeInt16BE(2, 48);
  head.writeInt16BE(0, 50); // short loca
  head.writeInt16BE(0, 52);

  const hhea = Buffer.alloc(36);
  hhea.writeUInt32BE(0x00010000, 0);
  hhea.writeInt16BE(CAP, 4);
  hhea.writeInt16BE(-128, 6);
  hhea.writeInt16BE(0, 8);
  hhea.writeUInt16BE(ADVANCE, 10);
  hhea.writeInt16BE(64, 12);
  hhea.writeInt16BE(0, 14);
  hhea.writeInt16BE(ADVANCE - 192, 16);
  hhea.writeInt16BE(1, 18);
  hhea.writeInt16BE(0, 20);
  hhea.writeInt16BE(0, 22);
  for (let i = 12; i < 17; i++) hhea.writeInt16BE(0, i * 2);
  hhea.writeUInt16BE(glyphs.length, 34);

  const maxp = Buffer.alloc(32);
  maxp.writeUInt32BE(0x00010000, 0);
  maxp.writeUInt16BE(glyphs.length, 4);
  maxp.writeUInt16BE(28 * 4, 6); // maxPoints
  maxp.writeUInt16BE(28, 8); // maxContours
  maxp.writeUInt16BE(0, 10);
  maxp.writeUInt16BE(0, 12);
  maxp.writeUInt16BE(2, 14);
  maxp.writeUInt16BE(0, 16);
  maxp.writeUInt16BE(0, 18);
  for (let i = 10; i < 16; i++) maxp.writeUInt16BE(0, i * 2);

  const hmtx = Buffer.alloc(glyphs.length * 4);
  glyphs.forEach((_, i) => {
    hmtx.writeUInt16BE(ADVANCE, i * 4);
    hmtx.writeInt16BE(64, i * 4 + 2);
  });

  // cmap format 4: три одиночных сегмента + терминатор
  const segments = [
    { start: 0x44, end: 0x44, delta: 1 - 0x44 },
    { start: 0x50, end: 0x50, delta: 2 - 0x50 },
    { start: 0x54, end: 0x54, delta: 3 - 0x54 },
    { start: 0xffff, end: 0xffff, delta: 1 },
  ];
  const segCount = segments.length;
  const sub = Buffer.alloc(14 + segCount * 8 + 2);
  let p = 0;
  sub.writeUInt16BE(4, p); p += 2;
  sub.writeUInt16BE(sub.length, p); p += 2;
  sub.writeUInt16BE(0, p); p += 2;
  sub.writeUInt16BE(segCount * 2, p); p += 2;
  sub.writeUInt16BE(8, p); p += 2; // searchRange
  sub.writeUInt16BE(2, p); p += 2; // entrySelector
  sub.writeUInt16BE(0, p); p += 2; // rangeShift
  for (const s of segments) { sub.writeUInt16BE(s.end, p); p += 2; }
  sub.writeUInt16BE(0, p); p += 2;
  for (const s of segments) { sub.writeUInt16BE(s.start, p); p += 2; }
  for (const s of segments) { sub.writeUInt16BE(s.delta & 0xffff, p); p += 2; }
  for (let i = 0; i < segCount; i++) { sub.writeUInt16BE(0, p); p += 2; }

  const cmap = Buffer.concat([
    Buffer.from([0, 0, 0, 1]), // version, numTables
    Buffer.from([0, 3, 0, 1, 0, 0, 0, 12]), // platform 3, encoding 1, offset 12
    sub,
  ]);

  const nameStrings = ['DPT', 'Regular', 'DPT Regular 1.0', 'DPT', 'Version 1.0', 'DPT-Regular'];
  const nameParts = [];
  let nameDataLen = 0;
  nameStrings.forEach((s, i) => {
    const utf16 = Buffer.from(s, 'utf16le').swap16();
    nameParts.push({ id: i, len: utf16.length, offset: nameDataLen, data: utf16 });
    nameDataLen += utf16.length;
  });
  const nameHeader = Buffer.alloc(6);
  nameHeader.writeUInt16BE(0, 0);
  nameHeader.writeUInt16BE(nameStrings.length, 2);
  nameHeader.writeUInt16BE(6 + nameStrings.length * 12, 4);
  const nameRecords = Buffer.alloc(nameStrings.length * 12);
  nameParts.forEach((r, i) => {
    const at = i * 12;
    nameRecords.writeUInt16BE(3, at);
    nameRecords.writeUInt16BE(1, at + 2);
    nameRecords.writeUInt16BE(0x409, at + 4);
    nameRecords.writeUInt16BE(r.id, at + 6);
    nameRecords.writeUInt16BE(r.len, at + 8);
    nameRecords.writeUInt16BE(r.offset, at + 10);
  });
  const name = Buffer.concat([nameHeader, nameRecords, ...nameParts.map((r) => r.data)]);

  const post = Buffer.alloc(32);
  post.writeUInt32BE(0x00030000, 0);

  const os2 = Buffer.alloc(96);
  os2.writeUInt16BE(4, 0); // version
  os2.writeInt16BE(ADVANCE, 2); // xAvgCharWidth
  os2.writeUInt16BE(400, 4); // usWeightClass
  os2.writeUInt16BE(5, 6); // usWidthClass
  os2.writeUInt16BE(0, 8); // fsType
  os2.writeInt16BE(650, 10);
  os2.writeInt16BE(699, 12);
  os2.writeInt16BE(0, 14);
  os2.writeInt16BE(140, 16);
  os2.writeInt16BE(650, 18);
  os2.writeInt16BE(699, 20);
  os2.writeInt16BE(0, 22);
  os2.writeInt16BE(479, 24);
  os2.writeInt16BE(50, 26);
  os2.writeInt16BE(250, 28);
  os2.writeInt16BE(0, 30); // sFamilyClass
  // panose — нули (32..41)
  os2.writeUInt32BE(0, 42);
  os2.writeUInt32BE(0, 46);
  os2.writeUInt32BE(0, 50);
  os2.writeUInt32BE(0, 54);
  os2.write('DPT ', 58, 'latin1'); // achVendID
  os2.writeUInt16BE(0x0040, 62); // fsSelection: regular
  os2.writeUInt16BE(0x44, 64); // usFirstCharIndex
  os2.writeUInt16BE(0x54, 66); // usLastCharIndex
  os2.writeInt16BE(CAP, 68); // sTypoAscender
  os2.writeInt16BE(-128, 70); // sTypoDescender
  os2.writeInt16BE(0, 72); // sTypoLineGap
  os2.writeUInt16BE(CAP, 74); // usWinAscent
  os2.writeUInt16BE(128, 76); // usWinDescent
  os2.writeUInt32BE(1, 78); // ulCodePageRange1
  os2.writeUInt32BE(0, 82);
  os2.writeInt16BE(CELL * 5, 86); // sxHeight
  os2.writeInt16BE(CAP, 88); // sCapHeight
  os2.writeUInt16BE(0, 90); // usDefaultChar
  os2.writeUInt16BE(0x44, 92); // usBreakChar
  os2.writeUInt16BE(1, 94); // usMaxContext

  const tables = [
    { tag: 'OS/2', data: os2 },
    { tag: 'cmap', data: cmap },
    { tag: 'glyf', data: glyf },
    { tag: 'head', data: head },
    { tag: 'hhea', data: hhea },
    { tag: 'hmtx', data: hmtx },
    { tag: 'loca', data: loca },
    { tag: 'maxp', data: maxp },
    { tag: 'name', data: name },
    { tag: 'post', data: post },
  ];

  const numTables = tables.length;
  let searchRange = 1;
  let entrySelector = 0;
  while (searchRange * 2 <= numTables) {
    searchRange *= 2;
    entrySelector++;
  }
  searchRange *= 16;
  const header = Buffer.alloc(12);
  header.writeUInt32BE(0x00010000, 0);
  header.writeUInt16BE(numTables, 4);
  header.writeUInt16BE(searchRange, 6);
  header.writeUInt16BE(entrySelector, 8);
  header.writeUInt16BE(numTables * 16 - searchRange, 10);

  const dir = Buffer.alloc(numTables * 16);
  let dataOffset = 12 + dir.length;
  const chunks = [];
  tables.forEach((t, i) => {
    const at = i * 16;
    dir.write(t.tag, at, 'latin1');
    dir.writeUInt32BE(tableChecksum(t.data), at + 4);
    dir.writeUInt32BE(dataOffset, at + 8);
    dir.writeUInt32BE(t.data.length, at + 12);
    const padded = pad4(t.data);
    chunks.push(padded);
    dataOffset += padded.length;
  });

  const font = Buffer.concat([header, dir, ...chunks]);
  const headIndex = tables.findIndex((t) => t.tag === 'head');
  const headOffset = font.readUInt32BE(12 + headIndex * 16 + 8);
  const adjustment = (0xb1b0afba - tableChecksum(font)) >>> 0;
  font.writeUInt32BE(adjustment, headOffset + 8);
  return font;
}

/** WOFF 1.0: те же таблицы, каждая сжата zlib. */
function buildWOFF(sfnt) {
  const numTables = sfnt.readUInt16BE(4);
  const entries = [];
  for (let i = 0; i < numTables; i++) {
    const at = 12 + i * 16;
    const tag = sfnt.toString('latin1', at, at + 4);
    const checksum = sfnt.readUInt32BE(at + 4);
    const offset = sfnt.readUInt32BE(at + 8);
    const length = sfnt.readUInt32BE(at + 12);
    const raw = sfnt.subarray(offset, offset + length);
    entries.push({ tag, checksum, raw, comp: zlib.deflateSync(raw, { level: 9 }) });
  }
  const dirSize = numTables * 20;
  let offset = 44 + dirSize;
  const dir = Buffer.alloc(dirSize);
  const chunks = [];
  entries.forEach((e, i) => {
    const at = i * 20;
    dir.write(e.tag, at, 'latin1');
    dir.writeUInt32BE(offset, at + 4);
    dir.writeUInt32BE(e.comp.length, at + 8);
    dir.writeUInt32BE(e.raw.length, at + 12);
    dir.writeUInt32BE(e.checksum, at + 16);
    const padded = Buffer.concat([e.comp, Buffer.alloc((4 - (e.comp.length % 4)) % 4)]);
    chunks.push(padded);
    offset += padded.length;
  });
  const header = Buffer.alloc(44);
  header.write('wOFF', 0, 'latin1');
  header.writeUInt32BE(0x00010000, 4);
  header.writeUInt32BE(offset, 8);
  header.writeUInt16BE(numTables, 12);
  header.writeUInt16BE(0, 14);
  header.writeUInt32BE(sfnt.length, 16);
  header.writeUInt16BE(1, 20);
  header.writeUInt16BE(0, 22);
  return Buffer.concat([header, dir, ...chunks]);
}

export function fonts() {
  /* BDF — текстовый формат X11 */
  const bdfGlyph = (ch) => {
    const glyph = GLYPHS[ch];
    const rows = glyph.map((row) => {
      let byte = 0;
      for (let i = 0; i < row.length; i++) if (row[i] === '1') byte |= 0x80 >> i;
      return byte.toString(16).padStart(2, '0').toUpperCase();
    });
    return `STARTCHAR ${ch}
ENCODING ${ch.charCodeAt(0)}
SWIDTH 500 0
DWIDTH 8 0
BBX 5 7 1 5
BITMAP
${rows.join('\n')}
ENDCHAR
`;
  };
  add('dpt/DPT.bdf', `STARTFONT 2.1
COMMENT TheDPT — DartPower Team
FONT -dpt-DPT-Medium-R-Normal--16-160-75-75-C-80-ISO10646-1
SIZE 16 75 75
FONTBOUNDINGBOX 8 16 0 -4
STARTPROPERTIES 3
FONT_ASCENT 12
FONT_DESCENT 4
DEFAULT_CHAR 32
ENDPROPERTIES
CHARS 3
${bdfGlyph('D')}${bdfGlyph('P')}${bdfGlyph('T')}ENDFONT
`);

  /* PSF1 — консольный шрифт Linux, 8x16 */
  const psf = Buffer.alloc(4 + 256 * 16);
  psf[0] = 0x36;
  psf[1] = 0x04;
  psf[2] = 0x00; // 256 символов
  psf[3] = 16; // высота
  for (const [ch, index] of [['D', 68], ['P', 80], ['T', 84]]) {
    const glyph = GLYPHS[ch];
    for (let row = 0; row < 7; row++) {
      let byte = 0;
      for (let i = 0; i < row.length; i++) if (glyph[row][i] === '1') byte |= 0x80 >> i;
      psf[4 + index * 16 + row + 4] = byte;
    }
  }
  add('dpt/DPT.psf', psf);

  /* AFM — метрики для PostScript */
  add('dpt/DPT.afm', `StartFontMetrics 4.1
Comment TheDPT — DartPower Team
FontName DPT-Regular
FullName DPT
FamilyName DPT
Weight Medium
ItalicAngle 0
IsFixedPitch true
FontBBox 0 -128 ${ADVANCE} ${CAP}
UnderlinePosition -100
UnderlineThickness 50
Version 1.0
EncodingScheme FontSpecific
CapHeight ${CAP}
Ascender ${CAP}
Descender -128
StartCharMetrics 3
C 68 ; WX ${ADVANCE} ; N D ; B 64 0 ${64 + CELL * GLYPH_W} ${CAP} ;
C 80 ; WX ${ADVANCE} ; N P ; B 64 0 ${64 + CELL * GLYPH_W} ${CAP} ;
C 84 ; WX ${ADVANCE} ; N T ; B 64 0 ${64 + CELL * GLYPH_W} ${CAP} ;
EndCharMetrics
EndFontMetrics
`);

  const ttf = buildTTF();
  add('dpt/DPT.ttf', ttf);
  add('dpt/DPT.woff', buildWOFF(ttf));
}
