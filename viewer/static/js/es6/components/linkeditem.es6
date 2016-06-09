import * as _ from 'lodash';
import ProcessedLabel from './processedlabel';

export default {
  template: '#linked-item',
  name: 'linked-item',
  props: {
    item: {},
    index: Number,
  },
  computed: {
  },
  methods: {
    removeThis() {
      const holder = this.$parent.value;
      if (_.isArray(holder)) {
        this.$parent.removeByIndex(this.index);
      } else {
        this.$parent.emptyValue();
      }
    },
  },
  components: {
    'processed-label': ProcessedLabel,
  },
};
