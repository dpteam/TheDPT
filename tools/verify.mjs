// Проверки: структура файлов + реальный запуск того, что можно запустить.
// Пишет docs/VERIFY.md и падает с ненулевым кодом, если что-то сломано.

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import zlib from 'node:zlib';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { crc32 } from './lib/png.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dpt = path.join(root, 'dpt');
const file = (name) => path.join(dpt, name);
const read = (name) => fs.readFileSync(file(name));
const has = (name) => fs.existsSync(file(name));

const results = [];
const ok = (section, name, detail) => results.push({ section, name, status: 'ok', detail });
const fail = (section, name, detail) => results.push({ section, name, status: 'fail', detail });
const skip = (section, name, detail) => results.push({ section, name, status: 'skip', detail });

function check(section, name, fn) {
  try {
    const detail = fn();
    ok(section, name, detail || 'ок');
  } catch (error) {
    fail(section, name, error.message);
  }
}

const assert = (cond, message) => {
  if (!cond) throw new Error(message);
};

/* ───────────────────────── структура ───────────────────────── */

check('Картинки', 'PNG', () => {
  const b = read('DPT.png');
  assert(b.subarray(0, 8).toString('hex') === '89504e470d0a1a0a', 'нет сигнатуры PNG');
  const width = b.readUInt32BE(16);
  const height = b.readUInt32BE(20);
  const idat = [];
  let pos = 8;
  let sawEnd = false;
  while (pos < b.length) {
    const len = b.readUInt32BE(pos);
    const type = b.toString('latin1', pos + 4, pos + 8);
    if (type === 'IDAT') idat.push(b.subarray(pos + 8, pos + 8 + len));
    if (type === 'IEND') sawEnd = true;
    pos += 12 + len;
  }
  assert(sawEnd, 'нет IEND');
  const raw = zlib.inflateSync(Buffer.concat(idat));
  assert(raw.length === (width * 4 + 1) * height, 'несжатый растр не того размера');
  return `${width}×${height}, IDAT ${idat.length} шт.`;
});

check('Картинки', 'SVG', () => {
  const text = read('DPT.svg').toString('utf8');
  assert(text.startsWith('<svg'), 'нет корневого <svg>');
  const rects = (text.match(/<rect/g) || []).length;
  assert(text.trim().endsWith('</svg>'), 'нет закрывающего тега');
  return `${rects} прямоугольников`;
});

check('Картинки', 'GIF', () => {
  const b = read('DPT.gif');
  assert(b.toString('latin1', 0, 6) === 'GIF89a', 'нет сигнатуры GIF89a');
  assert(b[b.length - 1] === 0x3b, 'нет трейлера 0x3B');
  const frames = b.filter((byte, i) => byte === 0x2c && b[i + 9] !== undefined).length;
  return `${b.readUInt16LE(6)}×${b.readUInt16LE(8)}, кадров ~${frames}`;
});

check('Картинки', 'BMP', () => {
  const b = read('DPT.bmp');
  assert(b.toString('latin1', 0, 2) === 'BM', 'нет сигнатуры BM');
  assert(b.readUInt32LE(2) === b.length, 'размер в заголовке не совпал с файлом');
  return `${b.readInt32LE(18)}×${b.readInt32LE(22)}, ${b.readUInt16LE(28)} бит`;
});

check('Картинки', 'TGA', () => {
  const b = read('DPT.tga');
  assert(b[2] === 2, 'тип изображения не 2');
  return `${b.readUInt16LE(12)}×${b.readUInt16LE(14)}, ${b[16]} бит`;
});

check('Картинки', 'ICO / CUR', () => {
  const b = read('DPT.ico');
  assert(b.readUInt16LE(0) === 0 && b.readUInt16LE(2) === 1, 'не ICO-контейнер');
  const count = b.readUInt16LE(4);
  for (let i = 0; i < count; i++) {
    const at = 6 + i * 16;
    const size = b.readUInt32LE(at + 8);
    const offset = b.readUInt32LE(at + 12);
    assert(offset + size <= b.length, `иконка ${i} вылезает за файл`);
  }
  return `${count} размеров`;
});

