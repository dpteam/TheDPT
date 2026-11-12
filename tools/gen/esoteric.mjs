// Эзотерика, часть 1. Часть программ генерируется из логики, а не копипастится.

export const BF = '++++++++[>++++++++<-]>++++.++++++++++++.++++.';

const OOK = {
  '+': 'Ook. Ook.',
  '-': 'Ook! Ook!',
  '>': 'Ook. Ook?',
  '<': 'Ook? Ook.',
  '.': 'Ook! Ook.',
  ',': 'Ook. Ook!',
  '[': 'Ook! Ook?',
  ']': 'Ook? Ook!',
};

export const ookOf = (bf) =>
  [...bf].map((c) => OOK[c]).filter(Boolean).join(' ');

/** Whitespace: push N + output char, на каждый символ. */
export const wsOf = (text) => {
  const S = ' ';
  const T = '\t';
  const L = '\n';
  let out = '';
  for (const ch of text) {
    const bits = ch.charCodeAt(0).toString(2).replace(/0/g, S).replace(/1/g, T);
    out += S + S + S + bits + L; // push
    out += T + L + S + S; // out char
  }
  return out + L + L + L;
};

/** Deadfish: 8 -> square 64 -> +4 = 68, +12 = 80, +4 = 84. */
export const DEADFISH = 'iiiiiiiisiiiio' + 'i'.repeat(12) + 'oiiiio';

export const esoteric1 = [
  { ext: 'bf', name: 'Brainfuck', note: 'печатает `DPT` восемью плюсами', body: BF + '\n' },
  {
    ext: 'ook',
    name: 'Ook!',
    note: 'тот же brainfuck, но по-орангутаньи',
    body: ookOf(BF) + '\n',
  },
  {
    ext: 'ws',
    name: 'Whitespace',
    note: '`DPT` из пробелов и табов — файл выглядит пустым',
    body: wsOf('DPT'),
  },
  {
    ext: 'b93',
    name: 'Befunge-93',
    note: 'строка в обратную сторону, `,,,` печатает `DPT`',
    body: '"TPD",,,@\n',
  },
  {
    ext: 'lol',
    name: 'LOLCODE',
    note: 'печатает `DPT`',
    body: 'HAI 1.2\n  VISIBLE "DPT"\nKTHXBYE\n',
  },
  {
    ext: 'chef',
    name: 'Chef',
    note: 'рецепт из 68 г dart, 80 г power и 84 г team',
    body: `DPT.

This is the smallest recipe that still shouts the team name.

Ingredients.
68 g dart
80 g power
84 g team

Method.
Put dart into the mixing bowl.
Pour contents of the mixing bowl into the baking dish.
Put power into the mixing bowl.
Pour contents of the mixing bowl into the baking dish.
Put team into the mixing bowl.
Pour contents of the mixing bowl into the baking dish.

Serves 1.
`,
  },
  {
    ext: 'spl',
    name: 'Shakespeare',
    note: 'акт I, сцена I: DPT кричит своё имя',
    body: `The DPT.

DartPower Team is a proud bunch of coders.

Act I: The shout.

Scene I: The console.

[Enter DPT and Team]

DPT:
You are as good as the sum of a big big big big big big cat and a big big cat.
Speak your mind!

Team:
You are as good as the sum of a big big big big big big cat and a big big big big cat.
Speak your mind!

DPT:
You are as good as the sum of the sum of a big big big big big big cat and a big big big big cat and a big big cat.
Speak your mind!

[Exeunt]
`,
  },
  {
    ext: 'arnoldc',
    name: 'ArnoldC',
    note: 'TALK TO THE HAND "DPT"',
    body: `IT'S SHOWTIME
TALK TO THE HAND "DPT"
YOU HAVE BEEN TERMINATED
`,
  },
  {
    ext: 'rock',
    name: 'Rockstar',
    note: 'Shout "DPT"',
    body: `Shout "DPT"
`,
  },
  {
    ext: 'emojic',
    name: 'Emojicode',
    note: 'печатает `DPT` эмодзи',
    body: `🏁 🍇
  😀 🔤DPT🔤 ❗️
🍉
`,
  },
  {
    ext: 'i',
    name: 'INTERCAL',
    note: 'READ OUT массива из трёх чисел',
    body: `\tPLEASE DO ,1 <- #3
\tDO ,1 SUB #1 <- #68
\tDO ,1 SUB #2 <- #80
\tDO ,1 SUB #3 <- #84
\tPLEASE READ OUT ,1
\tPLEASE GIVE UP
`,
  },
  {
    ext: 'b',
    name: 'Brainfuck (.b)',
    note: 'тот же brainfuck, как в оригинальном репо `e.b`',
    body: BF + '\n',
  },
  {
    ext: 'deadfish',
    name: 'Deadfish',
    note: '8 i, квадрат, +4 = 68 — и так три раза',
    body: DEADFISH + '\n',
  },
  {
    ext: 'hq9plus',
    name: 'HQ9+',
    note: '`H` печатает Hello, world!, `+` крутит счётчик',
    body: 'H+\n',
  },
  {
    ext: 'befunge98',
    name: 'Befunge-98',
    note: 'тот же трюк, но с `q` вместо `@`',
    body: '"TPD",,,q\n',
  },
];
