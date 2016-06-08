import * as _ from 'lodash';
import ProcessedLabel from './processedlabel';

export default {
  template: '#linked-item',
  name: 'linked-item',
  props: {
    item: {},
  },
  computed: {
  },
  methods: {
  },
  components: {
    'processed-label': ProcessedLabel,
  },
};
