// Главный генератор: собирает всю кучу файлов и документацию.

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { add, flush, OUT } from './util.mjs';
import { langs } from './langs.mjs';
import { esoteric1 } from './esoteric.mjs';
import { data } from './data.mjs';
import { media } from './media.mjs';
import { office } from './office.mjs';
import { fonts } from './fonts.mjs';
import { extras } from './extras.mjs';
import { writeDocs } from './docs.mjs';
import { repo } from './repo.mjs';
import { BINARY_META } from './meta.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

const catalogue = [];
const put = (cat, entries) => {
  for (const e of entries) {
    const file = `dpt/DPT.${e.ext}`;
    if (e.body === null) continue; // такие описаны в meta.mjs
    add(file, e.body);
    catalogue.push({ file, name: e.name, note: e.note, cat });
  }
};

put('lang', langs);
put('eso', esoteric1);
put('data', data);

media(root);
office();
fonts();
extras();

for (const [file, meta] of Object.entries(BINARY_META)) {
  if (!OUT.has(file)) throw new Error(`в мете есть ${file}, а файла нет`);
  catalogue.push({ file, ...meta });
}

const known = new Set(catalogue.map((c) => c.file));
const missing = [...OUT.keys()].filter((k) => !known.has(k));
if (missing.length) throw new Error(`без описания остались: ${missing.join(', ')}`);

writeDocs(root, catalogue);
repo();

const total = flush(root);
const bytes = [...OUT.values()].reduce((n, b) => n + b.length, 0);
console.log(`файлов: ${total}`);
console.log(`из них в куче dpt/: ${catalogue.length}`);
console.log(`объём: ${(bytes / 1024).toFixed(1)} КиБ`);
