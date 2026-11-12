// Документация: README, полный каталог, рассказ о том, как всё сделано.

import { add, OUT } from './util.mjs';

const GROUPS = [
  ['lang', 'Языки программирования', 'Каждый файл — маленькая программа, которая печатает `DPT`.'],
  ['eso', 'Эзотерика', 'Языки, придуманные ради шутки. Теперь они работают на команду.'],
  ['data', 'Данные, конфиги и разметка', 'Форматы, в которых обычно лежит чужой код. Теперь в них лежит `DPT`.'],
  ['media', 'Картинки, звук и видео', 'Одно слово, но его видно и слышно.'],
  ['office', 'Архивы, документы, шрифты', 'Упаковано, подписано, набрано.'],
  ['font', 'Шрифты', 'Три глифа — D, P, T. Больше не нужно.'],
  ['extra', 'Кодировки и всякая всячина', 'Слово `DPT` в максимально неожиданном виде.'],
];

const kb = (n) => (n < 1024 ? `${n} Б` : `${(n / 1024).toFixed(1)} КиБ`);

const esc = (s) => s.replace(/\|/g, '\\|');

function table(rows, extra) {
  const head = extra
    ? '| Файл | Формат | Что это | Размер |\n| --- | --- | --- | ---: |'
    : '| Файл | Формат | Что это |\n| --- | --- | --- |';
  const body = rows.map((r) => {
    const file = `[\`${r.file.replace('dpt/', '')}\`](${r.file})`;
    return extra
      ? `| ${file} | ${esc(r.name)} | ${esc(r.note)} | ${kb(OUT.get(r.file)?.length ?? 0)} |`
      : `| ${file} | ${esc(r.name)} | ${esc(r.note)} |`;
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
[![Formats](https://img.shields.io/badge/%D1%84%D0%BE%D1%80%D0%BC%D0%B0%D1%82%D0%BE%D0%B2-${total}-6ee7ff.svg)](#каталог)
[![Зависимости](https://img.shields.io/badge/%D0%B7%D0%B0%D0%B2%D0%B8%D1%81%D0%B8%D0%BC%D0%BE%D1%81%D1%82%D0%B8-0-a78bfa.svg)](package.json)
[![ffmpeg](https://img.shields.io/badge/ffmpeg-1-ff6b9d.svg)](#как-это-сделано)

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

Всего **${total}** файлов. Полная версия с размерами — в [\`docs/FORMATS.md\`](docs/FORMATS.md).

${GROUPS.map(([id, title, lead]) => {
  const rows = byGroup.get(id) ?? [];
  if (!rows.length) return '';
  return `### ${title}\n\n${lead}\n\n${table(rows, false)}\n`;
}).join('\n')}

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
  return `## ${title} (${rows.length})\n\n${lead}\n\n${table(rows, true)}\n`;
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
2. каждая клетка рисуется в 4× разрешении, потом усредняется вниз — так края не мылятся;
3. фон — вертикальный градиент плюс радиальное фиолетовое свечение;
4. буквы заливаются горизонтальным градиентом от \`#6EE7FF\` к \`#A78BFA\`;
5. \`tools/icon.mjs\` сохраняет это в SVG, PNG шести размеров, ICO и баннер 1280×640.

Тот же растр переиспользуется в \`dpt/DPT.ttf\`: каждая включённая клетка превращается
в прямоугольный контур TrueType.

## PNG без библиотек

\`tools/lib/png.mjs\` — 120 строк:

- таблица CRC32 считается один раз при загрузке модуля;
- каждая строка растра пишется с байтом фильтра \`0\`, затем сжимается \`zlib.deflateSync\`;
- чанки собираются как \`длина + тип + данные + CRC\`.

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
├── lib/
│   ├── png.mjs         # PNG + ICO + CRC32
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
    ├── meta.mjs        # описания бинарных файлов
    ├── docs.mjs        # README и каталог
    └── util.mjs        # энкодеры и запись файлов
\`\`\`
`;
}
