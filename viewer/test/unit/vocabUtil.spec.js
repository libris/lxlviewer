/**
 * Test module
 */

// Module
import * as vocabUtil from '../../static/js/es6/utils/vocab';
import * as vocab from './vocab.json';

// Suite
describe('vocabUtil', function () {

  let exampleClass = {
    "@id": "kbv:text",
    "@type": [
      "FunctionalProperty",
      "ObjectProperty"
    ],
    "domainIncludes": [
      {
        "@id": "kbv:Audio"
      }
    ],
    "equivalentProperty": [
      {
        "@id": "sdo:text"
      }
    ],
    "inDataset": {
      "@id": "https:\/\/id.kb.se\/definitions"
    },
    "isDefinedBy": {
      "@id": "kbv:"
    },
    "note": [
      "MARC bib 006[13:14]",
      "MARC bib 006[14:15]",
      "MARC bib 008[31:32]",
      "MARC bib 008[30:31]"
    ],
    "wasDerivedFrom": {
      "@id": "file:\/\/\/dataset\/vocab"
    }
  };

  // Test
  it('is available', function () {
    expect(vocabUtil).not.to.be.null;
  });
  describe('getClass', function() {
    let fetchedClass = {};

    before(function() {
      // runs before all tests in this block
      fetchedClass = vocabUtil.getClass('text', vocab, 'kbv:');
    });

    it('should return a vocab class as an object', function() {
      expect(fetchedClass).to.be.an('object');
    });

    it('should return the correct vocab class', function() {
      expect(fetchedClass).to.deep.equal(exampleClass);
    });
  });
});
