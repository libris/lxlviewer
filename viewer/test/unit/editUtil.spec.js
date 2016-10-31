/**
 * Test module
 */

// Module
import * as editUtil from '../../static/js/es6/utils/edit';

// Suite
describe('Utility: edit', function () {

  let linked = [];
  let bibObj = {};
  let metaObj = {};
  let mergedObj = {};

  beforeEach(function() {
    linked = [
      { '@id': 'sdflkjDFsemn' },
      { '@id': 'tdrErwdfEWsd', '@type': 'Record' },
      { '@id': 'oPdedsEFvMsw' },
    ];

    bibObj = { '@id': 'defmfnwEdesS', dimensions: null, extent: null };
    metaObj = { '@id': 'mnfwSwdSsdcD' };
    mergedObj = {
      '@graph': [
        { '@id': 'mnfwSwdSsdcD' },
        { '@id': 'defmfnwEdesS', dimensions: null, extent: null },
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
    expect(editUtil).not.to.be.null;
  });
  describe('getLinked()', function () {
    it('returns the correct object on match', function () {
      expect(editUtil.getLinked('tdrErwdfEWsd', linked)).to.deep.equal(linked[1]);
    });
    it('if no match: return object with @id based on get parameter', function () {
      expect(editUtil.getLinked('tdreFefmaSsd', linked)).to.deep.equal({'@id': 'tdreFefmaSsd'});
    });
  });

  describe('getMergedItems()', function () {
    it('returns an object matching the same structure as input data', function () {
      let result = editUtil.getMergedItems(metaObj, bibObj, linked);
      expect(result).to.deep.equal(mergedObj);
    });
  });

  describe('clean()', function () {
    it('should return the same object without any null fields', function () {
      expect(editUtil.clean(bibObj)).to.not.have.ownProperty('dimensions');
      expect(editUtil.clean(bibObj)).to.not.have.ownProperty('extent');
    });
  });
});
