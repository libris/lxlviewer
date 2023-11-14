import { buildDisplayData } from '@/utils/history';

const getLabel = (s) => `L:${s}`;

test('empty data and paths', () => {
  const prev = {};
  const curr = {};
  const added = [];
  const removed = [];

  const [data, paths] = buildDisplayData(prev, curr, added, removed, getLabel);

  expect(data).toEqual({});
  expect(paths).toEqual({
    added: [],
    removed: [],
    modified: [],
  });
});

test('modify string', () => {
  const prev = { a: 'x' };
  const curr = { a: 'y' };
  const added = [['a']];
  const removed = [['a']];

  const [data, paths] = buildDisplayData(prev, curr, added, removed, getLabel);

  expect(data).toEqual({
    a: 'L:x → L:y',
  });
  expect(paths).toEqual({
    added: [],
    removed: [],
    modified: ['a'],
  });
});

test('property added', () => {
  const prev = {
    p1: 'x',
  };
  const curr = {
    p1: 'x',
    p2: 'y',
  };
  const added = [['p2']];
  const removed = [];

  const [data, paths] = buildDisplayData(prev, curr, added, removed, getLabel);

  expect(data).toEqual({
    p1: 'x',
    p2: 'y',
  });
  expect(paths).toEqual({
    added: ['p2'],
    removed: [],
    modified: [],
  });
});

test('remove + add in array', () => {
  const prev = {
    p: [
      { '@id': 'x' },
    ],
  };
  const curr = {
    p: [
      { '@id': 'y' },
    ],
  };
  const added = [['p', 0]];
  const removed = [['p', 0]];

  const [data, paths] = buildDisplayData(prev, curr, added, removed, getLabel);

  expect(data).toEqual({
    p: [
      { '@id': 'y' },
      { '@id': 'x' },
    ],
  });
  expect(paths).toEqual({
    added: ['p[0]'],
    removed: ['p[1]'],
    modified: [],
  });
});

test('remove + add in array', () => {
  const prev = {
    p: [
      { '@id': 'r1' },
      { '@id': '-1' },
      { '@id': 'r2' },
      { '@id': '-2' },
      { '@id': 'r3' },
      { '@id': '-3' },
    ],
  };
  const curr = {
    p: [
      { '@id': 'A1' },
      { '@id': '-1' },
      { '@id': 'A2' },
      { '@id': '-2' },
      { '@id': 'A3' },
      { '@id': '-3' },
    ],
  };
  const added = [['p', 0], ['p', 2], ['p', 4]];
  const removed = [['p', 0], ['p', 2], ['p', 4]];

  const [data, paths] = buildDisplayData(prev, curr, added, removed, getLabel);

  expect(data).toEqual({
    p: [
      { '@id': 'A1' },
      { '@id': 'r1' },
      { '@id': '-1' },
      { '@id': 'A2' },
      { '@id': 'r2' },
      { '@id': '-2' },
      { '@id': 'A3' },
      { '@id': 'r3' },
      { '@id': '-3' },
    ],
  });
  expect(paths).toEqual({
    added: ['p[0]', 'p[3]', 'p[6]'],
    removed: ['p[1]', 'p[4]', 'p[7]'],
    modified: [],
  });
});

test('object replaced', () => {
  const prev = {
    p: { '@id': 'a' },
  };
  const curr = {
    p: { '@id': 'b' },
  };
  const added = [['p']];
  const removed = [['p']];

  const [data, paths] = buildDisplayData(prev, curr, added, removed, getLabel);

  expect(data).toEqual({
    p: [
      { '@id': 'b' },
      { '@id': 'a' },
    ],
  });
  expect(paths).toEqual({
    added: ['p[0]'],
    removed: ['p[1]'],
    modified: [],
  });
});

test('string to array', () => {
  const prev = {
    p: '1',
  };
  const curr = {
    p: [
      '2',
      '3',
    ],
  };
  const added = [['p']];
  const removed = [['p']];

  const [data, paths] = buildDisplayData(prev, curr, added, removed, getLabel);

  expect(data).toEqual({
    p: [
      '2',
      '3',
      '1',
    ],
  });
  expect(paths).toEqual({
    added: ['p[0]', 'p[1]'],
    removed: ['p[2]'],
    modified: [],
  });
});

