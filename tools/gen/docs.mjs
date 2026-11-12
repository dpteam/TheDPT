// Документация: README, полный каталог, рассказ о том, как всё сделано.

import { add } from './util.mjs';

const GROUPS = [
  ['lang', 'Языки программирования', 'Каждый файл — маленькая программа, которая печатает `DPT`.'],
  ['eso', 'Эзотерика', 'Языки, придуманные ради шутки. Теперь они работают на команду.'],
  ['data', 'Данные, конфиги и разметка', 'Форматы, в которых обычно лежит чужой код. Теперь в них лежит `DPT`.'],
  ['media', 'Картинки, звук и видео', 'Одно слово, но его видно и слышно.'],
  ['office', 'Архивы, документы, шрифты', 'Упаковано, подписано, набрано.'],
  ['font', 'Шрифты', 'Три глифа — D, P, T. Больше не нужно.'],
  ['extra', 'Кодировки и всякая всячина', 'Слово `DPT` в максимально неожиданном виде.'],
];

const esc = (s) => s.replace(/\|/g, '\\|');

// Размеры в каталоге не печатаем специально: файлы, которые кодирует ffmpeg,
// на разных ОС и версиях кодека весят по-разному, и тогда docs/FORMATS.md
// перестаёт быть воспроизводимым. Каталог должен зависеть только от кода.
function table(rows, prefix = '') {
  const head = '| Файл | Формат | Что это |\n| --- | --- | --- |';
  const body = rows.map((r) => {
    const file = `[\`${r.file.replace('dpt/', '')}\`](${prefix}${r.file})`;
    return `| ${file} | ${esc(r.name)} | ${esc(r.note)} |`;
  });
  return [head, ...body].join('\n');
}

export function writeDocs(root, catalogue) {
  const byGroup = new Map(GROUPS.map(([id]) => [id, []]));
  for (const entry of catalogue) byGroup.get(entry.cat)?.push(entry);
  const total = catalogue.length;

  /* ───────────── README ───────────── */
  const readme = `<div align="center">

<img src="assets/icon.svg" width="120" height="120" alt="TheDPT">

# TheDPT

**DPT** — DartPower Team. Одно слово на ${total} языках, форматах и кодеках.

[![License: MIT](https://img.shields.io/badge/license-MIT-7c5cff.svg)](LICENSE)
[![build](https://github.com/DartPower/TheDPT/actions/workflows/ci.yml/badge.svg)](https://github.com/DartPower/TheDPT/actions/workflows/ci.yml)
[![Formats](https://img.shields.io/badge/%D1%84%D0%BE%D1%80%D0%BC%D0%B0%D1%82%D0%BE%D0%B2-${total}-6ee7ff.svg)](#каталог)
[![Зависимости](https://img.shields.io/badge/%D0%B7%D0%B0%D0%B2%D0%B8%D1%81%D0%B8%D0%BC%D0%BE%D1%81%D1%82%D0%B8-0-a78bfa.svg)](package.json)
[![ffmpeg](https://img.shields.io/badge/ffmpeg-%D1%82%D0%BE%D0%BB%D1%8C%D0%BA%D0%BE%20%D0%B4%D0%BB%D1%8F%20%D0%B2%D0%B8%D0%B4%D0%B5%D0%BE-ff6b9d.svg)](#как-это-сделано)

</div>

---

## Что это такое

Есть [легендарный репозиторий](https://github.com/eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee/eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee),
в котором 500 файлов называются \`e\` и внутри каждого написано \`e\`.
Этот репозиторий — то же самое, но про **DartPower Team** и с уважением к форматам:
здесь не просто \`DPT\` текстом, а ещё и настоящие PNG, GIF, WAV, MIDI, ZIP, DOCX, TTF, WASM,
торрент и ключ RSA.

Всё лежит в одной папке [\`dpt/\`](dpt) и называется \`DPT.<расширение>\`.
Никаких \`hello-world\`, никаких \`example\` — только \`DPT\`.

\`\`\`console
$ ls dpt | head -5
DPT.ada
DPT.ahk
DPT.aiff
DPT.ans
DPT.apk
\`\`\`

## Быстрый старт

\`\`\`bash
git clone https://github.com/DartPower/TheDPT.git
cd TheDPT

python dpt/DPT.py          # DPT
node   dpt/DPT.js          # DPT
sh     dpt/DPT             # DPT
pwsh   dpt/DPT.ps1         # DPT

ffplay -autoexit dpt/DPT.wav   # -.. .--. -   (морзянка)
\`\`\`

Посмотреть глазами: [\`dpt/DPT.png\`](dpt/DPT.png) · [\`dpt/DPT.svg\`](dpt/DPT.svg) ·
[\`dpt/DPT.gif\`](dpt/DPT.gif) · [\`dpt/DPT.mp4\`](dpt/DPT.mp4)

<table>
<tr>
<td align="center"><img src="dpt/DPT.png" width="140" alt="DPT.png"><br><sub>PNG</sub></td>
<td align="center"><img src="dpt/DPT.gif" width="140" alt="DPT.gif"><br><sub>GIF</sub></td>
<td align="center"><img src="assets/banner.png" width="300" alt="баннер"><br><sub>баннер</sub></td>
</tr>
</table>

Услышать: [\`dpt/DPT.wav\`](dpt/DPT.wav) — это \`-.. .--. -\`, то есть D, P, T морзянкой:
точка 90 мс, тире 270 мс, тон 720 Гц. То же самое лежит в MIDI, AIFF, AU и во всех
сжатых аудиоформатах.

## Каталог

Всего **${total}** файлов. Полный каталог одним списком — в [\`docs/FORMATS.md\`](docs/FORMATS.md).

${GROUPS.map(([id, title, lead]) => {
  const rows = byGroup.get(id) ?? [];
  if (!rows.length) return '';
  return `### ${title}\n\n${lead}\n\n${table(rows)}`;
}).join('\n\n')}

