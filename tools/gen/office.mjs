// Архивы, офисные документы, шрифты и прочие бинарные форматы.

import { add, zip, tar, gzip, brotli, pdf, rtf, png } from './util.mjs';

const README = `DPT
DartPower Team
`;

/** docx: минимальный OOXML-пакет, который открывает Word. */
function docx(text) {
  return zip([
    {
      name: '[Content_Types].xml',
      data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`,
    },
    {
      name: '_rels/.rels',
      data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`,
    },
    {
      name: 'word/document.xml',
      data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
<w:body><w:p><w:r><w:rPr><w:sz w:val="96"/></w:rPr><w:t>${text}</w:t></w:r></w:p>
<w:p><w:r><w:t>DartPower Team</w:t></w:r></w:p></w:body></w:document>`,
    },
  ]);
}

/** xlsx: книга с одной ячейкой A1 = DPT. */
function xlsx(text) {
  return zip([
    {
      name: '[Content_Types].xml',
      data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
</Types>`,
    },
    {
      name: '_rels/.rels',
      data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`,
    },
    {
      name: 'xl/workbook.xml',
      data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
<sheets><sheet name="DPT" sheetId="1" r:id="rId1"/></sheets></workbook>`,
    },
    {
      name: 'xl/_rels/workbook.xml.rels',
      data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
</Relationships>`,
    },
    {
      name: 'xl/worksheets/sheet1.xml',
      data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
<sheetData><row r="1"><c r="A1" t="inlineStr"><is><t>${text}</t></is></c></row></sheetData></worksheet>`,
    },
  ]);
}

/** ODT: mimetype первым файлом без сжатия, как требует спек. */
function odt(text) {
  return zip([
    { name: 'mimetype', data: 'application/vnd.oasis.opendocument.text' },
    {
      name: 'META-INF/manifest.xml',
      data: `<?xml version="1.0" encoding="UTF-8"?>
<manifest:manifest xmlns:manifest="urn:oasis:names:tc:opendocument:xmlns:manifest:1.0" manifest:version="1.2">
<manifest:file-entry manifest:full-path="/" manifest:media-type="application/vnd.oasis.opendocument.text"/>
<manifest:file-entry manifest:full-path="content.xml" manifest:media-type="text/xml"/>
</manifest:manifest>`,
    },
    {
      name: 'content.xml',
      data: `<?xml version="1.0" encoding="UTF-8"?>
<office:document-content xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0" xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0" office:version="1.2">
<office:body><office:text><text:p>${text}</text:p></office:text></office:body></office:document-content>`,
    },
  ]);
}

/** EPUB 3: контейнер, OPF, один XHTML-документ. */
function epub(text) {
  return zip([
    { name: 'mimetype', data: 'application/epub+zip' },
    {
      name: 'META-INF/container.xml',
      data: `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
<rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles></container>`,
    },
    {
      name: 'OEBPS/content.opf',
      data: `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="dpt">
<metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
<dc:identifier id="dpt">urn:dpt:1</dc:identifier>
<dc:title>DPT</dc:title><dc:language>ru</dc:language>
<dc:creator>DartPower Team</dc:creator></metadata>
<manifest><item id="c1" href="chapter1.xhtml" media-type="application/xhtml+xml"/></manifest>
<spine><itemref idref="c1"/></spine></package>`,
    },
    {
      name: 'OEBPS/chapter1.xhtml',
      data: `<?xml version="1.0" encoding="UTF-8"?>
<html xmlns="http://www.w3.org/1999/xhtml"><head><title>DPT</title></head>
<body><h1>${text}</h1><p>DartPower Team</p></body></html>`,
    },
  ]);
}

