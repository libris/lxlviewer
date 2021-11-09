import * as VocabUtil from '../vocab.js';
import context from '../../test-resources/context';

describe('VocabUtil', () => {
  describe('getPrefixFromBaseUri', () => {
    const externalTestCases = [
      ['http://www.w3.org/2001/XMLSchema#', 'xsd'],
      ['http://schema.org/', 'sdo'],
    ];
    const internalTestCases = [
      ['https://id.kb.se/vocab/', ''],
    ];
    
    test('Converts external bases to prefixed version', () => {
      for (let i = 0; i < externalTestCases.length; i++) {
        expect(VocabUtil.getPrefixFromBaseUri(externalTestCases[i][0], context['@context'])).toBe(externalTestCases[i][1]);
      }
    });
    test('Converts internal base to empty string', () => {
      for (let i = 0; i < internalTestCases.length; i++) {
        expect(VocabUtil.getPrefixFromBaseUri(internalTestCases[i][0], context['@context'])).toBe(internalTestCases[i][1]);
      }
    });
  });

  describe('hasCategory', () => {
    describe('check if the supplied termObj has the category', () => {
      
      const termObjSingle = {
        category: {
          '@id': 'https://id.kb.se/vocab/Integral',
        },
      };
      const termObjMultiple = {
        category: [
          {
            '@id': 'https://id.kb.se/vocab/Integral',
          },
          {
            '@id': 'https://id.kb.se/vocab/Filtered',
          },
        ]
      };
      const termObjNone = {};
      test('termObj with one category defined', () => {
        expect(VocabUtil.hasCategory(termObjSingle, 'Integral', context['@context'])).toBe(true);
        expect(VocabUtil.hasCategory(termObjSingle, 'NotExisting', context['@context'])).toBe(false);
      });
      test('termObj with multiple categories defined', () => {
        expect(VocabUtil.hasCategory(termObjMultiple, 'Integral', context['@context'])).toBe(true);
        expect(VocabUtil.hasCategory(termObjMultiple, 'NotExisting', context['@context'])).toBe(false);
      });
      test('termObj with no category defined', () => {
        expect(VocabUtil.hasCategory(termObjNone, 'Integral', context['@context'])).toBe(false);
      });
    });
  });
});