## Как это сделано

Всё, что можно было сгенерировать кодом — сгенерировано кодом, без единой зависимости:

- **картинки** — свой PNG-энкодер (CRC32, zlib, IHDR/IDAT/IEND), свой GIF с LZW, BMP, TGA, ICO, XBM, XPM;
- **звук** — морзянка считается синусом, WAV/AIFF/AU/MIDI собираются побайтово;
- **архивы и документы** — ZIP с local/central заголовками, TAR USTAR, PDF с ручным xref, DOCX/XLSX/ODT/EPUB как OOXML/ODF-пакеты;
- **шрифты** — TrueType из десяти таблиц, WOFF через zlib, BDF и PSF текстом и байтами;
- **видео и тяжёлые кодеки** (H.264, VP9, MP3, Opus, AVIF) — единственное место, где зовётся \`ffmpeg\`.

Подробный разбор — в [\`docs/HOW-IT-WORKS.md\`](docs/HOW-IT-WORKS.md).
Что реально запускалось и компилировалось — в [\`docs/VERIFY.md\`](docs/VERIFY.md).

### Пересобрать всё

\`\`\`bash
node tools/icon.mjs        # иконки и баннер в assets/
node tools/gen/index.mjs   # вся папка dpt/ и документация
node tools/verify.mjs      # прогон проверок и отчёт
\`\`\`

## Структура

\`\`\`
TheDPT/
├── dpt/            # ${total} файлов DPT.*  ← вот тут всё
├── assets/         # иконка, favicon, баннер
├── docs/           # каталог форматов, как всё сделано, отчёт проверок
├── tools/          # генераторы (Node.js, без зависимостей)
└── .github/        # CI и шаблоны
\`\`\`

## Правила

1. Файл называется \`DPT.<расширение>\`. Всегда.
2. Внутри — \`DPT\`. Не \`Hello, world\`, не \`foo\`, не \`test\`.
3. Если формат бинарный — он должен открываться, а не «примерно выглядеть как».
4. Никаких зависимостей. \`node:*\`, \`zlib\`, \`ffmpeg\` — и хватит.
5. Новый формат = строка в \`tools/gen/\` и строка в таблице. Всё остальное сделает генератор.

Подробнее — [\`CONTRIBUTING.md\`](CONTRIBUTING.md).

## Лицензия

MIT. Слово \`DPT\` принадлежит всем, кто в DartPower Team. См. [LICENSE](LICENSE).
`;

  add('README.md', readme);

  /* ───────────── docs/FORMATS.md ───────────── */
  const formats = `# Каталог форматов

${total} файлов. Каждый что-то делает со словом \`DPT\`.

${GROUPS.map(([id, title, lead]) => {
  const rows = byGroup.get(id) ?? [];
  if (!rows.length) return '';
  return `## ${title} (${rows.length})\n\n${lead}\n\n${table(rows, '../')}\n`;
}).join('\n')}
`;

  add('docs/FORMATS.md', formats);

  /* ───────────── docs/HOW-IT-WORKS.md ───────────── */
  add('docs/HOW-IT-WORKS.md', howItWorks(total));
}

function howItWorks(total) {
  return `# Как это сделано

