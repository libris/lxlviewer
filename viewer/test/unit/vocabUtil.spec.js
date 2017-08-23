/**
 * Test module
 */

// Module
import * as VocabUtil from '../../static/js/es6/utils/vocab';
import * as vocab from './vocab.json';

// Suite
describe('Utility: vocab', function () {

  const vocabPfx = 'kbv:';
  const vocabMap = new Map(vocab['@graph'].map((entry) => [entry['@id'], entry]));

  let textClass = {
      "@id": "kbv:Text",
      "@type": "Class",
      "equivalentClass": [
        {
          "@id": "dctype:Text"
        },
        {
          "@id": "bf2:Text"
        }
      ],
      "exactMatch": [
        {
          "@id": "http://rdvocab.info/termList/RDAContentType/1020"
        }
      ],
      "inCollection": {
        "@id": "default1:typeOfRecord"
      },
      "isDefinedBy": {
        "@id": "kbv:"
      },
      "labelByLang": {
        "en": "Text",
        "sv": "Text"
      },
      "subClassOf": [
        {
          "@id": "_:N0902caaf16bf4a6d92ec7b556fdc014f"
        },
        {
          "@id": "kbv:Work"
        },
        {
          "@id": "_:N137939c37e514e108ccae63e83bf5426"
        },
        {
          "@id": "_:N18d68b604cb545ecb4e468f290b049ee"
        },
        {
          "@id": "_:Nd8376d63d9fc4200aca617e09d76314d"
        },
        {
          "@id": "_:N3d4852461bc942cfacc73e8c0e5d888f"
        },
        {
          "@id": "_:N82c6ae5ee52c4d379eb0cee04dbb1505"
        },
        {
          "@id": "_:N017352ed12df4d48a17a602ce8c6cce4"
        }
      ]
    };

  let imageClass = {
    "@id": "kbv:Image",
    "@type": "Class",
    "equivalentClass": [
      {
        "@id": "dctype:Image"
      },
      {
        "@id": "foaf:Image"
      }
    ],
    "isDefinedBy": {
      "@id": "kbv:"
    },
    "labelByLang": {
      "sv": "Bild"
    },
    "subClassOf": [
      {
        "@id": "kbv:Work"
      }
    ]
  };

  let audioClass = {
    "@id": "kbv:Audio",
    "@type": "Class",
    "equivalentClass": [
      {
        "@id": "bf2:Audio"
      },
      {
        "@id": "dctype:Sound"
      }
    ],
    "exactMatch": [
      {
        "@id": "http://rdvocab.info/termList/RDAMediaType/1001"
      }
    ],
    "inCollection": {
      "@id": "default1:typeOfRecord"
    },
    "isDefinedBy": {
      "@id": "kbv:"
    },
    "labelByLang": {
      "en": "Audio",
      "sv": "Ljudmaterial"
    },
    "subClassOf": [
      {
        "@id": "_:Nc6759b52a26a4140a80ad967dcfe2e06"
      },
      {
        "@id": "_:Nf1bd637d2fe944e7914c5aa01d8629b1"
      },
      {
        "@id": "_:N0faa8d8effa44acaaf1199ca46697856"
      },
      {
        "@id": "_:N2cc2dac73c2c4f0fb59ece6ec9c2343f"
      },
      {
        "@id": "kbv:Work"
      },
      {
        "@id": "_:N92b8ac527f364942beac597e3dbd2b84"
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
    let fetchedClasses = [];
    let expectedSubclasses = [];

    before(function() {
      // runs before all tests in this block
      fetchedClasses = VocabUtil.getSubClasses('Creation', vocabMap, vocabPfx);
    });

    it('should return a list of vocab classes as an array of strings', function() {
      expect(fetchedClasses).to.be.an('array');
      expect(fetchedClasses[0]).to.be.a('string');
    });

    it('should return the correct vocab classes', function() {
      expect(fetchedClasses.indexOf(`${vocabPfx}Work`)).to.not.equal(-1);
      expect(fetchedClasses.indexOf(`${vocabPfx}Instance`)).to.not.equal(-1);

      expect(fetchedClasses.indexOf(`${vocabPfx}Electronic`)).to.equal(-1);
    });
  });

  describe('getAllSubClasses()', function() {
    let fetchedClasses = [];

    before(function() {
      // runs before all tests in this block
      fetchedClasses = VocabUtil.getAllSubClasses('Creation', vocabMap, vocabPfx);
    });

    it('should return a list of vocab classes as an array of strings', function() {
      expect(fetchedClasses).to.be.an('array');
      expect(fetchedClasses[0]).to.be.a('string');
    });

    it('should return the correct vocab classes', function() {
      expect(fetchedClasses.indexOf(`${vocabPfx}Electronic`)).to.not.equal(-1);
      expect(fetchedClasses.indexOf(`${vocabPfx}Image`)).to.not.equal(-1);
      expect(fetchedClasses.indexOf(`${vocabPfx}Work`)).to.not.equal(-1);

      expect(fetchedClasses.indexOf(`${vocabPfx}IndividualItem`)).to.equal(-1);
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

  describe('getInstances()', function () {

    let result = [];
    before(function() {
      // runs before all tests in this block
      result = VocabUtil.getInstances('IssuanceType', vocabMap, vocabPfx);
    });

    it('returns instances', function() {
      expect(result.length).to.not.equal(0);
    });
    it('returns the an array of strings', function() {
      expect(result).to.be.an('array');
      expect(result[0]).to.be.a('string');
    });
    it('returns the correct instances', function() {
      expect(result.indexOf(`Monograph`)).to.not.equal(-1);
    });

  });

});
