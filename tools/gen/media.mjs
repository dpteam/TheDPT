// РњРµРґРёР°: РєР°СЂС‚РёРЅРєРё, Р·РІСѓРє, РІРёРґРµРѕ. Р§С‚Рѕ РјРѕР¶РµРј вЂ” РєРѕРґРёСЂСѓРµРј СЃР°РјРё, С‡С‚Рѕ РЅРµ РјРѕР¶РµРј вЂ” ffmpeg.

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { render } from '../lib/render.mjs';
import { renderSVG } from '../lib/render.mjs';
import { encodePNG } from '../lib/png.mjs';
import {
  add,
  png,
  ico,
  bmp,
  tga,
  ppm,
  pgm,
  pbm,
  xbm,
  xpm,
  gif,
  quantize,
  wav,
  morseSamples,
  aiff,
  au,
  midi,
} from './util.mjs';

const ff = (args) => {
  try {
    execFileSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', ...args], {
      stdio: ['ignore', 'ignore', 'pipe'],
    });
    return true;
  } catch (error) {
    const stderr = error.stderr ? error.stderr.toString().split('\n')[0] : String(error.message);
    console.warn(`  ffmpeg пропущен: ${args[args.length - 1]} — ${stderr.slice(0, 120)}`);
    return false;
  }
};

