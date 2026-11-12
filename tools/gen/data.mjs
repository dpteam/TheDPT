// Данные, конфиги, разметка, запросы. Много, дёшево и со вкусом.

const D = (ext, name, note, body) => ({ ext, name, note, body });

export const data = [
  D('json', 'JSON', 'объект команды', `{
  "name": "DPT",
  "team": "DartPower Team",
  "members": ["Dart", "Power", "Team"],
  "since": 2019
}
`),
  D('jsonc', 'JSON with Comments', 'JSON, которому разрешили комментарии', `{
  // TheDPT
  "name": "DPT",
  "team": "DartPower Team"
}
`),
  D('json5', 'JSON5', 'одни кавычки, висячие запятые', `{
  name: 'DPT',
  team: 'DartPower Team',
}
`),
  D('jsonl', 'JSON Lines', 'по объекту на строку', `{"name":"DPT"}
{"team":"DartPower Team"}
`),
  D('ndjson', 'NDJSON', 'то же, другое имя', `{"name":"DPT"}
{"shout":"DPT"}
`),
  D('yaml', 'YAML', 'человечный конфиг', `name: DPT
team: DartPower Team
members:
  - Dart
  - Power
  - Team
`),
  D('yml', 'YAML (.yml)', 'то же, короче расширение', `dpt: &team
  name: DartPower Team
  shout: DPT
`),
  D('toml', 'TOML', 'конфиг без сюрпризов', `[dpt]
name = "DPT"
team = "DartPower Team"
members = ["Dart", "Power", "Team"]
`),
  D('ini', 'INI', 'секция и ключи', `[DPT]
name=DartPower Team
shout=DPT
`),
  D('cfg', 'CFG', 'плоский конфиг', `name = DPT
team = DartPower Team
`),
  D('conf', 'CONF', 'как у nginx, только про DPT', `server {
    name DPT;
    team "DartPower Team";
}
`),
  D('properties', 'Java Properties', 'ключ=значение', `dpt.name=DartPower Team
dpt.shout=DPT
`),
  D('env', 'dotenv', 'переменные окружения', `DPT_NAME=DartPower Team
DPT_SHOUT=DPT
`),
  D('xml', 'XML', 'корень `DPT`', `<?xml version="1.0" encoding="UTF-8"?>
<DPT team="DartPower Team">
  <shout>DPT</shout>
</DPT>
`),
  D('xsd', 'XML Schema', 'схема для XML выше', `<?xml version="1.0"?>
<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema">
  <xs:element name="DPT" type="xs:string"/>
</xs:schema>
`),
  D('xsl', 'XSLT', 'превращает DPT в h1', `<?xml version="1.0"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:template match="/"><h1>DPT</h1></xsl:template>
</xsl:stylesheet>
`),
  D('xslt', 'XSLT (.xslt)', 'то же самое', `<?xml version="1.0"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:template match="/"><p>DartPower Team</p></xsl:template>
</xsl:stylesheet>
`),
  D('dtd', 'DTD', 'объявление элемента', `<!ELEMENT DPT (#PCDATA)>
<!ATTLIST DPT team CDATA "DartPower Team">
`),
  D('rss', 'RSS', 'лента новостей команды', `<?xml version="1.0"?>
<rss version="2.0"><channel>
  <title>DPT</title>
  <link>https://github.com/DartPower</link>
  <item><title>DPT</title></item>
</channel></rss>
`),
  D('atom', 'Atom', 'то же, посвежее', `<?xml version="1.0"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>DPT</title>
  <entry><title>DartPower Team</title></entry>
</feed>
`),
  D('plist', 'Apple plist', 'настройки в XML', `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
  <key>name</key><string>DPT</string>
</dict></plist>
`),
  D('inf', 'Setup INF', 'установочный файл Windows', `[Version]
Signature="$Windows NT$"

[DPT]
Name=DartPower Team
`),
  D('desktop', 'Desktop Entry', 'ярлык в Linux', `[Desktop Entry]
Type=Application
Name=DPT
Comment=DartPower Team
Exec=dpt
`),
  D('service', 'systemd Unit', 'сервис `DPT`', `[Unit]
Description=DPT

[Service]
ExecStart=/usr/bin/dpt

[Install]
WantedBy=multi-user.target
`),
  D('socket', 'systemd Socket', 'сокет для DPT', `[Socket]
ListenStream=4210

[Install]
WantedBy=sockets.target
`),
  D('htaccess', '.htaccess', 'редирект на DPT', `RewriteEngine On
RewriteRule ^dpt$ /DPT [R=301,L]
`),
  D('editorconfig', '.editorconfig', 'правила форматирования', `root = true

[*]
charset = utf-8
indent_style = space
end_of_line = lf
`),
  D('npmrc', '.npmrc', 'настройки npm', `init-author-name=DartPower Team
init-license=MIT
`),
  D('babelrc', '.babelrc', 'пресеты Babel', `{
  "presets": ["@babel/preset-env"]
}
`),
  D('eslintrc', '.eslintrc', 'линтер', `{
  "rules": { "no-console": "off" }
}
`),
  D('prettierrc', '.prettierrc', 'форматтер', `{
  "semi": true,
  "singleQuote": true
}
`),
  D('gitconfig', '.gitconfig', 'настройки git', `[user]
	name = DartPower Team
	email = dpt@example.com
[init]
	defaultBranch = main
`),
  D('gitignore', '.gitignore', 'что не коммитим', `node_modules/
dist/
*.log
`),
  D('gitattributes', '.gitattributes', 'что считаем бинарём', `* text=auto eol=lf
*.png binary
*.wav binary
`),
  D('mailmap', '.mailmap', 'схлопываем авторов', `DartPower Team <dpt@example.com> DartPower <2005369+DartPower@users.noreply.github.com>
`),
  D('csv', 'CSV', 'таблица', `name,team,shout
DPT,DartPower Team,DPT
`),
  D('tsv', 'TSV', 'та же таблица, но табами', `name\tteam\tshout
DPT\tDartPower Team\tDPT
`),
  D('psv', 'PSV', 'и через `|`', `name|team|shout
DPT|DartPower Team|DPT
`),
  D('md', 'Markdown', 'заголовок и список', `# DPT

**DartPower Team**

- Dart
- Power
- Team
`),
  D('markdown', 'Markdown (.markdown)', 'то же', `## DPT

> DartPower Team
`),
  D('rst', 'reStructuredText', 'питонская разметка', `DPT
===

DartPower Team
`),
  D('adoc', 'AsciiDoc', 'документация', `= DPT

DartPower Team
`),
  D('org', 'Org mode', 'заметка в Emacs', `* DPT
  DartPower Team
`),
  D('tex', 'LaTeX', 'страница с DPT', `\\documentclass{article}
\\begin{document}
\\Huge DPT \\\\
DartPower Team
\\end{document}
`),
  D('latex', 'LaTeX (.latex)', 'то же, длинное расширение', `\\documentclass{article}
\\begin{document}
DPT
\\end{document}
`),
  D('sty', 'LaTeX Style', 'пакет `dpt`', `\\NeedsTeXFormat{LaTeX2e}
\\ProvidesPackage{dpt}[2026/11/12 TheDPT]
\\newcommand{\\DPT}{DartPower Team}
`),
  D('bib', 'BibTeX', 'запись о команде', `@misc{dpt,
  author = {DartPower Team},
  title  = {DPT},
  year   = {2026}
}
`),
  D('txt', 'Plain text', 'просто текст', `DPT
DartPower Team
`),
  D('nfo', 'NFO', 'ASCII-арт для консоли', `  ██████  ██████  ████████
  ██   ██ ██   ██    ██
  ██   ██ ██████     ██
  ██   ██ ██         ██
  ██████  ██         ██

  DartPower Team
`),
  D('log', 'Log', 'лог сборки', `[00:00:00] build start
[00:00:01] DPT
[00:00:01] build ok
`),
  D('html', 'HTML', 'страница с DPT', `<!doctype html>
<html lang="ru">
  <head><meta charset="utf-8"><title>DPT</title></head>
  <body><h1>DPT</h1></body>
</html>
`),
  D('htm', 'HTML (.htm)', 'то же, старое расширение', `<!doctype html>
<h1>DartPower Team</h1>
`),
  D('xhtml', 'XHTML', 'строгий HTML', `<?xml version="1.0"?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml"><body><h1>DPT</h1></body></html>
`),
  D('css', 'CSS', 'переменная с именем команды', `:root {
  --dpt-name: "DPT";
  --dpt-accent: #6ee7ff;
}
`),
  D('scss', 'SCSS', 'вложенность', `.dpt {
  color: #6ee7ff;
  &:hover { color: #a78bfa; }
}
`),
  D('sass', 'Sass', 'индентами', `.dpt
  color: #6ee7ff
`),
  D('less', 'Less', 'переменные через `@`', `@dpt: #6ee7ff;
.dpt { color: @dpt; }
`),
  D('styl', 'Stylus', 'без скобок', `.dpt
  color #6ee7ff
`),
  D('pug', 'Pug', 'индентами', `h1 DPT
p DartPower Team
`),
  D('haml', 'Haml', 'ещё индентами', `%h1 DPT
%p DartPower Team
`),
  D('slim', 'Slim', 'и это тоже', `h1 DPT
`),
  D('ejs', 'EJS', 'шаблон с `<%= %>`', `<h1><%= "DPT" %></h1>
`),
  D('hbs', 'Handlebars', 'шаблон с `{{}}`', `<h1>{{dpt}}</h1>
`),
  D('mustache', 'Mustache', 'то же, без логики', `{{#dpt}}DPT{{/dpt}}
`),
  D('twig', 'Twig', 'шаблонизатор Symfony', `{% set name = 'DPT' %}
<h1>{{ name }}</h1>
`),
  D('liquid', 'Liquid', 'шаблонизатор Shopify', `{% assign name = "DPT" %}
<h1>{{ name }}</h1>
`),
  D('j2', 'Jinja2', 'шаблон для Python', `{% set name = "DPT" %}
<h1>{{ name }}</h1>
`),
  D('erb', 'ERB', 'шаблон для Ruby', `<h1><%= "DPT" %></h1>
`),
  D('cshtml', 'Razor', 'шаблон ASP.NET', `@{ var name = "DPT"; }
<h1>@name</h1>
`),
  D('jsp', 'JSP', 'шаблон Java', `<% String name = "DPT"; %>
<h1><%= name %></h1>
`),
  D('vue', 'Vue SFC', 'однофайловый компонент', `<template><h1>{{ name }}</h1></template>
<script setup>
const name = 'DPT';
</script>
`),
  D('svelte', 'Svelte', 'компилируемый компонент', `<script>let name = 'DPT';</script>
<h1>{name}</h1>
`),
  D('astro', 'Astro', 'компонент с островами', `---
const name = 'DPT';
---
<h1>{name}</h1>
`),
  D('mdx', 'MDX', 'markdown + JSX', `# DPT

<Team name="DartPower Team" />
`),
  D('webmanifest', 'Web App Manifest', 'PWA-манифест', `{
  "name": "DPT",
  "short_name": "DPT",
  "start_url": "/",
  "display": "standalone"
}
`),
  D('robots.txt', 'robots.txt', 'правила для ботов', `User-agent: *
Allow: /DPT
`),
  D('humans.txt', 'humans.txt', 'кто это сделал', `/* TEAM */
  Team: DartPower Team
  Name: DPT
`),
  D('security.txt', 'security.txt', 'куда писать про уязвимости', `Contact: mailto:security@example.com
Preferred-Languages: ru, en
`),
  D('srt', 'SubRip', 'субтитр «DPT»', `1
00:00:00,000 --> 00:00:02,000
DPT
`),
  D('vtt', 'WebVTT', 'то же для веба', `WEBVTT

00:00.000 --> 00:02.000
DPT
`),
  D('ass', 'ASS', 'продвинутые субтитры', `[Script Info]
Title: TheDPT

[Events]
Format: Layer, Start, End, Style, Text
Dialogue: 0,0:00:00.00,0:00:02.00,Default,DPT
`),
  D('m3u', 'M3U', 'плейлист с морзянкой', `#EXTM3U
#EXTINF:3,DPT
DPT.wav
`),
  D('pls', 'PLS', 'плейлист по-старому', `[playlist]
NumberOfEntries=1
File1=DPT.wav
Title1=DPT
`),
  D('cuesheet', 'CUE sheet', 'разметка трека', `FILE "DPT.wav" WAVE
  TRACK 01 AUDIO
    TITLE "DPT"
    INDEX 01 00:00:00
`),
  D('sln', 'Visual Studio Solution', 'решение с одним проектом', `Microsoft Visual Studio Solution File, Format Version 12.00
Project("{FAE04EC0-301F-11D3-BF4B-00C04F79EFBC}") = "DPT", "DPT.csproj", "{11111111-2222-3333-4444-555555555555}"
EndProject
`),
  D('csproj', 'MSBuild Project', 'проект C#', `<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <OutputType>Exe</OutputType>
    <TargetFramework>net8.0</TargetFramework>
    <AssemblyName>DPT</AssemblyName>
  </PropertyGroup>
</Project>
`),
  D('fsproj', 'MSBuild Project (F#)', 'проект F#', `<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <OutputType>Exe</OutputType>
    <TargetFramework>net8.0</TargetFramework>
  </PropertyGroup>
</Project>
`),
  D('vcxproj', 'Visual C++ Project', 'проект C++', `<Project DefaultTargets="Build" xmlns="http://schemas.microsoft.com/developer/msbuild/2003">
  <PropertyGroup><ProjectName>DPT</ProjectName></PropertyGroup>
</Project>
`),
  D('gradle', 'Gradle (Groovy)', 'сборка Java', `plugins { id 'application' }
application { mainClass = 'DPT' }
`),
  D('kts.gradle', 'Gradle (Kotlin)', 'то же на Kotlin DSL', `plugins { application }
application { mainClass.set("DPT") }
`),
  D('pom', 'Maven POM', 'проект Maven', `<project xmlns="http://maven.apache.org/POM/4.0.0">
  <modelVersion>4.0.0</modelVersion>
  <groupId>dev.dpteam</groupId>
  <artifactId>dpt</artifactId>
  <version>1.0.0</version>
</project>
`),
  D('lock', 'Lockfile', 'пустой, но честный', `# DPT lockfile
version = 1
`),
  D('pubspec', 'pubspec.yaml', 'пакет Dart', `name: dpt
description: DartPower Team
version: 1.0.0
`),
  D('cabal', 'Cabal', 'пакет Haskell', `name: dpt
version: 1.0.0
build-type: Simple
`),
  D('gemfile', 'Gemfile', 'зависимости Ruby', `source "https://rubygems.org"
gem "dpt"
`),
  D('requirements', 'requirements.txt', 'зависимости Python', `dpt==1.0.0
`),
  D('composer', 'composer.json', 'пакет PHP', `{
  "name": "dpteam/dpt",
  "description": "DartPower Team"
}
`),
  D('mkd', 'Markdown (.mkd)', 'третье имя для markdown', `DPT — DartPower Team
`),
  D('texinfo', 'Texinfo', 'документация GNU', `\\input texinfo
@title DPT
@bye
`),
  D('man', 'man page', 'страница справки', `.TH DPT 1
.SH NAME
dpt \\- DartPower Team
`),
  D('1', 'man page (.1)', 'то же, с номером секции', `.TH DPT 1 "2026-11-12"
.SH NAME
DPT \\- DartPower Team
`),
  D('pot', 'gettext template', 'строка для перевода', `msgid "DPT"
msgstr ""
`),
  D('po', 'gettext', 'перевод (не переводится)', `msgid "DPT"
msgstr "DPT"
`),
  D('mo', 'gettext binary', 'бинарный перевод', null),
  D('icu', 'ICU MessageFormat', 'сообщение с плюрализацией', `{count, plural, one {DPT} other {DPT}}
`),
  D('diff', 'Unified diff', 'патч, добавляющий DPT', `--- a/README.md
+++ b/README.md
@@ -1 +1,2 @@
+DPT
`),
  D('patch', 'Patch', 'то же', `--- DPT
+++ DPT
@@ -1 +1 @@
-DPT
+DPT
`),
];
