/**
 * Test module
 */

// Module
import * as editUtil from '../../static/js/es6/utils/edit';

// Suite
describe('editUtil', function () {

  let linked = [];

  beforeEach(function() {
    linked = [
      {'@id': 'sdflkjDFsemn'},
      {'@id': 'tdrErwdfEWsd', '@type': 'Record'},
      {'@id': 'oPdedsEFvMsw'},
    ];
  });

  // Test
  it('is available', function () {
    expect(editUtil).not.to.be.null;
  });
  describe('getLinked', function () {
    it('returns the correct object on match', function () {
      expect(editUtil.getLinked('tdrErwdfEWsd', linked)).to.deep.equal({'@id': 'tdrErwdfEWsd', '@type': 'Record'});
    });
    it('if no match: return object with @id based on get parameter', function () {
      expect(editUtil.getLinked('tdreFefmaSsd', linked)).to.deep.equal({'@id': 'tdreFefmaSsd'});
    });
  });


});