check('Картинки', 'Netpbm', () => {
  const ppm = read('DPT.ppm');
  assert(ppm.toString('latin1', 0, 2) === 'P6', 'PPM не P6');
  const dims = ppm.toString('latin1', 0, 64).match(/^P6\s+#[^\n]*\n(\d+) (\d+)\s+255\s/s);
  assert(dims, 'не разобрал заголовок');
  return `${dims[1]}×${dims[2]}`;
});

check('Картинки', 'XBM / XPM', () => {
  const xbm = read('DPT.xbm').toString('utf8');
  assert(xbm.includes('#define dpt_width 256'), 'нет ширины в XBM');
  const xpm = read('DPT.xpm').toString('utf8');
  assert(xpm.includes('static char *dpt[]'), 'нет массива в XPM');
  return 'C-исходники на месте';
});

check('Звук', 'WAV', () => {
  const b = read('DPT.wav');
  assert(b.toString('latin1', 0, 4) === 'RIFF', 'нет RIFF');
  assert(b.toString('latin1', 8, 12) === 'WAVE', 'нет WAVE');
  const rate = b.readUInt32LE(24);
  const data = b.readUInt32LE(40);
  return `${rate} Гц, ${(data / 2 / rate).toFixed(2)} с`;
});

check('Звук', 'AIFF', () => {
  const b = read('DPT.aiff');
  assert(b.toString('latin1', 0, 4) === 'FORM', 'нет FORM');
  assert(b.toString('latin1', 8, 12) === 'AIFF', 'не AIFF');
  return `${b.readUInt32BE(22)} кадров`;
});

check('Звук', 'AU', () => {
  const b = read('DPT.au');
  assert(b.toString('latin1', 0, 4) === '.snd', 'нет .snd');
  return `${b.readUInt32BE(16)} Гц, μ-law`;
});

check('Звук', 'MIDI', () => {
  const b = read('DPT.mid');
  assert(b.toString('latin1', 0, 4) === 'MThd', 'нет MThd');
  assert(b.readUInt16BE(10) === 1, 'не одна дорожка');
  assert(b.toString('latin1', 14, 18) === 'MTrk', 'нет MTrk');
  return `${b.readUInt32BE(18)} байт дорожки`;
});

check('Архивы', 'ZIP и его родня', () => {
  const names = ['DPT.zip', 'DPT.jar', 'DPT.war', 'DPT.whl', 'DPT.apk', 'DPT.nupkg'];
  const report = [];
  for (const name of names) {
    const b = read(name);
    let eocd = -1;
    for (let i = b.length - 22; i >= 0; i--) {
      if (b.readUInt32LE(i) === 0x06054b50) {
        eocd = i;
        break;
      }
    }
    assert(eocd >= 0, `${name}: нет EOCD`);
    const count = b.readUInt16LE(eocd + 10);
    const cdOffset = b.readUInt32LE(eocd + 16);
    let p = cdOffset;
    for (let i = 0; i < count; i++) {
      assert(b.readUInt32LE(p) === 0x02014b50, `${name}: плохой central header`);
      const crc = b.readUInt32LE(p + 16);
      const size = b.readUInt32LE(p + 24);
      const nameLen = b.readUInt16LE(p + 28);
      const extraLen = b.readUInt16LE(p + 30);
      const commentLen = b.readUInt16LE(p + 32);
      const localOffset = b.readUInt32LE(p + 42);
      const localNameLen = b.readUInt16LE(localOffset + 26);
      const localExtraLen = b.readUInt16LE(localOffset + 28);
      const dataStart = localOffset + 30 + localNameLen + localExtraLen;
      const data = b.subarray(dataStart, dataStart + size);
      assert(crc32(data) === crc, `${name}: CRC не сошёлся`);
      p += 46 + nameLen + extraLen + commentLen;
    }
    report.push(`${name}: ${count} файл(ов)`);
  }
  return report.join(', ');
});

check('Архивы', 'TAR', () => {
  const b = read('DPT.tar');
  assert(b.toString('latin1', 257, 262) === 'ustar', 'нет магии ustar');
  const stored = parseInt(b.toString('latin1', 148, 156).replace(/\0/g, '').trim(), 8);
  const header = Buffer.from(b.subarray(0, 512));
  header.fill(0x20, 148, 156);
  let sum = 0;
  for (const byte of header) sum += byte;
  assert(sum === stored, `контрольная сумма ${sum} != ${stored}`);
  return `${b.toString('latin1', 0, 7)}, ${b.length} байт`;
});

check('Архивы', 'GZIP', () => {
  const b = read('DPT.gz');
  assert(b[0] === 0x1f && b[1] === 0x8b, 'нет gzip-магии');
  const text = zlib.gunzipSync(b).toString('utf8');
  assert(text.includes('DPT'), 'внутри не DPT');
  const tgz = zlib.gunzipSync(read('DPT.tar.gz'));
  assert(tgz.toString('latin1', 257, 262) === 'ustar', 'внутри tgz не tar');
  return 'gzip и tar.gz распаковываются';
});

check('Архивы', 'Brotli', () => {
  const text = zlib.brotliDecompressSync(read('DPT.br')).toString('utf8');
  assert(text.includes('DPT'), 'внутри не DPT');
  return 'распаковывается';
});

check('Документы', 'PDF', () => {
  const b = read('DPT.pdf');
  const text = b.toString('latin1');
  assert(text.startsWith('%PDF-1.4'), 'не PDF 1.4');
  const startxref = Number(text.match(/startxref\s+(\d+)/)[1]);
  assert(text.slice(startxref, startxref + 4) === 'xref', 'startxref не указывает на xref');
  assert(text.includes('(DPT) Tj'), 'нет текста DPT');
  return `${b.length} байт, xref на ${startxref}`;
});

check('Документы', 'DOCX / XLSX / ODT / EPUB', () => {
  const names = ['DPT.docx', 'DPT.xlsx', 'DPT.odt', 'DPT.epub'];
  const out = [];
  for (const name of names) {
    const b = read(name);
    const text = b.toString('utf8');
    assert(text.includes('DPT'), `${name}: нет DPT внутри`);
    assert(text.includes('[Content_Types].xml') || text.includes('mimetype') || text.includes('META-INF'), `${name}: нет обязательных частей`);
    out.push(name.replace('DPT.', ''));
  }
  return out.join(', ');
});

check('Шрифты', 'TrueType', () => {
  const b = read('DPT.ttf');
  assert(b.readUInt32BE(0) === 0x00010000, 'не TrueType');
  const numTables = b.readUInt16BE(4);
  let headOffset = -1;
  for (let i = 0; i < numTables; i++) {
    const at = 12 + i * 16;
    const tag = b.toString('latin1', at, at + 4);
    const offset = b.readUInt32BE(at + 8);
    const length = b.readUInt32BE(at + 12);
    assert(offset + length <= b.length, `${tag} вылезает за файл`);
    if (tag === 'head') headOffset = offset;
  }
  assert(headOffset > 0, 'нет таблицы head');
  assert(b.readUInt32BE(headOffset + 12) === 0x5f0f3cf5, 'нет магии head');
  return `${numTables} таблиц`;
});

check('Шрифты', 'WOFF', () => {
  const b = read('DPT.woff');
  assert(b.toString('latin1', 0, 4) === 'wOFF', 'нет сигнатуры wOFF');
  const numTables = b.readUInt16BE(12);
  let restored = 0;
  for (let i = 0; i < numTables; i++) {
    const at = 44 + i * 20;
    const offset = b.readUInt32BE(at + 4);
    const compLength = b.readUInt32BE(at + 8);
    const origLength = b.readUInt32BE(at + 12);
    const raw = zlib.inflateSync(b.subarray(offset, offset + compLength));
    assert(raw.length === origLength, 'длина после распаковки не та');
    restored += raw.length;
  }
  return `${numTables} таблиц, ${restored} байт после распаковки`;
});

check('Шрифты', 'BDF / PSF / AFM', () => {
  const bdf = read('DPT.bdf').toString('utf8');
  assert(bdf.startsWith('STARTFONT'), 'BDF без STARTFONT');
  assert(bdf.includes('CHARS 3') && bdf.trim().endsWith('ENDFONT'), 'BDF неполный');
  const psf = read('DPT.psf');
  assert(psf[0] === 0x36 && psf[1] === 0x04, 'нет магии PSF1');
  assert(psf.length === 4 + 256 * psf[3], 'размер PSF не сходится');
  const afm = read('DPT.afm').toString('utf8');
  assert(afm.includes('StartFontMetrics') && afm.includes('EndFontMetrics'), 'AFM неполный');
  return 'три формата на месте';
});

check('Прочее', 'WebAssembly', () => {
  const b = read('DPT.wasm');
  assert(b.subarray(0, 4).toString('hex') === '0061736d', 'нет магии \\0asm');
  assert(b.readUInt32LE(4) === 1, 'версия не 1');
  assert(b.includes('DPT'), 'нет данных DPT');
  return `${b.length} байт`;
});

check('Прочее', 'gettext .mo', () => {
  const b = read('DPT.mo');
  assert(b.readUInt32LE(0) === 0x950412de, 'нет магии .mo');
  const count = b.readUInt32LE(8);
  return `${count} строка(и)`;
});

check('Прочее', 'BitTorrent', () => {
  const b = read('DPT.torrent');
  assert(b[0] === 0x64, 'не словарь bencode');
  const text = b.toString('latin1');
  assert(text.includes('8:announce') && text.includes('4:info') && text.includes('3:DPT'), 'нет обязательных ключей');
  return `${b.length} байт`;
});

check('Прочее', 'PEM и подпись', () => {
  const privateKey = crypto.createPrivateKey(read('DPT.pem'));
  const publicKey = crypto.createPublicKey(read('DPT.pub'));
  const valid = crypto.verify('sha256', Buffer.from('DPT'), publicKey, read('DPT.sig'));
  assert(valid, 'подпись не сходится');
  const bits = privateKey.asymmetricKeyDetails?.modulusLength ?? 0;
  assert(bits === 2048, `ключ не 2048 бит, а ${bits}`);
  return 'RSA-2048, подпись проверена';
});

check('Прочее', 'Кодировки', () => {
  assert(Buffer.from(read('DPT.b64').toString().trim(), 'base64').toString() === 'DPT\n', 'base64 не сходится');
  assert(read('DPT.hex').toString().trim() === '4450540a', 'hex не сходится');
  assert(read('DPT.morse').toString().trim() === '-.. .--. -', 'морзянка не та');
  return 'base64, hex, morse';
});

check('Прочее', 'ни один файл не пустой', () => {
  const files = fs.readdirSync(dpt);
  const empty = files.filter((f) => fs.statSync(file(f)).size === 0);
  assert(empty.length === 0, `пустые: ${empty.join(', ')}`);
  return `${files.length} файлов`;
});

check('Прочее', 'все файлы названы DPT', () => {
  const bad = fs.readdirSync(dpt).filter((f) => f !== 'DPT' && !f.startsWith('DPT.'));
  assert(bad.length === 0, `не по правилам: ${bad.join(', ')}`);
  return 'правило соблюдено';
});

/* ───────────────────────── запуск ───────────────────────── */

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'dpt-verify-'));