test('array to string', () => {
  const prev = {
    p: [
      '1',
      '2',
    ],
  };
  const curr = {
    p: '3',
  };
  const added = [['p']];
  const removed = [['p']];

  const [data, paths] = buildDisplayData(prev, curr, added, removed, getLabel);

  expect(data).toEqual({
    p: [
      '3',
      '1',
      '2',
    ],
  });
  expect(paths).toEqual({
    added: ['p[0]'],
    removed: ['p[1]', 'p[2]'],
    modified: [],
  });
});

test('remove + add in array + nested', () => {
  const prev = {
    p: [
      { '@id': 'r1' },
      { '@id': '-1' },
      {
        p: [
          'a',
          'b',
          'c',
        ],
      },
      { '@id': '-2' },
      { '@id': 'r2' },
      { '@id': '-3' },
    ],
  };
  const curr = {
    p: [
      { '@id': 'A1' },
      { '@id': '-1' },
      {
        p: [
          'a',
          'B',
          'c',
          'd',
        ],
      },
      { '@id': '-2' },
      { '@id': 'A2' },
      { '@id': '-3' },
    ],
  };
  const added = [['p', 0], ['p', 2, 'p', 1], ['p', 2, 'p', 3], ['p', 4]];
  const removed = [['p', 0], ['p', 2, 'p', 1], ['p', 4]];

  const [data, paths] = buildDisplayData(prev, curr, added, removed, getLabel);

  expect(data).toEqual({
    p: [
      { '@id': 'A1' },
      { '@id': 'r1' },
      { '@id': '-1' },
      {
        p: [
          'a',
          'L:b → L:B',
          'c',
          'd',
        ],
      },
      { '@id': '-2' },
      { '@id': 'A2' },
      { '@id': 'r2' },
      { '@id': '-3' },
    ],
  });
  expect(paths).toEqual({
    added: ['p[0]', 'p[3].p[3]', 'p[5]'],
    removed: ['p[1]', 'p[6]'],
    modified: ['p[3].p[1]'],
  });
});

test('replace object and modify string', () => {
  const prev = {
    p: [
      '1a',
      { '@id': 'i1a' },
      '--',
      '1b',
      { '@id': 'i1b' },
    ],
  };
  const curr = {
    p: [
      '2a',
      { '@id': 'i2a' },
      '--',
      '2b',
      { '@id': 'i2b' },
    ],
  };
  const added = [['p', 0], ['p', 1], ['p', 3], ['p', 4]];
  const removed = [['p', 0], ['p', 1], ['p', 3], ['p', 4]];

  const [data, paths] = buildDisplayData(prev, curr, added, removed, getLabel);

  expect(data).toEqual({
    p: [
      'L:1a → L:2a',
      { '@id': 'i2a' },
      { '@id': 'i1a' },
      '--',
      'L:1b → L:2b',
      { '@id': 'i2b' },
      { '@id': 'i1b' },
    ],
  });

  expect(paths).toEqual({
    added: ['p[1]', 'p[5]'],
    removed: ['p[2]', 'p[6]'],
    modified: ['p[0]', 'p[4]'],
  });
});

test('modify + add string', () => {
  const prev = {
    i: [
      { a: 'b' },
      { c: [
        's1',
        's2',
      ] },
    ],
  };
  const curr = {
    i: [
      { a: 'b' },
      { c: [
        's1',
        's3',
        's4',
      ] },
    ],
  };
  const added = [['i', 1, 'c', 1], ['i', 1, 'c', 2]];
  const removed = [['i', 1, 'c', 1]];

  const [data, paths] = buildDisplayData(prev, curr, added, removed, getLabel);

  expect(data).toEqual({
    i: [
      { a: 'b' },
      { c: [
        's1',
        'L:s2 → L:s3',
        's4',
      ] },
    ],
  });

  expect(paths).toEqual({
    added: ['i[1].c[2]'],
    removed: [],
    modified: ['i[1].c[1]'],
  });
});
