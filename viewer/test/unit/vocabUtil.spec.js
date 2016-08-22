/**
 * Test module
 */

// Module
import * as VocabUtil from '../../static/js/es6/utils/vocab';
import * as vocab from './vocab.json';

// Suite
describe('Utility: vocab', function () {

  const vocabPfx = 'kbv:';

  let textClass = {
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

  let imageClass = {
    "@id": "kbv:Image",
    "@type": "Class",
    "equivalentClass": [
      {
        "@id": "foaf:Image"
      },
      {
        "@id": "dctype:Image"
      }
    ],
    "inDataset": {
      "@id": "https:\/\/id.kb.se\/definitions"
    },
    "isDefinedBy": {
      "@id": "kbv:"
    },
    "labelByLang": {
      "sv": "Bild"
    },
    "subClassOf": [
      {
        "@id": "kbv:CreativeWork"
      }
    ],
    "wasDerivedFrom": {
      "@id": "file:\/\/\/dataset\/vocab"
    }
  };

  let audioClass = {
    "@id": "kbv:Audio",
    "@type": "Class",
    "equivalentClass": [
      {
        "@id": "dctype:Sound"
      },
      {
        "@id": "bf:Audio"
      }
    ],
    "exactMatch": [
      {
        "@id": "http:\/\/rdvocab.info\/termList\/RDAMediaType\/1001"
      }
    ],
    "inCollection": {
      "@id": "marc:typeOfRecord"
    },
    "inDataset": {
      "@id": "https:\/\/id.kb.se\/definitions"
    },
    "isDefinedBy": {
      "@id": "kbv:"
    },
    "labelByLang": {
      "sv": "Ljudmaterial"
    },
    "subClassOf": [
      {
        "@id": "kbv:CreativeWork"
      }
    ],
    "wasDerivedFrom": {
      "@id": "file:\/\/\/dataset\/vocab"
    }
  };

  // Test
  it('is available', function () {
    expect(VocabUtil).not.to.be.null;
  });
  describe('getClass()', function() {
    let fetchedClass = {};

    before(function() {
      // runs before all tests in this block
      fetchedClass = VocabUtil.getClass('text', vocab, vocabPfx);
    });

    it('should return a vocab class as an object', function() {
      expect(fetchedClass).to.be.an('object');
    });

    it('should return the correct vocab class', function() {
      expect(fetchedClass).to.deep.equal(textClass);
    });
  });

  describe('getSubClasses()', function() {
    let fetchedClasses = {};
    let expectedSubclasses = [];

    before(function() {
      // runs before all tests in this block
      fetchedClasses = VocabUtil.getSubClasses('CreativeWork', vocab, vocabPfx);
    });

    it('should return a list vocab classes as an object array', function() {
      expect(fetchedClasses).to.be.an('array');
      expect(fetchedClasses[0]).to.be.an('object');
    });

    it('should return the correct vocab classes', function() {
      // Testing if 'CreativeWork' has subClasses 'image' and 'audio'.
      expect(fetchedClasses[0]).to.deep.equal(imageClass);
      expect(fetchedClasses[15]).to.deep.equal(audioClass);
    });
  });

  describe('getBaseClasses()', function() {
    let baseClasses = {};

    before(function() {
      // runs before all tests in this block
      baseClasses = VocabUtil.getBaseClasses(audioClass, vocab);
    });

    it('should return a list of class objects', function() {
      expect(baseClasses).to.be.an('array');
      expect(baseClasses[0]).to.be.an('object');
    });

    it('should return the correct things', function() {
      expect(baseClasses[0]).to.equal();
    });
  });

  describe('getRange()', function() {
    it('should return a list of class IDs which is in range of the property provided', function() {
      let propertyId = 'place';
      let range = VocabUtil.getRange(propertyId, vocab, vocabPfx).sort();
      let expectedResult = ['Place'].sort();
      expect(range).to.eql(expectedResult);

      propertyId = 'replaces';
      range = VocabUtil.getRange(propertyId, vocab, vocabPfx).sort();
      expectedResult = ['Concept', 'Serial'].sort();
      expect(range).to.eql(expectedResult);
    });
  });

});
