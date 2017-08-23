/**
 * Test module
 */

// Module
import * as stringUtil from '../../static/js/es6/utils/string';
import * as vocab from './vocab.json';

// Suite
describe('Utility: string', function () {

  const vocabPfx = 'https://id.kb.se/vocab/';
  const vocabMap = new Map(vocab['@graph'].map((entry) => [entry['@id'], entry]));

  beforeEach(function() {

  });

  // Test
  it('is available', function () {
    expect(stringUtil).not.to.be.null;
  });
  describe('labelByLang()', function () {
    it('returns a translation of the label in the specified language', function () {
      expect(stringUtil.labelByLang('Instance', 'sv', vocabMap, vocabPfx)).to.equal('Instans');
    });
    it('returns the label of a term referenced by id in the specified language', function () {
      expect(stringUtil.labelByLang(`${vocabPfx}Instance`, 'sv', vocabMap, vocabPfx)).to.equal('Instans');
    });
    it('if no match: return input string with info about the term being unhandled', function () {
      expect(stringUtil.labelByLang('latjolajban', 'sv', vocabMap, vocabPfx)).to.equal('latjolajban (unhandled term)');
    });
    it('returns english label if specified language is not found', function () {
      expect(stringUtil.labelByLang('Instance', 'invalidCode', vocabMap, vocabPfx)).to.equal('Instance');
    });
  });
  describe('removeDomain()', function () {
    const removable = [
      'https://libris.kb.se/',
      'https://id.kb.se/',
    ];
    it('returns a string without the provided base uris', function () {
      expect(stringUtil.removeDomain('https://libris.kb.se/bib/123456789', removable)).to.equal('bib/123456789');
      expect(stringUtil.removeDomain('https://id.kb.se/auth/123456789', removable)).to.equal('auth/123456789');
    });
  });
});
