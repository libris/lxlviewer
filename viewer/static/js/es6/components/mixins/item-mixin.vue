<script>
import * as DisplayUtil from '../../utils/display';
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
    getChip() {
      const chip = DisplayUtil.getChip(
        this.linkedItem,
        this.display,
        this.editorData.linked,
        this.vocab,
        this.settings
      );
      return chip;
    },
    getCard() {
      const card = DisplayUtil.getCard(
        this.linkedItem,
        this.display,
        this.editorData.linked,
        this.vocab,
        this.settings
      );
      return card;
    },
  },
}
</script>
