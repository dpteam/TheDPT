// Проверяет, что репозиторий воспроизводим: после пересборки git не видит изменений.
//
// Часть файлов отдана внешним кодировщикам, и их байты зависят от версии кодека,
// а не от нашего кода. Такие файлы помечены «мягкими»: скрипт их печатает,
// но из-за них не падает. Всё остальное обязано совпадать байт в байт.

import { execFileSync } from 'node:child_process';

const SOFT = [
  // ffmpeg: сборки на Ubuntu и на Windows выдают разные байты даже с -bitexact
  '.jpg', '.jpeg', '.webp', '.avif', '.tiff', '.pcx',
  '.mp3', '.ogg', '.opus', '.flac', '.m4a', '.aac', '.wma',
  '.mp4', '.webm', '.mkv', '.mov', '.avi', '.m4v', '.ogv',
  // brotli из node:zlib: зависит от версии brotli, вкомпилированной в Node
  '.br',
];

const git = (args) => execFileSync('git', args, { encoding: 'utf8' });
const changed = git(['status', '--porcelain'])
  .split('\n')
  .map((line) => line.slice(3).trim())
  .filter(Boolean);

const hard = [];
const soft = [];
for (const file of changed) {
  (SOFT.some((ext) => file.endsWith(ext)) ? soft : hard).push(file);
}

if (soft.length) {
  console.log(`отданы внешним кодировщикам, не считаем ошибкой (${soft.length}):`);
  for (const file of soft) console.log(`  ~ ${file}`);
}

if (hard.length) {
  console.error(`сборка не воспроизводима, изменилось ${hard.length} файл(ов):`);
  for (const file of hard) console.error(`  ! ${file}`);
  console.error('если файл бинарный, скорее всего в нём дата, случайный ключ или сжатие из внешней библиотеки');
  process.exit(1);
}

console.log('сборка воспроизводима: изменений нет');
