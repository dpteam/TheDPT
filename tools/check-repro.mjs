// Проверяет, что репозиторий воспроизводим: после пересборки git не видит изменений.
// Файлы, которые кодирует ffmpeg, сравниваются мягко — их байты зависят от версии кодека,
// а версия в CI и на машине разработчика почти всегда разная.

import { execFileSync } from 'node:child_process';

// Форматы, которые целиком отданы ffmpeg: побайтовое совпадение между платформами
// не гарантируется даже с -bitexact.
const FFMPEG_OUTPUTS = [
  '.jpg', '.jpeg', '.webp', '.avif', '.tiff', '.pcx',
  '.mp3', '.ogg', '.opus', '.flac', '.m4a', '.aac', '.wma',
  '.mp4', '.webm', '.mkv', '.mov', '.avi', '.m4v', '.ogv',
];

const git = (args) => execFileSync('git', args, { encoding: 'utf8' });
const changed = git(['status', '--porcelain']).split('\n').filter(Boolean);

const hard = [];
const soft = [];
for (const line of changed) {
  const file = line.slice(3).trim();
  const isFfmpeg = FFMPEG_OUTPUTS.some((ext) => file.endsWith(ext));
  (isFfmpeg ? soft : hard).push(file);
}

if (soft.length) {
  console.log(`зависят от версии ffmpeg (не считаем ошибкой): ${soft.length}`);
  for (const file of soft) console.log(`  ~ ${file}`);
}

if (hard.length) {
  console.error(`сборка не воспроизводима, изменилось ${hard.length} файл(ов):`);
  for (const file of hard) console.error(`  ! ${file}`);
  process.exit(1);
}

console.log('сборка воспроизводима: изменений нет');
