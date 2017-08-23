/**
 * Test module
 */

// Module
import * as formComponent from '../../static/js/es6/components/formcomponent';
import Vue from 'vue';
import * as vocab from './vocab.json';

// Suite
describe('Component: formcomponent', function () {

  let focusObj;

  function attachProps(formObj) {
    const obj = formObj;
    obj.focus = focusObj;
    obj.vocab = vocab;
    obj.linked = [];
    obj.vocabPfx = 'kbv:';
    return obj;
  }

  beforeEach(function() {
    focusObj = {
      '@type': 'Text',
      extent: [],
      relation: {},
    };
  });

  // Test
  it('is available', function () {
    expect(formComponent).not.to.be.null;
  });

  // describe('Events', function() {
  //   describe('addItem()', function() {
  //     it('should add the item to the focused object', function () {
  //       const testItem = { '@id': 'gobbledygook', 'dimension': 'blahh' };
  //       const testItemStripped = { '@id': testItem['@id'] };
  //       const testFocus = {
  //         '@type': 'Text',
  //         extent: [testItemStripped],
  //         relation: {},
  //       };
  //
  //       const vm = new Vue({
  //         template: '<div><test v-ref:test-component></test></div>',
  //         components: {
  //           'test': formComponent,
  //         }
  //       }).$mount();
  //
  //       const form = attachProps(vm.$refs.testComponent);
  //
  //       // Do manipulation
  //       vm.$broadcast('add-item', 'extent', testItem);
  //       // Tests
  //       expect(form.focus).to.deep.equal(testFocus);
  //       expect(form.linked).to.include(testItem);
  //     });
  //   });
  //   describe('addLocal()', function() {
  //     it('should add the item if key is array and set key to item if it is an object', function() {
  //       const testItem = { '@id': 'gobbledygook', 'dimension': 'blahh' };
  //
  //       const vm = new Vue({
  //         template: '<div><test v-ref:test-component></test></div>',
  //         components: {
  //           'test': formComponent,
  //         }
  //       }).$mount();
  //       const form = attachProps(vm.$refs.testComponent);
  //
  //       // Do manipulation
  //       vm.$broadcast('add-local', 'extent', testItem);
  //       vm.$broadcast('add-local', 'relation', testItem);
  //       // Tests
  //       expect(form.focus.extent[0]).to.deep.equal(testItem);
  //       expect(form.focus.relation).to.deep.equal(testItem);
  //     });
  //   });
  // });
  describe('Methods', function() {
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

});
