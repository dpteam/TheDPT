// Рисуем иконку из пиксельного шрифта 5x7 руками, без canvas и зависимостей.
// Всё считается в высоком разрешении (суперсэмплинг x4), потом усредняется вниз.

export const GLYPHS = {
  D: [
    '111111',
    '100001',
    '100001',
    '100001',
    '100001',
    '100001',
    '111111',
  ],
  P: [
    '111111',
    '100001',
    '100001',
    '111111',
    '100000',
    '100000',
    '100000',
  ],
  T: [
    '111111',
    '001100',
    '001100',
    '001100',
    '001100',
    '001100',
    '001100',
  ],
};

export const TEXT = 'DPT';
export const GLYPH_W = 6;
export const ROWS = 7;
export const COLS = TEXT.length * GLYPH_W + (TEXT.length - 1);

const BG_TOP = [11, 16, 34];
const BG_BOTTOM = [23, 31, 66];
const GLOW = [124, 92, 255];
const ACCENT_LEFT = [110, 231, 255];
const ACCENT_RIGHT = [167, 139, 250];
const BORDER = [61, 78, 148];

const lerp = (a, b, t) => a + (b - a) * t;
const clamp01 = (t) => (t < 0 ? 0 : t > 1 ? 1 : t);
const mix = (c1, c2, t) => [
  lerp(c1[0], c2[0], t),
  lerp(c1[1], c2[1], t),
  lerp(c1[2], c2[2], t),
];

function roundedRectAlpha(x, y, w, h, r) {
  const dx = Math.max(r - x, 0, x - (w - r));
  const dy = Math.max(r - y, 0, y - (h - r));
  const d = Math.hypot(dx, dy);
  return clamp01(r - d + 0.5);
}

/** Геометрия иконки в единицах 0..1, чтобы одинаково рисовать PNG и SVG. */
export function layout() {
  const pad = 0.155;
  const maxW = 1 - 2 * pad;
  const maxH = 0.4;
  const s = Math.min(maxW / COLS, maxH / ROWS);
  const textW = COLS * s;
  const textH = ROWS * s;
  const x0 = (1 - textW) / 2;
  const y0 = 0.5 - textH / 2 - 0.035;
  const barH = Math.max(s * 0.55, 0.012);
  return {
    radius: 0.215,
    s,
    textW,
    textH,
    x0,
    y0,
    bar: { x: x0 + textW * 0.22, y: y0 + textH + s * 1.5, w: textW * 0.56, h: barH },
  };
}

