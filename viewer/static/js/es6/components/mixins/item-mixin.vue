<script>
import * as EditUtil from '../../utils/edit';
import * as _ from 'lodash';

export default {
  methods: {
    removeThis() {
      this.$dispatch('remove-item', this.index);
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
      return EditUtil.getLinked(
        this.item['@id'],
        this.editorData.linked
      );
    },
  },
};
</script>
