<script>
import * as DisplayUtil from '../../utils/display';
import * as EditUtil from '../../utils/edit';
import * as _ from 'lodash';

export default {
  methods: {
    removeThis() {
      this.$dispatch('remove-item', this.index);
    },
    isObject(value) {
      return _.isObject(value);
    },
  },
  computed: {
    embellished() {
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
    getChip() {
      const chip = DisplayUtil.getChip(
        this.embellished,
        this.display,
        this.editorData.linked,
        this.vocab,
        this.settings
      );
      return chip;
    },
    getCard() {
      const card = DisplayUtil.getCard(
        this.embellished,
        this.display,
        this.editorData.linked,
        this.vocab,
        this.settings
      );
      return card;
    },
  },
};
</script>
