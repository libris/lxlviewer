/**
 * Test module
 */

// Module
import * as dataUtil from '../../static/js/es6/utils/data';

// Suite
describe('Utility: data', function () {

  let linked = [];
  let instanceObj = {};
  let workObj = {};
  let recordObj = {};
  let packagedObj = {};

  beforeEach(function() {
    linked = [
      { '@id': 'sdflkjDFsemn' },
      { '@id': 'tdrErwdfEWsd', '@type': 'Record' },
      { '@id': 'oPdedsEFvMsw' },
    ];

    instanceObj = { '@id': 'defmfnwEdesS', dimensions: null, extent: null };
    workObj = { '@id': 'eklejwsdDss', hasTitle: [] };
    recordObj = { '@id': 'mnfwSwdSsdcD' };
    packagedObj = {
      '@graph': [
        { '@id': 'mnfwSwdSsdcD' },
        { '@id': 'defmfnwEdesS', dimensions: null, extent: null },
        { '@id': 'eklejwsdDss', hasTitle: [] },
        {
          '@graph': {
            '@id': 'sdflkjDFsemn',
          },
        },
        {
          '@graph': {
            '@id': 'tdrErwdfEWsd',
            '@type': 'Record',
          },
        },
        {
          '@graph': {
            '@id': 'oPdedsEFvMsw',
          },
        },
      ],
    };
  });

  // Test
  it('is available', function () {
    expect(dataUtil).not.to.be.null;
  });
  describe('getLinked()', function () {
    it('returns the correct object on match', function () {
      expect(dataUtil.getLinked('tdrErwdfEWsd', linked)).to.deep.equal(linked[1]);
    });
    it('if no match: return object with @id based on get parameter', function () {
      expect(dataUtil.getLinked('tdreFefmaSsd', linked)).to.deep.equal({'@id': 'tdreFefmaSsd'});
    });
  });

  describe('getMergedItems()', function () {
    it('returns an object matching the same structure as input data', function () {
      let result = dataUtil.getMergedItems(recordObj, instanceObj, workObj);
      expect(result).to.deep.equal(packagedObj);
    });
  });

  describe('removeNullValues()', function () {
    it('should return the same object without any null fields', function () {
      expect(dataUtil.removeNullValues(instanceObj)).to.not.have.ownProperty('dimensions');
      expect(dataUtil.removeNullValues(instanceObj)).to.not.have.ownProperty('extent');
    });
  });
});