export function office() {
  const readme = Buffer.from(README, 'utf8');

  /* архивы */
  add('dpt/DPT.zip', zip([{ name: 'DPT.txt', data: readme }]));
  add('dpt/DPT.tar', tar([{ name: 'DPT.txt', data: readme }]));
  add('dpt/DPT.tar.gz', gzip(tar([{ name: 'DPT.txt', data: readme }])));
  add('dpt/DPT.tgz', gzip(tar([{ name: 'DPT.txt', data: readme }])));
  add('dpt/DPT.gz', gzip(README));
  add('dpt/DPT.br', brotli(README));
  add('dpt/DPT.jar', zip([
    { name: 'META-INF/MANIFEST.MF', data: 'Manifest-Version: 1.0\nMain-Class: DPT\n' },
    { name: 'DPT.class', data: Buffer.from([0xca, 0xfe, 0xba, 0xbe, 0, 0, 0, 0x34]) },
  ]));
  add('dpt/DPT.war', zip([
    { name: 'WEB-INF/web.xml', data: '<web-app><display-name>DPT</display-name></web-app>' },
    { name: 'index.html', data: '<h1>DPT</h1>' },
  ]));
  add('dpt/DPT.whl', zip([
    { name: 'dpt-1.0.0.dist-info/METADATA', data: 'Metadata-Version: 2.1\nName: dpt\nVersion: 1.0.0\n' },
    { name: 'dpt/__init__.py', data: 'name = "DPT"\n' },
  ]));
  add('dpt/DPT.apk', zip([
    { name: 'AndroidManifest.xml', data: Buffer.from([0x03, 0x00, 0x08, 0x00]) },
    { name: 'res/values/strings.xml', data: '<resources><string name="app_name">DPT</string></resources>' },
  ]));
  add('dpt/DPT.nupkg', zip([
    { name: 'DPT.nuspec', data: '<?xml version="1.0"?><package><metadata><id>DPT</id><version>1.0.0</version><authors>DartPower Team</authors></metadata></package>' },
  ]));

  /* офис */
  add('dpt/DPT.docx', docx('DPT'));
  add('dpt/DPT.xlsx', xlsx('DPT'));
  add('dpt/DPT.odt', odt('DPT'));
  add('dpt/DPT.epub', epub('DPT'));
  add('dpt/DPT.pdf', pdf(['DPT', 'DartPower Team', '', 'TheDPT: 371 files, one word.']));
  add('dpt/DPT.rtf', rtf('DPT — DartPower Team'));

  /* данные */
  add('dpt/DPT.mo', gettextMo('DPT'));
  add('dpt/DPT.wasm', wasm());
}

/** GNU gettext .mo: magic, count, offsets, строки. */
function gettextMo(text) {
  const msgid = Buffer.from('', 'utf8');
  const msgstr = Buffer.from(text, 'utf8');
  const header = Buffer.alloc(28);
  header.writeUInt32LE(0x950412de, 0);
  header.writeUInt32LE(0, 4);
  header.writeUInt32LE(1, 8); // одна строка
  header.writeUInt32LE(28, 12); // смещение таблицы оригиналов
  header.writeUInt32LE(36, 16); // смещение таблицы переводов
  header.writeUInt32LE(0, 20);
  header.writeUInt32LE(0, 24);
  const dataStart = 44;
  const origTable = Buffer.alloc(8);
  origTable.writeUInt32LE(msgid.length, 0);
  origTable.writeUInt32LE(dataStart, 4);
  const transTable = Buffer.alloc(8);
  transTable.writeUInt32LE(msgstr.length, 0);
  transTable.writeUInt32LE(dataStart + msgid.length, 4);
  return Buffer.concat([header, origTable, transTable, msgid, msgstr]);
}

/** Минимальный WASM-модуль: память + данные "DPT" + функция, возвращающая 3. */
function wasm() {
  const body = Buffer.concat([
    Buffer.from([0x00]), // без локальных переменных
    Buffer.from([0x41, 0x03]), // i32.const 3
    Buffer.from([0x0b]), // end
  ]);
  const section = (id, payload) => {
    const size = [];
    let n = payload.length;
    do {
      let byte = n & 0x7f;
      n >>>= 7;
      if (n) byte |= 0x80;
      size.push(byte);
    } while (n);
    return Buffer.concat([Buffer.from([id, ...size]), payload]);
  };
  const str = (s) => Buffer.concat([Buffer.from([s.length]), Buffer.from(s, 'utf8')]);

  const type = section(1, Buffer.from([0x01, 0x60, 0x00, 0x01, 0x7f]));
  const funcs = section(3, Buffer.from([0x01, 0x00]));
  const mem = section(5, Buffer.from([0x01, 0x00, 0x01]));
  const exp = section(
    7,
    Buffer.concat([
      Buffer.from([0x02]),
      str('dpt'),
      Buffer.from([0x00, 0x00]),
      str('memory'),
      Buffer.from([0x02, 0x00]),
    ]),
  );
  const code = section(10, Buffer.concat([Buffer.from([0x01, body.length]), body]));
  const data = section(
    11,
    Buffer.concat([
      Buffer.from([0x01, 0x00, 0x41, 0x00, 0x0b, 0x03]),
      Buffer.from('DPT', 'utf8'),
    ]),
  );
  return Buffer.concat([
    Buffer.from([0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00]),
    type,
    funcs,
    mem,
    exp,
    code,
    data,
  ]);
}

export { png };
