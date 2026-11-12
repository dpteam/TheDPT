// Служебные файлы репозитория: лицензия, гитигнор, CI, шаблоны, сборка.

import { add } from './util.mjs';

export function repo() {
  add('LICENSE', `MIT License

Copyright (c) 2026 DartPower Team

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
`);

  add('.gitignore', `# ничего из dpt/ не игнорируем — там самое ценное
node_modules/
.tmp/
.DS_Store
Thumbs.db
desktop.ini

# логи, но не тот единственный лог, который мы положили сами
*.log
!dpt/DPT.log
`);

  add('.gitattributes', `* text=auto eol=lf

*.png binary
*.jpg binary
*.jpeg binary
*.gif binary
*.webp binary
*.avif binary
*.tiff binary
*.bmp binary
*.tga binary
*.ico binary
*.cur binary
*.pcx binary
*.wav binary
*.mp3 binary
*.ogg binary
*.opus binary
*.flac binary
*.m4a binary
*.aac binary
*.wma binary
*.aiff binary
*.au binary
*.mid binary
*.midi binary
*.mp4 binary
*.webm binary
*.mkv binary
*.mov binary
*.avi binary
*.m4v binary
*.ogv binary
*.zip binary
*.jar binary
*.war binary
*.whl binary
*.apk binary
*.nupkg binary
*.docx binary
*.xlsx binary
*.odt binary
*.epub binary
*.pdf binary
*.ttf binary
*.woff binary
*.psf binary
*.wasm binary
*.exe binary
*.class binary
*.torrent binary
*.sig binary
*.mo binary
dpt/DPT -text
`);

  add('.editorconfig', `root = true

[*]
charset = utf-8
end_of_line = lf
insert_final_newline = true
trim_trailing_whitespace = true
indent_style = space
indent_size = 2

[*.{md,markdown}]
trim_trailing_whitespace = false

[Makefile]
indent_style = tab

[dpt/DPT.ws]
trim_trailing_whitespace = false
insert_final_newline = false
`);

  add('.mailmap', `DartPower Team <2005369+DartPower@users.noreply.github.com> DartPower <2005369+DartPower@users.noreply.github.com>
`);

  add('Makefile', `# TheDPT — всё собирается одной командой

NODE ?= node
FFMPEG ?= ffmpeg

.PHONY: all gen icon verify clean dpt count

all: icon gen verify

icon:
	$(NODE) tools/icon.mjs

gen:
	$(NODE) tools/gen/index.mjs

verify:
	$(NODE) tools/verify.mjs

# просто поздороваться
dpt:
	@$(NODE) dpt/DPT.js

count:
	@ls dpt | wc -l

clean:
	rm -rf dpt assets/icon*.png assets/favicon.ico assets/banner.png
`);

  add('package.json', `{
  "name": "thedpt",
  "version": "1.0.0",
  "private": true,
  "description": "DPT — DartPower Team. Одно слово на всех языках, форматах и кодеках.",
  "type": "module",
  "scripts": {
    "icon": "node tools/icon.mjs",
    "gen": "node tools/gen/index.mjs",
    "verify": "node tools/verify.mjs",
    "build": "npm run icon && npm run gen && npm run verify"
  },
  "keywords": ["dpt", "dartpower", "polyglot", "esolang", "formats"],
  "author": "DartPower Team",
  "license": "MIT",
  "engines": { "node": ">=20" }
}
`);

  add('Dockerfile', `# TheDPT: собираем кучу внутри контейнера и здороваемся
FROM node:22-alpine

RUN apk add --no-cache ffmpeg

WORKDIR /dpt
COPY . .

RUN node tools/gen/index.mjs

CMD ["node", "dpt/DPT.js"]
`);

  add('docker-compose.yml', `services:
  dpt:
    build: .
    image: thedpt:1.0.0
    command: ["node", "dpt/DPT.js"]
`);

  add('CMakeLists.txt', `cmake_minimum_required(VERSION 3.20)
project(TheDPT VERSION 1.0.0 LANGUAGES C)

add_executable(DPT dpt/DPT.c)
set_target_properties(DPT PROPERTIES OUTPUT_NAME "DPT")
`);

  add('CONTRIBUTING.md', `# Как добавить формат

Правила простые, иначе репозиторий перестанет быть смешным и станет просто мусором.

## 1. Файл называется \`DPT.<расширение>\`

Не \`hello\`, не \`example\`, не \`dpt\`. Именно \`DPT\` — с большой буквы, как имя команды.

## 2. Внутри — \`DPT\`

Единственное слово, которое имеет право быть в этом репозитории.

## 3. Бинарник должен открываться

Если добавляешь формат с бинарной структурой — файл должен быть валидным:
\`file\`, \`unzip -t\`, \`ffprobe\`, \`fc-scan\` или хотя бы собственный парсер из
\`tools/verify.mjs\` должны сказать «ок». «Похоже на PDF» — не считается.

## 4. Только генератор

Не кладите файлы руками. Добавьте запись в нужный модуль \`tools/gen/\`:

\`\`\`js
{ ext: 'foo', name: 'Foo', note: 'печатает \`DPT\`', body: 'print("DPT")\\n' }
\`\`\`

и запустите:

\`\`\`bash
node tools/gen/index.mjs
\`\`\`

Генератор упадёт, если для файла нет описания в \`tools/gen/meta.mjs\` — это специально.

## 5. Без зависимостей

\`npm install\` не должен ничего ставить. Разрешено: \`node:*\`, \`zlib\` и \`ffmpeg\`
(последнее — только в \`tools/gen/media.mjs\`).

## 6. Обновите документы

README и \`docs/FORMATS.md\` собираются автоматически. Руками их не правят.

## Проверка перед PR

\`\`\`bash
node tools/gen/index.mjs
node tools/verify.mjs
git status --short   # должно быть пусто
\`\`\`
`);

  add('CODE_OF_CONDUCT.md', `# Кодекс поведения

## Короче

Не будь человеком, из-за которого приходится писать кодексы поведения.

## Подробнее

- Уважай чужие языки программирования. Даже Brainfuck. Особенно Brainfuck.
- Критикуй код, а не человека, который его написал.
- \`DPT\` пишется с большой буквы. Это единственное жёсткое правило.
- Если твой PR добавляет 400-й формат — это не флуд, это вклад.
- Если твой PR удаляет форматы — сначала issue.

## Нарушения

Пишите на \`conduct@dpteam.example\`. Ответим быстрее, чем COBOL скомпилируется.
`);

  add('SECURITY.md', `# Безопасность

## Что считается уязвимостью

- Генератор пишет файлы за пределы репозитория.
- \`DPT.pem\` содержит настоящий приватный ключ, который кто-то начнёт использовать.
- \`ffmpeg\` вызывается с неэкранированными аргументами.
- CI выполняет код из PR.

## Что не считается

- \`DPT.exe\` — это честно скомпилированный \`puts("DPT")\`, он ничего не ломает.
- \`DPT.pem\` — учебный ключ, созданный генератором. Не используйте его нигде.
- \`DPT.jsfuck\` — да, он страшный. Нет, он не вредоносный.

## Как сообщить

Откройте приватный security advisory в GitHub или напишите на \`security@dpteam.example\`.
`);

  add('CHANGELOG.md', `# Changelog

Формат: [Keep a Changelog](https://keepachangelog.com/ru/1.1.0/), версии по SemVer.

## [1.0.0] — 2026-11-12

### Добавлено

- Папка \`dpt/\` с файлами \`DPT.*\`: языки, эзотерика, конфиги, медиа, архивы, шрифты.
- Генератор без зависимостей: PNG, GIF, BMP, TGA, WAV, AIFF, AU, MIDI, ZIP, TAR, PDF, TTF, WOFF.
- Иконка, favicon и баннер, нарисованные кодом.
- Документация: каталог форматов, разбор реализации, отчёт проверок.
- CI, который пересобирает репозиторий и падает, если результат отличается.

### Известные ограничения

- Piet, Malbolge, PPTX, RAR и 7z не реализованы. См. \`docs/HOW-IT-WORKS.md\`.
`);

  add('AUTHORS.md', `# Авторы

- **DartPower Team** — идея, код, три буквы.

## Как попасть в список

Добавить формат, который действительно работает. Список отсортирован по количеству
букв \`DPT\` в вашем вкладе, но у всех получается одинаково.
`);

  add('CITATION.cff', `cff-version: 1.2.0
title: TheDPT
message: "Если вы ссылаетесь на репозиторий с тремя буквами — ссылайтесь правильно."
type: software
authors:
  - name: DartPower Team
version: 1.0.0
date-released: 2026-11-12
license: MIT
repository-code: https://github.com/DartPower/TheDPT
keywords:
  - dpt
  - dartpower
  - polyglot
  - esoteric
`);

  add('.github/workflows/ci.yml', `name: build

on:
  push:
    branches: [main]
  pull_request:

jobs:
  rebuild:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 22

      - name: ffmpeg
        run: sudo apt-get update && sudo apt-get install -y ffmpeg

      - name: иконки
        run: node tools/icon.mjs

      - name: генерация
        run: node tools/gen/index.mjs

      - name: проверки
        run: node tools/verify.mjs

      - name: репозиторий воспроизводим
        run: |
          git diff --exit-code
          test -z "$(git status --porcelain)"
`);

  add('.github/PULL_REQUEST_TEMPLATE.md', `## Что добавлено

<!-- Например: DPT.zig — печатает DPT -->

## Чек-лист

- [ ] Файл называется \`DPT.<расширение>\`
- [ ] Внутри ровно \`DPT\`
- [ ] Файл создан генератором, а не руками
- [ ] \`node tools/gen/index.mjs\` проходит
- [ ] \`node tools/verify.mjs\` проходит
- [ ] В \`tools/gen/meta.mjs\` есть описание (для бинарников)
`);

  add('.github/ISSUE_TEMPLATE/config.yml', `blank_issues_enabled: false
contact_links:
  - name: Вопрос по формату
    url: https://github.com/DartPower/TheDPT/discussions
    about: Сначала обсудим, потом добавим
`);

  add('.github/ISSUE_TEMPLATE/format.yml', `name: Новый формат
description: Предложить формат, в котором ещё нет DPT
title: "format: DPT."
labels: [format]
body:
  - type: input
    id: ext
    attributes:
      label: Расширение
      placeholder: zig
    validations:
      required: true
  - type: textarea
    id: why
    attributes:
      label: Почему это нужно
      placeholder: Потому что без Zig команда неполная
    validations:
      required: true
  - type: checkboxes
    id: checks
    attributes:
      label: Проверки
      options:
        - label: Я проверил, что такого формата ещё нет в dpt/
          required: true
`);

  add('.github/ISSUE_TEMPLATE/bug.yml', `name: Что-то не открывается
description: Файл битый, кодировка не та, звук не играет
title: "bug: "
labels: [bug]
body:
  - type: input
    id: file
    attributes:
      label: Файл
      placeholder: dpt/DPT.ttf
    validations:
      required: true
  - type: textarea
    id: what
    attributes:
      label: Что не так
      placeholder: fc-scan говорит, что таблица head битая
    validations:
      required: true
  - type: input
    id: how
    attributes:
      label: Чем проверяли
      placeholder: fontTools 4.68 / ffprobe 7.0
`);

  add('.github/FUNDING.yml', `custom: ["https://dpteam.example/donate"]
`);

  add('docs/VERIFY.md', `# Отчёт проверок

Запустите \`node tools/verify.mjs\` — файл перезапишется настоящими результатами.
`);
}
