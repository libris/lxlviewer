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
      // pending test below
      it('should return a class');

      it('should return the correct class given the input', function() {
        const fetchedClass = vocabUtil.getClass('text', vocab, 'kbv:');
        expect(fetchedClass).to.deep.equal(exampleClass);
      });
    });
});
