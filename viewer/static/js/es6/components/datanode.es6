import * as _ from 'lodash';
import ProcessedLabel from './processedlabel';
import AnonymousValue from './anonymousvalue';
import LinkedItem from './linkeditem';

export default {
  template: '#data-node',
  name: 'data-node',
  props: ['key', 'value', 'vocab', 'label', 'linked'],
  components: {
    'processed-label': ProcessedLabel,
    'anonymous-value': AnonymousValue,
    'linked-item': LinkedItem,
  },
  methods: {
    isMarc(key) {
      if (typeof key === 'undefined') {
        return false;
      }
      return (
        !!~key.indexOf('marc:') || !!~key.indexOf('_marc')
      );
    },
    updateValue(value) {
      this.$parent.focus[this.key] = value;
    },
    updateArray(index, value) {
      const object = this.$el;
      this.value.$set(index, value);
      Vue.nextTick(() => {
        object.focus();
      });
    },
    emptyValue() {
      this.$parent.updateValue(this.key, {});
    },
    getLinked(id) {
      const linked = this.linked;
      if (typeof linked === 'undefined') {
        return {};
      }
      for (let i = 0; i < linked.length; i ++) {
        if (linked[i]['@id'] === id) {
          return linked[i];
        }
      }
      return id;
    },
    isEditable(key) {
      const tempNotEditable = [
        '@id',
        '@type',
        'controlNumber',
        'systemNumber',
        'created',
        'modified',
      ];
      return !~tempNotEditable.indexOf(key);
    },
    isArray(o) {
      return _.isArray(o);
    },
    isPlainObject(o) {
      return _.isPlainObject(o);
    },
    removeItem(key, value) {
      return this.$parent.removeItem(key, value);
    },
  },
};
