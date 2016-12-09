/**
 * Test module
 */

// Module
import * as stringUtil from '../../static/js/es6/utils/string';
import * as vocab from './vocab.json';

// Suite
describe('Utility: string', function () {

  let vocabPfx = 'kbv:';

  beforeEach(function() {

  });

  // Test
  it('is available', function () {
    expect(stringUtil).not.to.be.null;
  });
  describe('labelByLang()', function () {
    it('returns a label in the specified language', function () {
      expect(stringUtil.labelByLang('audience', 'sv', vocab, vocabPfx)).to.equal('målgrupp');
    });
    it('if no match: return input string', function () {
      expect(stringUtil.labelByLang('latjolajban', 'sv', vocab, vocabPfx)).to.equal('latjolajban');
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
