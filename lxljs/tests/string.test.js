import * as StringUtil from '../string.js';
import context from '../../test-resources/context';

describe('StringUtil', () => {

  describe('removeDomain', () => {
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
    test('Removes any strings included in supplied array', () => {
      for (let i = 0; i < testCases.length; i++) {
        expect(StringUtil.removeDomain(testCases[i][0], removeables)).toBe(testCases[i][1]);
      }
    })
  });

  describe('convertToPrefix', () => {
    const externalTestCases = [
      ['http://www.w3.org/2001/XMLSchema#TestWord', 'xsd:TestWord'],
      ['http://schema.org/TestWord', 'sdo:TestWord'],
    ];
    const internalTestCases = [
      ['https://id.kb.se/vocab/TestWord', 'TestWord'],
    ];
    test('Replaces the baseUri part of an external uri to a prefix', () => {
      for (let i = 0; i < externalTestCases.length; i++) {
        expect(StringUtil.convertToPrefix(externalTestCases[i][0], context['@context'])).toBe(externalTestCases[i][1]);
      }
    });
    test('Replaces the baseUri part of an internal uri to an empty string', () => {
      for (let i = 0; i < internalTestCases.length; i++) {
        expect(StringUtil.convertToPrefix(internalTestCases[i][0], context['@context'])).toBe(internalTestCases[i][1]);
      }
    });
  });

});