Короткая версия: почти всё написано руками, а то, что не руками — сгенерировано кодом,
который написан руками. Зависимостей нет, кроме \`ffmpeg\` для тяжёлых видеокодеков.

## Принцип

Репозиторий-шутка не должен быть репозиторием-мусором. Поэтому у каждого файла есть
источник: либо строка в \`tools/gen/*.mjs\`, либо энкодер в \`tools/gen/util.mjs\`, либо
вызов \`ffmpeg\` в \`tools/gen/media.mjs\`. Ничего не правится вручную — всё пересобирается
одной командой:

\`\`\`bash
node tools/gen/index.mjs
\`\`\`

Генератор сам проверяет, что для каждого созданного файла есть описание в каталоге
(\`tools/gen/meta.mjs\`), и падает с ошибкой, если что-то забыли задокументировать.

## Иконка

Иконка не рисовалась в редакторе — она тоже код:

1. буквы \`D\`, \`P\`, \`T\` заданы сеткой 6×7 в \`tools/lib/render.mjs\`;
2. растр считается в 4× разрешении: для каждого пикселя проверяется, попадает ли он
   в включённую клетку сетки, — так буквы получаются цельными, без швов;
3. затем блок 4×4 усредняется в один пиксель, чтобы края остались гладкими;
4. фон — вертикальный градиент плюс радиальное фиолетовое свечение;
5. буквы заливаются горизонтальным градиентом от \`#6EE7FF\` к \`#A78BFA\`,
   причём цвет считается на каждый пиксель, а не на клетку;
6. \`tools/icon.mjs\` сохраняет это в SVG, PNG шести размеров, ICO и баннер 1280×640.

Тот же растр переиспользуется в \`dpt/DPT.ttf\`: каждая включённая клетка превращается
в прямоугольный контур TrueType.

## Свой deflate

\`tools/lib/deflate.mjs\` — не потому что «слабо», а потому что иначе репозиторий
не воспроизводим: системный zlib на разных платформах и версиях сжимает один и тот же
вход по-разному, а значит \`dpt/DPT.gz\` и \`dpt/DPT.png\` в CI и на Windows получались бы
разными. Поэтому deflate свой:

- блок один, \`BTYPE=01\` — фиксированные коды Хаффмана из RFC 1951;
- LZ77 жадный, окно 32 КиБ, максимальное совпадение 258 байт, цепочки хешей как в zlib;
- биты пишутся младшим вперёд, а коды Хаффмана — старшим, поэтому значение
  разворачивается перед записью;
- gzip-обёртка тоже своя: \`MTIME=0\`, \`OS=255\` («неизвестна»), CRC32 и ISIZE в конце;
- zlib-обёртка для PNG — \`0x78 0xDA\` плюс Adler-32.

Проверяется это не на слово: \`tools/verify.mjs\` разжимает IDAT обратно через
\`zlib.inflateSync\` и сверяет длину растра, а \`DPT.gz\` — через \`gunzipSync\`.

## PNG без библиотек

\`tools/lib/png.mjs\` — чуть больше ста строк:

- таблица CRC32 считается один раз при загрузке модуля;
- для каждой строки перебираются все пять фильтров PNG (None, Sub, Up, Average, Paeth)
  и выбирается тот, у которого меньше сумма абсолютных значений байтов — на градиентах
  это даёт почти нулевые строки, которые deflate упаковывает почти бесплатно;
- чанки собираются как \`длина + тип + данные + CRC\`, сжатие — свой deflate.

Этого хватает, чтобы получить валидный PNG, который откроет любой браузер.

## GIF и LZW

\`tools/gen/util.mjs\` содержит настоящий LZW-компрессор с переменной длиной кода,
сбросом словаря на 4096 и упаковкой в подблоки по 255 байт. Палитра — куб 6×6×6,
поэтому 256 цветов хватает без квантизации.

## Звук

\`dpt/DPT.wav\` — это морзянка \`-.. .--. -\` (D, P, T):

- точка = 90 мс, тире = 270 мс, пауза между символами = 90 мс, между буквами = 270 мс;
- тон 720 Гц, синус, с огибающей 5 мс, чтобы не щёлкало;
- WAV, AIFF (big-endian) и AU (μ-law) пишутся напрямую из массива сэмплов;
- MIDI собирается вручную: \`MThd\`, одна дорожка \`MTrk\`, дельта-время в VLQ, note on/off.

Остальные кодеки (MP3, Ogg, Opus, FLAC, AAC, WMA) получаются из WAV одним вызовом
\`ffmpeg\` — писать MP3-энкодер ради шутки было бы уже перебором.

## Архивы

- **ZIP** пишется целиком: local file header, central directory, EOCD, CRC32 через ту же таблицу.
- **TAR** — USTAR с контрольной суммой заголовка.
- **DOCX/XLSX/ODT/EPUB/APK/JAR/WHL** — это ZIP с конкретным набором XML-частей.
  Минимальный DOCX состоит из трёх файлов, минимальный XLSX — из пяти.
- **PDF** собирается с оглавлением объектов и таблицей \`xref\`, посчитанной по смещениям.

## Шрифты

TrueType собирается по спецификации: \`head\`, \`hhea\`, \`maxp\`, \`hmtx\`, \`cmap\` (формат 4),
\`glyf\`, \`loca\` (short), \`name\`, \`post\`, \`OS/2\`. Контрольная сумма каждой таблицы —
сумма 32-битных слов, \`head.checkSumAdjustment\` считается от всего файла и равна
\`0xB1B0AFBA - checksum\`. WOFF — те же таблицы, пожатые zlib, плюс 44-байтовый заголовок.

## Эзотерика

Часть программ не копипастится, а вычисляется:

- **Brainfuck** — \`8 × 8 + 4 = 68\` (D), \`+12 = 80\` (P), \`+4 = 84\` (T);
- **Ook!** — механическая замена токенов Brainfuck;
- **Whitespace** — push и out-char кодируются пробелами и табами, поэтому файл выглядит пустым;
- **Chef** — рецепт, где 68 г \`dart\`, 80 г \`power\` и 84 г \`team\` выкладываются в блюдо;
- **Shakespeare** — \`big big big big big big cat\` это 64, дальше арифметика до 68, 80 и 84.

## Проверка

\`tools/verify.mjs\` не верит на слово: он открывает PNG и сверяет размеры, распаковывает
ZIP и TAR, читает WAV и MIDI, парсит TTF через \`fontTools\`, запускает то, что можно
запустить (Python, Node, C, Rust, Java, PowerShell), и складывает результат в
[\`VERIFY.md\`](VERIFY.md).

## Воспроизводимость

Второй скрипт, \`tools/check-repro.mjs\`, проверяет главное свойство репозитория:
пересборка должна давать те же байты. Это не самоцель — так видно, что ни один файл
не правился руками в обход генератора.

Что для этого пришлось сделать:

- свой deflate вместо \`zlib.deflateSync\` — иначе \`DPT.gz\`, \`DPT.tar.gz\` и \`DPT.png\`
  зависели бы от версии zlib;
- gzip-заголовок с \`OS=255\` вместо платформенного байта ОС;
- фиксированный \`mtime\` в TAR и в ZIP;
- зафиксированная RSA-пара в \`tools/gen/key.mjs\` вместо \`generateKeyPairSync\`;
- \`-bitexact\` и \`-map_metadata -1\` у ffmpeg;
- отказ от колонки «Размер» в каталоге: ffmpeg на Ubuntu и на Windows выдаёт файлы
  разной длины, и таблица размеров гарантированно разъезжалась.

Что всё равно может отличаться — outputs внешних кодировщиков: файлы ffmpeg
и \`DPT.br\` (brotli из Node). Они помечены «мягкими»: скрипт печатает их список,
но не падает из-за них. Всё остальное обязано совпадать байт в байт.

## Чего нет

Честный список:

- **Piet** — программа-картинка требует аккуратной раскладки блоков и точки выхода;
  пока не сделано, чтобы не класть в репозиторий файл, который «почти работает».
- **Malbolge** — написать на нём \`DPT\` вручную нельзя, а генератор — отдельный проект.
- **PPTX/ODP** — минимальная презентация требует десятка связанных XML-частей;
  руки дошли только до DOCX и XLSX.
- **RAR/7z** — форматы с проприетарным сжатием, писать их энкодеры ради одной строки глупо.

Если чего-то не хватает — это не баг, это \`good first issue\`.

## Структура генератора

\`\`\`
tools/
├── icon.mjs            # иконка, favicon, баннер
├── verify.mjs          # проверки и отчёт
├── check-repro.mjs     # «пересборка даёт те же байты»
├── lib/
│   ├── checksum.mjs    # CRC32 и Adler-32
│   ├── deflate.mjs     # свой deflate, zlib- и gzip-обёртки
│   ├── png.mjs         # PNG + ICO + CUR
│   └── render.mjs      # растр и SVG иконки
└── gen/
    ├── index.mjs       # сборка
    ├── langs.mjs       # ${'программирующие языки'}
    ├── esoteric.mjs    # эзотерика
    ├── data.mjs        # конфиги и разметка
    ├── media.mjs       # картинки, звук, видео
    ├── office.mjs      # архивы и документы
    ├── fonts.mjs       # шрифты
    ├── extras.mjs      # кодировки, торрент, ключи
    ├── key.mjs         # зафиксированная RSA-пара
    ├── meta.mjs        # описания бинарных файлов
    ├── docs.mjs        # README и каталог
    ├── repo.mjs        # лицензия, CI, шаблоны
    └── util.mjs        # энкодеры и запись файлов
\`\`\`
`;
}
