/**
 * Test module
 */

// Module
import * as dataUtil from '../../static/js/es6/utils/data';

// Suite
describe('Utility: data', function () {

  let quoted = [];
  let mainEntityObj = {};
  let workObj = {};
  let recordObj = {};
  let packagedObj = {};

  beforeEach(function() {
    quoted = [
      {
        '@id': 'sdflkjDFsemn',
        '@graph': [
          {
            '@id': 'sdflkjDFsemn',
            'someProp': { '@id': 'dsfsDfmndfDE' },
          }
        ],
      },
      {
        '@id': 'tdrErwdfEWsd',
        '@graph': [
          { '@id': 'tdrErwdfEWsd', '@type': 'Record' },
        ],
      },
      {
        '@id': 'oPdedsEFvMsw',
        '@graph': [
          { '@id': 'oPdedsEFvMsw' },
        ],
      },
    ];

    mainEntityObj = {
      '@id': 'defmfnwEdesS',
      dimensions: null,
      extent: null,
      instanceOf: {
        '@id': 'bdsfgsfdds',
        nullField: null
      }
    };
    workObj = { '@id': 'eklejwsdDss', hasTitle: [] };
    recordObj = { '@id': 'mnfwSwdSsdcD' };
    packagedObj = {
      '@graph': [
        { '@id': 'mnfwSwdSsdcD' },
        { '@id': 'defmfnwEdesS', dimensions: null, extent: null, instanceOf: { '@id': 'bdsfgsfdds', nullField: null } },
        { '@id': 'eklejwsdDss', hasTitle: [] },
      ],
    };
  });

  // Test
  it('is available', function () {
    expect(dataUtil).not.to.be.null;
  });
  describe('getLinked()', function () {
    it('returns the correct object on match', function () {
      expect(dataUtil.getLinked('tdrErwdfEWsd', quoted)).to.deep.equal(quoted[1]['@graph'][0]);
    });

    it('returns marc: links un-embellished', function () {
      expect(dataUtil.getLinked('marc:someThing', quoted)).to.deep.equal({ '@id': 'marc:someThing' });
    });
    it('if no match: return object with @id based on get parameter', function () {
      expect(dataUtil.getLinked('tdreFefmaSsd', quoted)).to.deep.equal({'@id': 'tdreFefmaSsd'});
    });
  });

  describe('getMergedItems()', function () {
    it('returns an object matching the same structure as input data', function () {
      const result = dataUtil.getMergedItems(recordObj, mainEntityObj, workObj);
      expect(result).to.deep.equal(packagedObj);
    });
  });

  describe('removeNullValues()', function () {
    it('should return the same object without any null fields', function () {
      const instanceWithoutNull = dataUtil.removeNullValues(mainEntityObj);
      expect(instanceWithoutNull).to.not.have.ownProperty('dimensions');
      expect(instanceWithoutNull).to.not.have.ownProperty('extent');
      expect(instanceWithoutNull.instanceOf).to.not.have.ownProperty('nullField');
    });
  });
});
