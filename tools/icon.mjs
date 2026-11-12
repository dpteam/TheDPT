// Генерирует всю графику репозитория: icon.svg, icon.png, favicon.ico, баннер.
// Запуск: node tools/icon.mjs

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { encodePNG, encodeICO } from './lib/png.mjs';
import { render, renderSVG } from './lib/render.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const assets = path.join(root, 'assets');
fs.mkdirSync(assets, { recursive: true });

const png = (size) => encodePNG(size, size, render(size));
const write = (rel, buf) => {
  fs.writeFileSync(path.join(root, rel), buf);
  console.log(`  ${rel} (${buf.length} B)`);
};

console.log('иконки:');
write('assets/icon.svg', Buffer.from(renderSVG(512), 'utf8'));
write('assets/icon.png', png(512));
for (const size of [16, 32, 48, 64, 128, 256]) {
  write(`assets/icon-${size}.png`, png(size));
}
write(
  'assets/favicon.ico',
  encodeICO([16, 32, 48, 64, 128, 256].map((size) => ({ size, png: png(size) }))),
);

// Баннер 1280x640: тёмный фон + иконка по центру.
const W = 1280;
const H = 640;
const banner = Buffer.alloc(W * H * 4);
const icon = render(512, { supersample: 3 });
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const t = y / H;
    const i = (y * W + x) * 4;
    banner[i] = Math.round(9 + t * 12);
    banner[i + 1] = Math.round(13 + t * 16);
    banner[i + 2] = Math.round(28 + t * 34);
    banner[i + 3] = 255;
  }
}
// сетка
for (let y = 0; y < H; y += 32) {
  for (let x = 0; x < W; x++) {
    const i = (y * W + x) * 4;
    banner[i] = Math.min(255, banner[i] + 8);
    banner[i + 1] = Math.min(255, banner[i + 1] + 10);
    banner[i + 2] = Math.min(255, banner[i + 2] + 18);
  }
}
for (let x = 0; x < W; x += 32) {
  for (let y = 0; y < H; y++) {
    const i = (y * W + x) * 4;
    banner[i] = Math.min(255, banner[i] + 8);
    banner[i + 1] = Math.min(255, banner[i + 1] + 10);
    banner[i + 2] = Math.min(255, banner[i + 2] + 18);
  }
}
// вклейка иконки
const ox = (W - 512) / 2;
const oy = (H - 512) / 2;
for (let y = 0; y < 512; y++) {
  for (let x = 0; x < 512; x++) {
    const si = (y * 512 + x) * 4;
    const a = icon[si + 3] / 255;
    if (a <= 0) continue;
    const di = ((oy + y) * W + ox + x) * 4;
    for (let c = 0; c < 3; c++) {
      banner[di + c] = Math.round(banner[di + c] * (1 - a) + icon[si + c] * a);
    }
  }
}
console.log('баннер:');
write('assets/banner.png', encodePNG(W, H, banner));
