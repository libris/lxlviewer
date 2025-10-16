import { normalizeFromList, removeNullValues, rewriteValueOfKey } from '@/utils/data';

describe('rewriteValueOfKey()', () => {
  const beforeObj = {
    shouldBeReplaced: 'hello',
    someOther: {
      shouldBeReplaced: {},
      someArray: [
        'test',
        {
        },
        {
          '@id': 'test',
        },
        {
          '@id': 'test2',
          shouldBeReplaced: ['testvalue'],
        },
      ],
    },
  };
  const key = 'shouldBeReplaced';
  const replaceValue = 'newValue';

  it('rewrite all keys (if run as deep = true) <key> with value supplied', () => {
    const afterObj = rewriteValueOfKey(beforeObj, key, replaceValue, true);
    const expectedObj = {
      shouldBeReplaced: 'newValue',
      someOther: {
        shouldBeReplaced: 'newValue',
        someArray: [
          'test',
          {},
          {
            '@id': 'test',
          },
          {
            '@id': 'test2',
            shouldBeReplaced: 'newValue',
          },
        ],
      },
    };
    expect(afterObj).toEqual(expectedObj);
  });
  it('rewrite outermost key (if run as deep = false) <key> with value supplied', () => {
    const afterObj = rewriteValueOfKey(beforeObj, key, replaceValue);
    const afterObjExplicitFalse = rewriteValueOfKey(beforeObj, key, replaceValue, false);
    const expectedObj = {
      shouldBeReplaced: 'newValue',
      someOther: {
        shouldBeReplaced: {},
        someArray: [
          'test',
          {
          },
          {
            '@id': 'test',
          },
          {
            '@id': 'test2',
            shouldBeReplaced: ['testvalue'],
          },
        ],
      },
    };
    expect(afterObj).toEqual(expectedObj);
    expect(afterObjExplicitFalse).toEqual(expectedObj);
  });
});

describe('removeNullValues and normalizeFromList', () => {
  const obj = {
    label: '',
    agent: null,
    copyright: '©'
  };

  it('removeNullValues should remove key value pairs for empty values, but not listed symbols', () => {
    const cleanedObj = removeNullValues(obj);
    const expectedObj = {
      copyright: '©'
    };
    expect(cleanedObj).toEqual(expectedObj);
  });

  it('normalizeFromList should remove key value pairs for empty values and listed symbols', () => {
    const cleanedObj = normalizeFromList(obj, ['©']);
    const expectedObj = {};
    expect(cleanedObj).toEqual(expectedObj);
  });

  it('normalizeFromList should remove key value pairs for empty values and listed symbols', () => {
    const cleanedObj = normalizeFromList({
      label: '',
      agent: null,
      copyright: ['©']
    }, ['©']);
    const expectedObj = {};
    expect(cleanedObj).toEqual(expectedObj);
  });

  it('normalizeFromList should remove phonogram symbol, copyright symbol and the resulting empty list', () => {
    const cleanedObj = normalizeFromList({
      copyright: ['℗', '©']
    }, ['\u00A9', '\u2117']);
    const expectedObj = {};
    expect(cleanedObj).toEqual(expectedObj);
  });

});
