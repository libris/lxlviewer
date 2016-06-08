import * as _ from 'lodash';
import DataNode from './datanode';
import LinkedItem from './linkeditem';
import * as editUtil from '../utils/edit';

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
    getLinked(id) {
      return editUtil.getLinked(id, this.linked);
    },
  },
  components: {
    'data-node': DataNode,
    'linked-item': LinkedItem,
  },
};
