import * as _ from 'lodash';
import ProcessedLabel from './processedlabel';

export default {
  template: '#linked-item',
  name: 'linked-item',
  props: {
    value: {},
    linked: {},
  },
  methods: {
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
  },
  components: {
    'processed-label': ProcessedLabel,
  },
};
