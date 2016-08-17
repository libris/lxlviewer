/**
 * Test module
 */

// Module
import * as formComponent from '../../static/js/es6/components/formcomponent';
import Vue from 'vue';
import * as vocab from './vocab.json';

// Suite
describe('Component: formcomponent', function () {

  // Test
  it('is available', function () {
    expect(formComponent).not.to.be.null;
  });

  describe('removeItem()', function() {
    it('should remove the item from the focused object');
  });
  describe('addItem()', function() {
    it('should add the item to the focused object', function () {
      const focusObj = {
        '@type': 'Text',
        someKey: [],
      };
      const testItem = { '@id': 'gobbledygook', 'unrelatedKey': 'blahh' };
      const testItemStripped = { '@id': 'gobbledygook' };
      const testFocus = {
        '@type': 'Text',
        someKey: [testItemStripped],
      };

      const vm = new Vue({
          template: '<div><test v-ref:test-component></test></div>',
          components: {
              'test': formComponent,
          }
      }).$mount();

      const form = vm.$refs.testComponent;
      form.focus = focusObj;
      form.vocab = vocab;
      form.linked = [];
      form.vocabPfx = 'kbv:';

      // Do manipulation
      vm.$broadcast('add-item', 'someKey', testItem);
      // Tests
      expect(form.focus).to.deep.equal(testFocus);
      expect(form.linked).to.include(testItem);
    });
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
