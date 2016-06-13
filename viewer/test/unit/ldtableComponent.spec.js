/**
 * Test module
 */

// Module
import * as ldtableComponent from '../../static/js/es6/components/ldtable';

// Suite
describe('Component: ld-table', function () {

  // Test
  it('is available', function () {
    expect(ldtableComponent).not.to.be.null;
  });

  describe('removeItem()', function() {
    it('should remove the item from the focused object');
  });
  describe('addItem()', function() {
    it('should add the item to the focused object');
  });
  describe('addAnonymous()', function() {
    it('should add an anonymous value to the focused object');
  });
  describe('isEmpty()', function() {
    it('should return true if node is empty');
  });
  describe('addField()', function() {
    it('should add an empty field to the focused object');
  });
  describe('updateValue()', function() {
    it('should update the value of a node');
  });

});
