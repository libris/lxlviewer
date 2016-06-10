/**
 * Test module
 */

// Module
import * as editUtil from '../../static/js/es6/utils/edit';

// Suite
describe('editUtil', function () {

  const linked = [
    {'@id': 'sdflkjDFsemn'},
    {'@id': 'tdrErwdfEWsd', '@type': 'Record'},
    {'@id': 'oPdedsEFvMsw'},
  ];

  // Test
  it('is available', function () {
    expect(editUtil).not.to.be.null;
  });
  describe('getLinked', function () {
    it('returns an object, even if no match', function () {
      // this item should exist
      expect(editUtil.getLinked('tdrErwdfEWsd', linked)).to.deep.equal({'@id': 'tdrErwdfEWsd', '@type': 'Record'});
      // this item should not exist
      expect(editUtil.getLinked('tdreFefmaSsd', linked)).to.deep.equal({'@id': 'tdreFefmaSsd'});
    });
    it('returns the correct object', function () {
      expect(editUtil.getLinked('tdrErwdfEWsd', linked)).to.deep.equal({'@id': 'tdrErwdfEWsd', '@type': 'Record'});
    });

  });


});
