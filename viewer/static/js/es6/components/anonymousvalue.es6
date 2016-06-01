import * as _ from 'lodash';
import DataNode from './datanode';
import LinkedItem from './linkeditem';

export default {
  template: '#anonymous-value',
  name: 'anonymous-value',
  props: {
    key: {},
    value: {},
    vocab: {},
    linked: {},
  },
  methods: {
    isPlainObject(o) {
      return _.isPlainObject(o);
    },
    removeThis() {
      const holder = this.$parent.value;
      if (_.isArray(holder)) {
        holder.$remove(this.value);
      } else {
        this.$parent.emptyValue();
      }
    },
  },
  components: {
    'data-node': DataNode,
    'linked-item': LinkedItem,
  },
};
