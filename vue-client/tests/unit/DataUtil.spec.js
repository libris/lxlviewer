import { rewriteValueOfKey } from '@/utils/data';

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
