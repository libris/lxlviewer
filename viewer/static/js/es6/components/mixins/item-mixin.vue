<script>
import * as DataUtil from '../../utils/data';
import * as _ from 'lodash';

export default {
  methods: {
    removeThis() {
      this.$dispatch('remove-item', this.index);
    },
  },
  events: {
    'remove-entity'(){
      this.removeThis();
    },
  },
  computed: {
    focusData() {
      if (!this.item['@id']) {
        return this.item;
      }
      if (_.isArray(this.item) || !_.isObject(this.item)) {
        throw new Error('Item is not an object.');
      }
      return DataUtil.getLinked(
        this.item['@id'],
        this.editorData.quoted
      );
    },
  },
};
</script>
