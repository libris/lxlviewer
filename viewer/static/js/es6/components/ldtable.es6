import * as _ from 'lodash';
import LinkAdder from './linkadder';
import ProcessedLabel from './processedlabel';

export default {
  template: '#ld-table',
  props: {
    item: {},
    vocab: {},
    linked: {},
  },
  methods: {
    isArray(o) {
      return _.isArray(o);
    },
    isPlainObject(o) {
      return _.isPlainObject(o);
    },
    addItem(key, item) {
      this.$parent.addItem(key, item);
    },
    removeItem(key, item) {
      this.$parent.removeItem(key, item);
    },
  },
  components: {
    'link-adder': LinkAdder,
    'data-node': {
      template: '#data-node',
      name: 'data-node',
      props: ['key', 'value', 'index', 'label'],
      components: {
        'processed-label': ProcessedLabel,
      },
      methods: {
        getLinked(id) {
          const index = this.index;
          if (typeof index === 'undefined') {
            return {};
          }
          for (let i = 0; i < index.length; i ++) {
            if (index[i]['@id'] === id) {
              return index[i];
            }
          }
          return id;
        },
        isMarc(key) {
          if (typeof key === 'undefined') {
            return false;
          }
          return (
            !!~key.indexOf('marc:') || !!~key.indexOf('_marc')
          );
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
    },
  },
};