export function media(root) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'dpt-'));
  const src = path.join(tmp, 'DPT.png');
  fs.writeFileSync(src, png(512));

  /* в”Ђв”Ђ СЂР°СЃС‚СЂРѕРІС‹Рµ РєР°СЂС‚РёРЅРєРё в”Ђв”Ђ */
  const icon = render(512);
  add('dpt/DPT.png', png(512));
  add('dpt/DPT.svg', renderSVG(512));
  add('dpt/DPT.bmp', bmp(512, 512, icon));
  add('dpt/DPT.tga', tga(512, 512, icon));
  add('dpt/DPT.ico', ico([16, 32, 48, 64, 128, 256]));
  add('dpt/DPT.cur', ico([32])); // РєСѓСЂСЃРѕСЂ вЂ” С‚РѕС‚ Р¶Рµ РєРѕРЅС‚РµР№РЅРµСЂ
  add('dpt/DPT.ppm', ppm(256, 256, render(256)));
  add('dpt/DPT.pgm', pgm(256, 256, render(256)));
  add('dpt/DPT.pbm', pbm(256, 256, render(256)));
  add('dpt/DPT.pnm', ppm(256, 256, render(256)));
  add('dpt/DPT.xbm', xbm('dpt', 256, 256, render(256)));
  add('dpt/DPT.xpm', xpm('dpt', 128, 128, render(128)));

  // РђРЅРёРјРёСЂРѕРІР°РЅРЅС‹Р№ GIF: РёРєРѕРЅРєР° + РёРЅРІРµСЂСЃРёСЏ РїР°Р»РёС‚СЂС‹.
  const small = render(256, { supersample: 2 });
  add('dpt/DPT.gif', gif(256, 256, [quantize(small, 256, 256), quantize(small, 256, 256, true)], 35));

  for (const [ext, extra] of [
    ['jpg', ['-q:v', '3']],
    ['jpeg', ['-q:v', '3']],
    ['webp', ['-lossless', '0', '-q:v', '80']],
    ['avif', ['-c:v', 'libaom-av1', '-still-picture', '1', '-crf', '40']],
    ['tiff', []],
    ['pcx', []],
  ]) {
    const out = path.join(tmp, `out.${ext}`);
    if (ff(['-i', src, ...extra, out])) add(`dpt/DPT.${ext}`, fs.readFileSync(out));
  }

  /* в”Ђв”Ђ Р·РІСѓРє в”Ђв”Ђ */
  const samples = morseSamples(44100);
  const wavBuf = wav(samples);
  add('dpt/DPT.wav', wavBuf);
  add('dpt/DPT.aiff', aiff(samples));
  add('dpt/DPT.au', au(samples));
  add('dpt/DPT.mid', midi());
  add('dpt/DPT.midi', midi());
  add('dpt/DPT.abc', `X:1
T:DPT
M:4/4
L:1/4
K:C
"D" D2 "P" P2 "T" T2 |]
`);
  add('dpt/DPT.ly', `\\version "2.24.0"
\\header { title = "DPT" composer = "DartPower Team" }
\\relative c' { d4 e f g | a b c d | }
`);
  add('dpt/DPT.musicxml', `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE score-partwise PUBLIC "-//Recordare//DTD MusicXML 4.0 Partwise//EN" "http://www.musicxml.org/dtds/partwise.dtd">
<score-partwise version="4.0">
  <part-list><score-part id="P1"><part-name>DPT</part-name></score-part></part-list>
  <part id="P1"><measure number="1">
    <attributes><divisions>1</divisions></attributes>
    <note><pitch><step>D</step><octave>4</octave></pitch><duration>4</duration></note>
  </measure></part>
</score-partwise>
`);
  add('dpt/DPT.mus', `# Doom MUS вЂ” DPT
DPT
`);

  const wavPath = path.join(tmp, 'DPT.wav');
  fs.writeFileSync(wavPath, wavBuf);
  for (const [ext, args] of [
    ['mp3', ['-c:a', 'libmp3lame', '-b:a', '128k']],
    ['ogg', ['-c:a', 'libvorbis', '-q:a', '4']],
    ['opus', ['-c:a', 'libopus', '-b:a', '64k']],
    ['flac', ['-c:a', 'flac']],
    ['m4a', ['-c:a', 'aac', '-b:a', '96k']],
    ['aac', ['-c:a', 'aac', '-b:a', '96k', '-f', 'adts']],
    ['wma', ['-c:a', 'wmav2', '-b:a', '96k']],
  ]) {
    const out = path.join(tmp, `out.${ext}`);
    if (ff(['-i', wavPath, ...args, out])) add(`dpt/DPT.${ext}`, fs.readFileSync(out));
  }

  /* в”Ђв”Ђ РІРёРґРµРѕ: 12 РєР°РґСЂРѕРІ СЃ Р±РµРіСѓС‰РµР№ РїРѕР»РѕСЃРѕР№ в”Ђв”Ђ */
  const framesDir = path.join(tmp, 'frames');
  fs.mkdirSync(framesDir);
  const W = 640;
  const H = 360;
  const frameCount = 12;
  const iconRgb = render(256, { supersample: 2 });
  for (let f = 0; f < frameCount; f++) {
    const buf = Buffer.alloc(W * H * 4);
    const t = f / frameCount;
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const o = (y * W + x) * 4;
        buf[o] = Math.round(9 + (x / W) * 8);
        buf[o + 1] = Math.round(13 + (y / H) * 14);
        buf[o + 2] = Math.round(28 + ((x + y) / (W + H)) * 30);
        buf[o + 3] = 255;
      }
    }
    // РёРєРѕРЅРєР° РїРѕ С†РµРЅС‚СЂСѓ
    const ox = (W - 256) / 2;
    const oy = (H - 256) / 2;
    for (let y = 0; y < 256; y++) {
      for (let x = 0; x < 256; x++) {
        const s = (y * 256 + x) * 4;
        const a = iconRgb[s + 3] / 255;
        if (a <= 0) continue;
        const d = ((oy + y) * W + ox + x) * 4;
        for (let c = 0; c < 3; c++) buf[d + c] = Math.round(buf[d + c] * (1 - a) + iconRgb[s + c] * a);
      }
    }
    // Р±РµРіСѓС‰Р°СЏ РїРѕР»РѕСЃР°
    const barX = Math.round(((t * 1.2) % 1) * W);
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < 3; x++) {
        const px = (barX + x) % W;
        const o = (y * W + px) * 4;
        buf[o] = Math.min(255, buf[o] + 90);
        buf[o + 1] = Math.min(255, buf[o + 1] + 70);
        buf[o + 2] = 255;
      }
    }
    fs.writeFileSync(
      path.join(framesDir, `f${String(f).padStart(3, '0')}.png`),
      encodePNG(W, H, buf),
    );
  }

  const input = path.join(framesDir, 'f%03d.png');
  for (const [ext, args] of [
    ['mp4', ['-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '28']],
    ['webm', ['-c:v', 'libvpx-vp9', '-pix_fmt', 'yuv420p', '-b:v', '0', '-crf', '45']],
    ['mkv', ['-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '28']],
    ['mov', ['-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '28']],
    ['avi', ['-c:v', 'mpeg4', '-q:v', '8']],
    ['m4v', ['-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '28']],
    ['ogv', ['-c:v', 'libtheora', '-q:v', '6']],
  ]) {
    const out = path.join(tmp, `out.${ext}`);
    if (ff(['-framerate', '12', '-i', input, ...args, out])) add(`dpt/DPT.${ext}`, fs.readFileSync(out));
  }

  fs.rmSync(tmp, { recursive: true, force: true });
}
