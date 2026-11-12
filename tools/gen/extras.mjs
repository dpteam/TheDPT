// Всякая всячина: текст в разных кодировках, контакты, календарь, торрент, ключи.

import crypto from 'node:crypto';
import { add, morse } from './util.mjs';
import { PRIVATE_PEM, PUBLIC_PEM } from './key.mjs';

const DNA = { 0: 'A', 1: 'C', 2: 'G', 3: 'T' };

export function extras() {
  const text = 'DPT';

  add('dpt/DPT', `#!/bin/sh
# TheDPT — полиглот без расширения
echo "DPT"
`);

  /* текст в разных представлениях */
  add('dpt/DPT.bin', Buffer.from('DPT\n', 'utf8'));
  add('dpt/DPT.hex', Buffer.from('DPT\n', 'utf8').toString('hex') + '\n');
  add('dpt/DPT.b64', Buffer.from('DPT\n', 'utf8').toString('base64') + '\n');
  add('dpt/DPT.b32', base32(Buffer.from('DPT\n')) + '\n');
  add('dpt/DPT.ascii85', ascii85(Buffer.from('DPT\n')) + '\n');
  add('dpt/DPT.uu', uuencode(Buffer.from('DPT\n')) + '\n');
  add('dpt/DPT.morse', morse('DPT') + '\n');
  add('dpt/DPT.dna', [...Buffer.from('DPT\n')]
    .flatMap((b) => [0, 1, 2, 3].map((i) => DNA[(b >> (6 - i * 2)) & 3]))
    .join('') + '\n');
  add('dpt/DPT.rot13', 'QCG\n');
  add('dpt/DPT.sha256', crypto.createHash('sha256').update(text).digest('hex') + '  DPT\n');
  add('dpt/DPT.md5', crypto.createHash('md5').update(text).digest('hex') + '  DPT\n');

  /* ANSI-арт */
  add('dpt/DPT.ans', [
    '\x1b[38;5;51m  ██████  ██████  ████████ \x1b[0m',
    '\x1b[38;5;75m  ██   ██ ██   ██    ██    \x1b[0m',
    '\x1b[38;5;99m  ██   ██ ██████     ██    \x1b[0m',
    '\x1b[38;5;135m  ██   ██ ██         ██    \x1b[0m',
    '\x1b[38;5;171m  ██████  ██         ██    \x1b[0m',
    '',
    '\x1b[38;5;250m  DartPower Team\x1b[0m',
    '',
  ].join('\n'));

  /* контакты и календарь */
  add('dpt/DPT.vcf', `BEGIN:VCARD
VERSION:3.0
N:Team;DartPower;;;
FN:DPT
ORG:DartPower Team
NOTE:DPT
END:VCARD
`);
  add('dpt/DPT.ics', `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//TheDPT//DPT//RU
BEGIN:VEVENT
UID:dpt@dpteam
DTSTAMP:20261112T120000Z
DTSTART:20261112T120000Z
SUMMARY:DPT
END:VEVENT
END:VCALENDAR
`);

  /* гео */
  add('dpt/DPT.geojson', `{
  "type": "Feature",
  "properties": { "name": "DPT" },
  "geometry": { "type": "Point", "coordinates": [37.6173, 55.7558] }
}
`);
  add('dpt/DPT.gpx', `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="TheDPT"><wpt lat="55.7558" lon="37.6173"><name>DPT</name></wpt></gpx>
`);
  add('dpt/DPT.kml', `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2"><Placemark><name>DPT</name>
<Point><coordinates>37.6173,55.7558,0</coordinates></Point></Placemark></kml>
`);

  /* торрент: настоящий bencode с SHA-1 кусков */
  const payload = Buffer.from('DPT\n');
  add('dpt/DPT.torrent', bencode({
    announce: 'udp://tracker.example:1337/announce',
    info: {
      name: 'DPT',
      length: payload.length,
      'piece length': 16384,
      pieces: crypto.createHash('sha1').update(payload).digest(),
    },
  }));

  /* учебная RSA-пара, зафиксирована в key.mjs, чтобы сборка была воспроизводимой */
  add('dpt/DPT.pem', PRIVATE_PEM);
  add('dpt/DPT.pub', PUBLIC_PEM);
  add('dpt/DPT.sig', crypto.sign('sha256', Buffer.from(text), PRIVATE_PEM));
}

function base32(buf) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = 0;
  let value = 0;
  let out = '';
  for (const byte of buf) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      out += alphabet[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) out += alphabet[(value << (5 - bits)) & 31];
  while (out.length % 8) out += '=';
  return out;
}

function ascii85(buf) {
  let out = '';
  for (let i = 0; i < buf.length; i += 4) {
    const chunk = buf.subarray(i, i + 4);
    let n = 0;
    for (let j = 0; j < 4; j++) n = n * 256 + (chunk[j] ?? 0);
    const chars = [];
    for (let j = 0; j < 5; j++) {
      chars.unshift(String.fromCharCode((n % 85) + 33));
      n = Math.floor(n / 85);
    }
    out += chars.join('').slice(0, chunk.length + 1);
  }
  return out;
}

function uuencode(buf) {
  const lines = [];
  for (let i = 0; i < buf.length; i += 45) {
    const chunk = buf.subarray(i, i + 45);
    let line = String.fromCharCode(chunk.length + 32);
    for (let j = 0; j < chunk.length; j += 3) {
      const b0 = chunk[j];
      const b1 = chunk[j + 1] ?? 0;
      const b2 = chunk[j + 2] ?? 0;
      line += String.fromCharCode(
        ((b0 >> 2) & 0x3f) + 32,
        (((b0 << 4) | (b1 >> 4)) & 0x3f) + 32,
        (((b1 << 2) | (b2 >> 6)) & 0x3f) + 32,
        (b2 & 0x3f) + 32,
      );
    }
    lines.push(line);
  }
  lines.push('`');
  return lines.join('\n');
}

function bencode(value) {
  if (Buffer.isBuffer(value)) return Buffer.concat([Buffer.from(`${value.length}:`), value]);
  if (typeof value === 'number') return Buffer.from(`i${value}e`);
  if (typeof value === 'string') return bencode(Buffer.from(value, 'utf8'));
  if (Array.isArray(value)) return Buffer.concat([Buffer.from('l'), ...value.map(bencode), Buffer.from('e')]);
  const keys = Object.keys(value).sort();
  return Buffer.concat([
    Buffer.from('d'),
    ...keys.flatMap((k) => [bencode(k), bencode(value[k])]),
    Buffer.from('e'),
  ]);
}
