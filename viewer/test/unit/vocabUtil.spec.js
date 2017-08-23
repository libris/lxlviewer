/**
 * Test module
 */

// Module
import * as VocabUtil from '../../static/js/es6/utils/vocab';
import * as vocab from './vocab.json';

// Suite
describe('Utility: vocab', function () {

  const vocabPfx = 'https://id.kb.se/vocab/';
  const vocabMap = new Map(vocab['@graph'].map((entry) => [entry['@id'], entry]));

  let textClass = {
    "@id": "https:\/\/id.kb.se\/vocab\/Text",
    "@type": "Class",
    "equivalentClass": [
      {
        "@id": "http:\/\/id.loc.gov\/ontologies\/bibframe\/Text"
      },
      {
        "@id": "http:\/\/purl.org\/dc\/dcmitype\/Text"
      }
    ],
    "exactMatch": [
      {
        "@id": "http:\/\/rdvocab.info\/termList\/RDAContentType\/1020"
      }
    ],
    "inCollection": {
      "@id": "https:\/\/id.kb.se\/marc\/typeOfRecord"
    },
    "isDefinedBy": {
      "@id": "https:\/\/id.kb.se\/vocab\/"
    },
    "labelByLang": {
      "en": "Text",
      "sv": "Text"
    },
    "subClassOf": [
      {
        "@type": "Restriction",
        "onProperty": {
          "@id": "https:\/\/id.kb.se\/vocab\/illustrativeContent"
        },
        "someValuesFrom": {
          "@id": "https:\/\/id.kb.se\/marc\/BooksIllustrationsType"
        }
      },
      {
        "@type": "Restriction",
        "onProperty": {
          "@id": "https:\/\/id.kb.se\/vocab\/genreForm"
        },
        "someValuesFrom": [
          {
            "@id": "https:\/\/id.kb.se\/marc\/BooksLiteraryFormType"
          },
          {
            "@id": "https:\/\/id.kb.se\/marc\/GovernmentPublicationType"
          },
          {
            "@id": "https:\/\/id.kb.se\/marc\/BooksBiographyType"
          },
          {
            "@id": "https:\/\/id.kb.se\/marc\/BooksFestschriftType"
          },
          {
            "@id": "https:\/\/id.kb.se\/marc\/ConferencePublicationType"
          }
        ]
      },
      {
        "@type": "Restriction",
        "onProperty": {
          "@id": "https:\/\/id.kb.se\/vocab\/contentType"
        },
        "someValuesFrom": {
          "@id": "https:\/\/id.kb.se\/marc\/BooksContentsType"
        }
      },
      {
        "@type": "Restriction",
        "onProperty": {
          "@id": "https:\/\/id.kb.se\/vocab\/carrierType"
        },
        "someValuesFrom": [
          {
            "@id": "https:\/\/id.kb.se\/marc\/TextMaterialType"
          },
          {
            "@id": "https:\/\/id.kb.se\/marc\/BooksItemType"
          }
        ]
      },
      {
        "@id": "https:\/\/id.kb.se\/vocab\/Work"
      },
      {
        "@type": "Restriction",
        "onProperty": {
          "@id": "https:\/\/id.kb.se\/vocab\/contentType"
        },
        "someValuesFrom": {
          "@id": "https:\/\/id.kb.se\/marc\/BooksContentsType"
        }
      },
      {
        "@type": "Restriction",
        "onProperty": {
          "@id": "https:\/\/id.kb.se\/vocab\/intendedAudience"
        },
        "someValuesFrom": {
          "@id": "https:\/\/id.kb.se\/marc\/AudienceType"
        }
      },
      {
        "@type": "Restriction",
        "onProperty": {
          "@id": "https:\/\/id.kb.se\/vocab\/supplementaryContent"
        },
        "someValuesFrom": {
          "@id": "https:\/\/id.kb.se\/marc\/IndexType"
        }
      }
    ]
  };

  let imageClass = {
    "@id": "https:\/\/id.kb.se\/vocab\/Image",
    "@type": "Class",
    "equivalentClass": [
      {
        "@id": "foaf:Image"
      },
      {
        "@id": "http:\/\/purl.org\/dc\/dcmitype\/Image"
      }
    ],
    "isDefinedBy": {
      "@id": "https:\/\/id.kb.se\/vocab\/"
    },
    "labelByLang": {
      "sv": "Bild"
    },
    "subClassOf": [
      {
        "@id": "https:\/\/id.kb.se\/vocab\/Work"
      }
    ]
  };

  let audioClass = {
    "@id": "https:\/\/id.kb.se\/vocab\/Audio",
    "@type": "Class",
    "equivalentClass": [
      {
        "@id": "http:\/\/id.loc.gov\/ontologies\/bibframe\/Audio"
      },
      {
        "@id": "http:\/\/purl.org\/dc\/dcmitype\/Sound"
      }
    ],
    "exactMatch": [
      {
        "@id": "http:\/\/rdvocab.info\/termList\/RDAMediaType\/1001"
      }
    ],
    "inCollection": {
      "@id": "https:\/\/id.kb.se\/marc\/typeOfRecord"
    },
    "isDefinedBy": {
      "@id": "https:\/\/id.kb.se\/vocab\/"
    },
    "labelByLang": {
      "en": "Audio",
      "sv": "Ljudmaterial"
    },
    "subClassOf": [
      {
        "@type": "Restriction",
        "onProperty": {
          "@id": "https:\/\/id.kb.se\/vocab\/genreForm"
        },
        "someValuesFrom": [
          {
            "@id": "https:\/\/id.kb.se\/marc\/MusicCompositionType"
          },
          {
            "@id": "https:\/\/id.kb.se\/marc\/MusicTextType"
          }
        ]
      },
      {
        "@type": "Restriction",
        "onProperty": {
          "@id": "https:\/\/id.kb.se\/vocab\/musicFormat"
        },
        "someValuesFrom": {
          "@id": "https:\/\/id.kb.se\/marc\/MusicFormatType"
        }
      },
      {
        "@id": "https:\/\/id.kb.se\/vocab\/Work"
      },
      {
        "@type": "Restriction",
        "onProperty": {
          "@id": "https:\/\/id.kb.se\/vocab\/intendedAudience"
        },
        "someValuesFrom": {
          "@id": "https:\/\/id.kb.se\/marc\/AudienceType"
        }
      },
      {
        "@type": "Restriction",
        "onProperty": {
          "@id": "https:\/\/id.kb.se\/vocab\/supplementaryContent"
        },
        "someValuesFrom": {
          "@id": "https:\/\/id.kb.se\/marc\/MusicMatterType"
        }
      },
      {
        "@type": "Restriction",
        "onProperty": {
          "@id": "https:\/\/id.kb.se\/vocab\/carrierType"
        },
        "someValuesFrom": {
          "@id": "https:\/\/id.kb.se\/marc\/ItemType"
        }
      }
    ]
  };

  // Test
  it('is available', function () {
    expect(VocabUtil).not.to.be.null;
  });
  describe('getTermObject()', function() {
    let fetchedClass = {};

    before(function() {
      // runs before all tests in this block
      fetchedClass = VocabUtil.getTermObject('Text', vocabMap, vocabPfx);
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
      fetchedClasses = VocabUtil.getSubClasses('Creation', vocabMap, vocabPfx);
    });

    it('should return a list vocab classes as an array of strings', function() {
      expect(fetchedClasses).to.be.an('array');
      expect(fetchedClasses[0]).to.be.a('string');
    });

    it('should return the correct vocab classes', function() {
      expect(fetchedClasses.indexOf(`${vocabPfx}Work`)).to.not.equal(-1);
      expect(fetchedClasses.indexOf(`${vocabPfx}Instance`)).to.not.equal(-1);
      expect(fetchedClasses.indexOf(`${vocabPfx}Electronic`)).to.equal(-1);
    });
  });

  describe('getBaseClasses()', function() {
    let baseClasses;

    before(function() {
      // runs before all tests in this block
      baseClasses = VocabUtil.getBaseClasses(audioClass['@id'], vocabMap, vocabPfx);
    });

    it('should return an array', function() {
      expect(baseClasses).to.be.an('array');
    });
    it('should contain strings of IDs', function() {
      expect(baseClasses[0]).to.be.a('string');
    });

    it('should return the correct things', function() {
      expect(baseClasses[0]).to.equal('kbv:CreativeWork');
    });
  });

  describe('getBaseClassesFromArray()', function() {
    let baseClasses;
    let classList = ['kbv:Audio', 'kbv:Image'];

    before(function() {
      // runs before all tests in this block
      baseClasses = VocabUtil.getBaseClassesFromArray(classList, vocabMap, vocabPfx);
    });

    it('should return an array', function() {
      expect(baseClasses).to.be.an('array');
    });
    it('should contain strings of IDs', function() {
      expect(baseClasses[0]).to.be.a('string');
    });

    it('should return the correct things', function() {
      expect(baseClasses.length).to.equal(6);
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

      propertyId = 'manufacture';
      range = VocabUtil.getRange(propertyId, vocab, vocabPfx).sort();
      expectedResult = ['Manufacture', 'ProviderEvent'].sort();
      expect(range).to.eql(expectedResult);

      propertyId = 'gobbledygook'; // Invalid
      range = VocabUtil.getRange(propertyId, vocab, vocabPfx).sort();
      expectedResult = [];
      expect(range).to.eql(expectedResult);
    });
  });

  describe('getPropertyTypes()', function() {
    it('Should return an array of property types', function() {
      let propertyId = 'place';
      let types = VocabUtil.getPropertyTypes(propertyId, vocab, vocabPfx).sort();
      let expectedResult = ['FunctionalProperty', 'ObjectProperty'].sort();
      expect(types).to.eql(expectedResult);

      propertyId = 'sameAs';
      types = VocabUtil.getPropertyTypes(propertyId, vocab, vocabPfx).sort();
      expectedResult = ['ObjectProperty'];
      expect(types).to.eql(expectedResult);
    });
  });

});