function run(cmd, args, cwd = root) {
  return execFileSync(cmd, args, { cwd, encoding: 'utf8', timeout: 60000, stdio: ['ignore', 'pipe', 'pipe'] });
}

function expectDpt(section, name, cmd, args) {
  try {
    const out = run(cmd, args).trim();
    if (!out.includes('DPT')) throw new Error(`вывод без DPT: ${out.slice(0, 60)}`);
    ok(section, name, `вывод: ${out.split('\n')[0].slice(0, 40)}`);
  } catch (error) {
    if (error.code === 'ENOENT') skip(section, name, `${cmd} не установлен`);
    else fail(section, name, String(error.message).split('\n')[0].slice(0, 90));
  }
}

expectDpt('Запуск', 'Python', 'python', ['dpt/DPT.py']);
expectDpt('Запуск', 'JavaScript', 'node', ['dpt/DPT.js']);
expectDpt('Запуск', 'JavaScript (ESM)', 'node', ['dpt/DPT.mjs']);
expectDpt('Запуск', 'CommonJS', 'node', ['dpt/DPT.cjs']);
expectDpt('Запуск', 'PowerShell', 'powershell', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', 'dpt/DPT.ps1']);
expectDpt('Запуск', 'Batch', 'cmd', ['/c', path.join('dpt', 'DPT.bat')]);

check('Запуск', 'Shell (bash)', () => {
  const out = run('bash', ['dpt/DPT.sh']).trim();
  assert(out.includes('DPT'), 'вывод без DPT');
  return 'вывод: DPT';
});

check('Запуск', 'C', () => {
  const exe = path.join(tmp, 'dpt-c.exe');
  run('gcc', ['-O2', '-o', exe, 'dpt/DPT.c']);
  const out = run(exe, []).trim();
  assert(out === 'DPT', `вывод: ${out}`);
  return 'gcc собрал и запустил';
});

check('Запуск', 'C++', () => {
  const exe = path.join(tmp, 'dpt-cpp.exe');
  run('g++', ['-O2', '-o', exe, 'dpt/DPT.cpp']);
  const out = run(exe, []).trim();
  assert(out === 'DPT', `вывод: ${out}`);
  return 'g++ собрал и запустил';
});

check('Запуск', 'Rust', () => {
  const exe = path.join(tmp, 'dpt-rs.exe');
  run('rustc', ['-O', '-o', exe, 'dpt/DPT.rs']);
  const out = run(exe, []).trim();
  assert(out === 'DPT', `вывод: ${out}`);
  return 'rustc собрал и запустил';
});

check('Запуск', 'Java', () => {
  const outDir = path.join(tmp, 'java');
  fs.mkdirSync(outDir, { recursive: true });
  run('javac', ['-d', outDir, 'dpt/DPT.java']);
  const out = run('java', ['-cp', outDir, 'DPT']).trim();
  assert(out === 'DPT', `вывод: ${out}`);
  return 'javac + java';
});

check('Запуск', 'Brainfuck', () => {
  // крошечный интерпретатор прямо здесь, чтобы проверить DPT.bf
  const code = fs.readFileSync(file('DPT.bf'), 'utf8').replace(/[^+\-<>.,[\]]/g, '');
  const tape = new Uint8Array(30000);
  let ptr = 0;
  let pc = 0;
  const jumps = [];
  const stack = [];
  for (let i = 0; i < code.length; i++) {
    if (code[i] === '[') stack.push(i);
    if (code[i] === ']') {
      const open = stack.pop();
      jumps[open] = i;
      jumps[i] = open;
    }
  }
  let out = '';
  let steps = 0;
  while (pc < code.length && steps++ < 1e6) {
    const op = code[pc];
    if (op === '+') tape[ptr] = (tape[ptr] + 1) & 0xff;
    else if (op === '-') tape[ptr] = (tape[ptr] - 1) & 0xff;
    else if (op === '>') ptr++;
    else if (op === '<') ptr--;
    else if (op === '.') out += String.fromCharCode(tape[ptr]);
    else if (op === '[' && tape[ptr] === 0) pc = jumps[pc];
    else if (op === ']' && tape[ptr] !== 0) pc = jumps[pc];
    pc++;
  }
  assert(out === 'DPT', `вывод: ${out}`);
  return 'интерпретатор напечатал DPT';
});

check('Запуск', 'Whitespace', () => {
  const src = fs.readFileSync(file('DPT.ws'), 'utf8');
  const stack = [];
  let out = '';
  let i = 0;
  const readNumber = () => {
    const sign = src[i++] === ' ' ? 1 : -1;
    let value = 0;
    while (src[i] !== '\n') value = value * 2 + (src[i++] === '\t' ? 1 : 0);
    i++;
    return value * sign;
  };
  while (i < src.length) {
    if (src[i] === ' ') {
      i++;
      if (src[i] === ' ') {
        i++;
        stack.push(readNumber());
      } else break;
    } else if (src[i] === '\t') {
      i++;
      if (src[i] === '\n') {
        i++;
        if (src[i] === ' ') {
          i++;
          if (src[i] === ' ') {
            i++;
            out += String.fromCharCode(stack.pop() ?? 0);
          } else break;
        } else break;
      } else break;
    } else {
      i++;
      break;
    }
  }
  assert(out === 'DPT', `вывод: ${JSON.stringify(out)}`);
  return 'интерпретатор напечатал DPT';
});

check('Запуск', 'Befunge-93', () => {
  const src = fs.readFileSync(file('DPT.b93'), 'utf8').replace(/\n$/, '');
  const stack = [];
  let out = '';
  let x = 0;
  let mode = false;
  while (x < src.length) {
    const ch = src[x];
    if (mode) {
      if (ch === '"') mode = false;
      else stack.push(ch.charCodeAt(0));
    } else if (ch === '"') mode = true;
    else if (ch === ',') out += String.fromCharCode(stack.pop() ?? 0);
    else if (ch === '@') break;
    x++;
  }
  assert(out === 'DPT', `вывод: ${JSON.stringify(out)}`);
  return 'интерпретатор напечатал DPT';
});

check('Запуск', 'Piet', () => {
  skip('Запуск', 'Piet', 'не реализовано, см. docs/HOW-IT-WORKS.md');
});

/* ───────────────────────── отчёт ───────────────────────── */

const sections = [...new Set(results.map((r) => r.section))];
const icon = { ok: '✅', fail: '❌', skip: '⏭️' };
const passed = results.filter((r) => r.status === 'ok').length;
const failed = results.filter((r) => r.status === 'fail').length;
const skipped = results.filter((r) => r.status === 'skip').length;

const md = `# Отчёт проверок

Сгенерировано \`node tools/verify.mjs\` на ${os.type()} ${os.release()}, Node ${process.version}.

**Итого:** ${passed} ✅ · ${failed} ❌ · ${skipped} ⏭️

${sections
  .map((section) => {
    const rows = results.filter((r) => r.section === section);
    return `## ${section}

| Проверка | Результат | Детали |
| --- | :---: | --- |
${rows.map((r) => `| ${r.name} | ${icon[r.status]} | ${String(r.detail).replace(/\|/g, '\\|')} |`).join('\n')}
`;
  })
  .join('\n')}
## Что здесь не проверяется

Форматы, для которых нет ни тулчейна, ни валидатора в системе (Zig, Nim, D, COBOL, Ada,
VHDL и прочие) помечены в \`docs/FORMATS.md\` как «написано по спецификации». Их синтаксис
сверялся глазами, а не компилятором — если найдёте ошибку, это хороший issue.
`;

fs.writeFileSync(path.join(root, 'docs/VERIFY.md'), md);
fs.rmSync(tmp, { recursive: true, force: true });

console.log(`проверок: ${results.length} → ✅ ${passed} · ❌ ${failed} · ⏭️ ${skipped}`);
for (const r of results.filter((x) => x.status === 'fail')) console.log(`  ❌ ${r.section}/${r.name}: ${r.detail}`);
process.exit(failed ? 1 : 0);