/** Растр size x size, RGBA. */
export function render(size, { supersample = 4 } = {}) {
  const S = size * supersample;
  const hi = Buffer.alloc(S * S * 4);
  const geo = layout();

  const put = (px, py, r, g, b, a) => {
    if (px < 0 || py < 0 || px >= S || py >= S || a <= 0) return;
    const i = (py * S + px) * 4;
    const inv = 1 - a;
    hi[i] = Math.round(hi[i] * inv + r * a);
    hi[i + 1] = Math.round(hi[i + 1] * inv + g * a);
    hi[i + 2] = Math.round(hi[i + 2] * inv + b * a);
    hi[i + 3] = Math.round(hi[i + 3] * inv + 255 * a);
  };

  for (let py = 0; py < S; py++) {
    const v = (py + 0.5) / S;
    const bg = mix(BG_TOP, BG_BOTTOM, v);
    // фиолетовое свечение за буквами
    for (let px = 0; px < S; px++) {
      const u = (px + 0.5) / S;
      const cover = roundedRectAlpha(u * S, v * S, S, S, geo.radius * S);
      if (cover <= 0) continue;
      const dx = (u - 0.5) / 0.46;
      const dy = (v - 0.47) / 0.36;
      const glow = clamp01(1 - Math.hypot(dx, dy)) ** 2 * 0.34;
      const base = mix(bg, GLOW, glow);
      put(px, py, base[0], base[1], base[2], cover);
    }
  }

  // Буквы: не рисуем прямоугольники, а спрашиваем у сетки, включена ли клетка.
  // Так между соседними «пикселями» не остаётся швов от сглаживания.
  const pitch = GLYPH_W + 1; // клетка + межбуквенный зазор
  for (let py = 0; py < S; py++) {
    const v = (py + 0.5) / S;
    const row = Math.floor((v - geo.y0) / geo.s);
    if (row < 0 || row >= ROWS) continue;
    for (let px = 0; px < S; px++) {
      const u = (px + 0.5) / S;
      const col = Math.floor((u - geo.x0) / geo.s);
      if (col < 0 || col >= COLS) continue;
      const letter = Math.floor(col / pitch);
      const cell = col - letter * pitch;
      if (cell >= GLYPH_W) continue; // зазор между буквами
      const glyph = GLYPHS[TEXT[letter]];
      if (glyph[row][cell] !== '1') continue;
      const t = clamp01((u - geo.x0) / geo.textW);
      const color = mix(ACCENT_LEFT, ACCENT_RIGHT, t);
      put(px, py, color[0], color[1], color[2], 1);
    }
  }

  // Акцентная полоска под буквами
  const bar = geo.bar;
  for (let y = Math.round(bar.y * S); y < Math.round((bar.y + bar.h) * S); y++) {
    for (let x = Math.round(bar.x * S); x < Math.round((bar.x + bar.w) * S); x++) {
      const t = clamp01((x / S - bar.x) / bar.w);
      const color = mix(ACCENT_LEFT, ACCENT_RIGHT, t);
      put(x, y, color[0], color[1], color[2], 0.9);
    }
  }

  // Внутренняя обводка
  const ringW = Math.max(1, S * 0.006);
  for (let py = 0; py < S; py++) {
    for (let px = 0; px < S; px++) {
      const u = (px + 0.5) / S;
      const v = (py + 0.5) / S;
      const outer = roundedRectAlpha(u * S, v * S, S, S, geo.radius * S);
      const inner = roundedRectAlpha(u * S, v * S, S - ringW, S - ringW, (geo.radius - 0.006) * S);
      const ring = clamp01(outer - inner);
      if (ring > 0) put(px, py, BORDER[0], BORDER[1], BORDER[2], ring * 0.85);
    }
  }

  // Даунсэмпл
  const out = Buffer.alloc(size * size * 4);
  const n = supersample * supersample;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let r = 0;
      let g = 0;
      let b = 0;
      let a = 0;
      for (let dy = 0; dy < supersample; dy++) {
        for (let dx = 0; dx < supersample; dx++) {
          const i = ((y * supersample + dy) * S + (x * supersample + dx)) * 4;
          const alpha = hi[i + 3] / 255;
          r += hi[i] * alpha;
          g += hi[i + 1] * alpha;
          b += hi[i + 2] * alpha;
          a += alpha;
        }
      }
      const o = (y * size + x) * 4;
      if (a > 0) {
        out[o] = Math.round(r / a);
        out[o + 1] = Math.round(g / a);
        out[o + 2] = Math.round(b / a);
        out[o + 3] = Math.round((a / n) * 255);
      }
    }
  }
  return out;
}

/** Тот же макет, но вектором. */
export function renderSVG(size = 512) {
  const geo = layout();
  const rects = [];
  for (let li = 0; li < TEXT.length; li++) {
    const glyph = GLYPHS[TEXT[li]];
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < GLYPH_W; col++) {
        if (glyph[row][col] !== '1') continue;
        rects.push({
          x: geo.x0 + (li * (GLYPH_W + 1) + col) * geo.s,
          y: geo.y0 + row * geo.s,
          w: geo.s,
          h: geo.s,
        });
      }
    }
  }
  const bar = geo.bar;
  const f = (n) => (n * size).toFixed(2);
  const bars = rects
    .map(
      (r) =>
        `    <rect x="${f(r.x)}" y="${f(r.y)}" width="${f(r.w)}" height="${f(r.h)}" fill="url(#letters)"/>`,
    )
    .join('\n');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" role="img" aria-label="TheDPT — DartPower Team">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#0B1022"/>
      <stop offset="1" stop-color="#171F42"/>
    </linearGradient>
    <linearGradient id="letters" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#6EE7FF"/>
      <stop offset="1" stop-color="#A78BFA"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.5" cy="0.47" r="0.5">
      <stop offset="0" stop-color="#7C5CFF" stop-opacity="0.38"/>
      <stop offset="1" stop-color="#7C5CFF" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${f(geo.radius)}" fill="url(#bg)"/>
  <rect width="${size}" height="${size}" rx="${f(geo.radius)}" fill="url(#glow)"/>
  <g>
${bars}
  </g>
  <rect x="${f(bar.x)}" y="${f(bar.y)}" width="${f(bar.w)}" height="${f(bar.h)}" rx="${f(bar.h / 2)}" fill="url(#letters)" opacity="0.9"/>
  <rect x="${f(0.003)}" y="${f(0.003)}" width="${f(0.994)}" height="${f(0.994)}" rx="${f(geo.radius)}" fill="none" stroke="#3D4E94" stroke-width="${f(0.006)}" opacity="0.85"/>
</svg>
`;
}
