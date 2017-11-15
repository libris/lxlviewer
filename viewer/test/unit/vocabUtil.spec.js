/**
 * Test module
 */

// Module
import * as VocabUtil from '../../static/js/es6/utils/vocab';
import * as vocab from './vocab.json';
import * as context from './context.json';

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

  describe('getBaseUriFromPrefix()', function() {
    const prefix = 'kbv';
    const expectedBaseUri = 'https://id.kb.se/vocab/';
    const nonePrefix = 'lolprefix';
    const expectedNoneBaseUri = '';
    let fetchedBaseUri = '';
    let fetchedNoneBaseUri = '';

    before(function() {
      fetchedBaseUri = VocabUtil.getBaseUriFromPrefix(prefix, context['@context']);
      fetchedNoneBaseUri = VocabUtil.getBaseUriFromPrefix(nonePrefix, context['@context']);
    });

    it('should return the corresponding baseUri as a string', function() {
      expect(fetchedBaseUri).to.equal(expectedBaseUri);
    });
    it('should return an empty string if no baseUri was found', function() {
      expect(fetchedNoneBaseUri).to.equal(expectedNoneBaseUri);
    });
  });

  describe('getPrefixesFromBaseUri()', function() {
    const baseUri = 'https://id.kb.se/vocab/';
    const expectedPrefixes = ['kbv', '@vocab'];
    let fetchedPrefixes;
    let fetchedNonePrefixes;
    const noneBaseURi = 'https://a.non.existing';

    before(function() {
      fetchedPrefixes = VocabUtil.getPrefixesFromBaseUri(baseUri, context['@context']);
      fetchedNonePrefixes = VocabUtil.getPrefixesFromBaseUri(noneBaseURi, context['@context']);
    });

    it('should return the correspoding prefixes as array of strings', function() {
      expect(fetchedPrefixes.length).to.equal(2);
    });
    it('should return an empty array if no prefixes found', function() {
      expect(fetchedNonePrefixes.length).to.equal(0);
    });
  });

  describe('getContextProperty()', function () {
    const originalPrefLabelProperty = 'prefLabel';
    const finalPrefLabelProperty = 'skos:prefLabel';
    const originalMainTitleProperty = 'mainTitle';
    let fetchedPrefLabelProperty = '';
    let fetchedMainTitleProperty = '';

    before(function() {
      fetchedPrefLabelProperty = VocabUtil.getContextProperty(originalPrefLabelProperty, context['@context']);
      fetchedMainTitleProperty = VocabUtil.getContextProperty(originalMainTitleProperty, context['@context']);
    });

    it('should get the property from context', function() {
      expect(fetchedPrefLabelProperty).to.equal(finalPrefLabelProperty);
      expect(fetchedMainTitleProperty).to.equal(originalMainTitleProperty);
    });
  });

  describe('getContextContainer()', function () {
    const originalProp = 'skos:prefLabel';
    const expectedObject = { '@id': 'prefLabelByLang', '@container': '@language' };
    let fetchedObject;
    let undefinedObject = {};
    const undefinedContainerProp = 'prefLabel';

    before(function() {
      fetchedObject = VocabUtil.getContextWithContainer(originalProp, context['@context']);
      undefinedObject = VocabUtil.getContextWithContainer(undefinedContainerProp, context['@context']);
    });

    it('should return an object with prop and container if available', function () {
      expect(JSON.stringify(fetchedObject)).to.equal(JSON.stringify(expectedObject));
    });

    it('should return undefined if none is available', function () {
      expect(typeof undefinedObject).to.equal('undefined');
    });
  });

  describe('getTermObject()', function() {
    let fetchedClass = {};

    before(function() {
      // runs before all tests in this block
      fetchedClass = VocabUtil.getTermObject('Text', vocabMap, vocabPfx, context['@context']);
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
      fetchedClasses = VocabUtil.getSubClasses('Creation', vocabMap, vocabPfx, context['@context']);
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
      fetchedClasses = VocabUtil.getAllSubClasses('Creation', vocabMap, vocabPfx, context['@context']);
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
      baseClasses = VocabUtil.getBaseClasses(audioClass['@id'], vocabMap, vocabPfx, context['@context']);
    });

    it('should return an array', function() {
      expect(baseClasses).to.be.an('array');
    });
    it('should contain strings of IDs', function() {
      expect(baseClasses[0]).to.be.a('string');
    });

    it('should return the correct things', function() {
      expect(baseClasses.indexOf(`${vocabPfx}Work`)).to.not.equal(-1);
      expect(baseClasses.indexOf(`${vocabPfx}Creation`)).to.not.equal(-1);
    });
  });

  describe('getBaseClassesFromArray()', function() {
    let baseClasses;
    let classList = [`${vocabPfx}Audio`, `${vocabPfx}Image`];

    before(function() {
      // runs before all tests in this block
      baseClasses = VocabUtil.getBaseClassesFromArray(classList, vocabMap, vocabPfx, context['@context']);
    });

    it('should return an array', function() {
      expect(baseClasses).to.be.an('array');
    });
    it('should contain strings of IDs', function() {
      expect(baseClasses[0]).to.be.a('string');
    });

    it('should include the original classlist in the result', function() {
      expect(baseClasses.indexOf(`${vocabPfx}Audio`)).to.not.equal(-1);
      expect(baseClasses.indexOf(`${vocabPfx}Image`)).to.not.equal(-1);
    });

    it('should return the correct baseclasses', function() {
      expect(baseClasses.indexOf(`${vocabPfx}Creation`)).to.not.equal(-1);
      expect(baseClasses.indexOf(`${vocabPfx}Endeavour`)).to.not.equal(-1);
    });
  });


  describe('getRange()', function() {
    it('should return a list of class IDs which is in range of the property provided', function() {
      let propertyId = 'place';
      let range = VocabUtil.getRange(propertyId, vocabMap, vocabPfx, context['@context']);
      expect(range.indexOf(`${vocabPfx}Place`)).to.not.eql(-1);

      propertyId = 'mergedToForm';
      range = VocabUtil.getRange(propertyId, vocabMap, vocabPfx, context['@context']);
      expect(range.indexOf(`${vocabPfx}Creation`)).to.not.eql(-1);

      propertyId = 'gobbledygook'; // Invalid
      range = VocabUtil.getRange(propertyId, vocabMap, vocabPfx, context['@context']);
      expect(range.length).to.eql(0);
      expect(range.indexOf(`${vocabPfx}gobbledygook`)).to.eql(-1);
    });

    it('should return a list of class IDs which is in range of the baseProperty provided', function() {
      let propertyId = 'findingAid';
      let range = VocabUtil.getRange(propertyId, vocabMap, vocabPfx, context['@context']);
      expect(range.indexOf(`${vocabPfx}Endeavour`)).to.not.eql(-1);
      expect(range.indexOf(`${vocabPfx}Creation`)).to.not.eql(-1);
    });
  });

  describe('getFullRange()', function() {

  });

  describe('getPropertyTypes()', function() {
    it('Should return an array of property types', function() {

      let propertyId = 'place';
      let types = VocabUtil.getPropertyTypes(propertyId, vocabMap, vocabPfx, context['@context']);
      let expectedResult = ['ObjectProperty'];
      expect(types).to.be.an('array');
      expect(types).to.eql(expectedResult);

      propertyId = 'sameAs';
      types = VocabUtil.getPropertyTypes(propertyId, vocabMap, vocabPfx, context['@context']);
      expectedResult = ['ObjectProperty'];
      expect(types).to.eql(expectedResult);

      propertyId = 'availability';
      types = VocabUtil.getPropertyTypes(propertyId, vocabMap, vocabPfx, context['@context']);
      expectedResult = ['Property'];
      expect(types).to.eql(expectedResult);
    });
  });

  describe('getInstances()', function () {

    let result = [];
    before(function() {
      // runs before all tests in this block
      result = VocabUtil.getInstances('IssuanceType', vocabMap, vocabPfx, context['@context']);
    });

    it('returns instances', function() {
      expect(result.length).to.not.equal(0);
    });
    it('returns an array of strings', function() {
      expect(result).to.be.an('array');
      expect(result[0]).to.be.a('string');
    });
    it('returns the correct instances', function() {
      expect(result.indexOf(`Monograph`)).to.not.equal(-1);
    });
  });

  describe('getValuesFrom()', function() {
    let result = VocabUtil.getValuesFrom('Electronic', 'carrierType', vocabMap, vocabPfx, context['@context']);

    it('returns types as array', function() {
      expect(result).to.be.an('array');
    });

    it('returns the restriction type for the specified property and entityType', function() {
      expect(result).to.eql(['https://id.kb.se/marc/ComputerMaterialType']);
    });


    it('returns an empty array if no restriction type is found', function() {
      result = VocabUtil.getValuesFrom('Electronic', 'kalle', vocabMap, vocabPfx, context['@context']);
      expect(result).to.be.an('array');
      expect(result.length).to.eql(0);
    });
  });

  describe('processRestrictions()', function() {
    let result = VocabUtil.processRestrictions(['Work'], 'SoundRecording', 'instanceOf', vocabMap, vocabPfx, context['@context']);

    it('returns types as array', function() {
      expect(result).to.be.an('array');
    });

    it('returns overridden range when restriction is present', function() {
    result = VocabUtil.processRestrictions(['Work'], 'SoundRecording', 'instanceOf', vocabMap, vocabPfx, context['@context']);
      expect(result).to.eql(['Audio']);
    });


    it('returns range when restriction is not present', function() {
      result = VocabUtil.processRestrictions(['Work'], 'Instance', 'instanceOf', vocabMap, vocabPfx, context['@context']);
      expect(result).to.eql(['Work']);
    });
  });

});
