import * as StringUtil from '../string.js';

test('StringUtil/removeDomain - Removes any strings included in suuplied array', () => {
  const removeables = [
    'https://id.kb.se/',
    'http://libris.kb.se/',
    '.removethis./',
  ];
  const testCases = [
    ['https://id.kb.se/testing', 'testing'],
    ['http://id.kb.se/testing', 'http://id.kb.se/testing'],
    ['https://id.kb.se/.removethis./testing', 'testing'],
  ];
  for (let i = 0; i < testCases.length; i++) {
    expect(StringUtil.removeDomain(testCases[i][0], removeables)).toBe(testCases[i][1]);
  }
});
