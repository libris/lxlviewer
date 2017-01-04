<script>
import * as DisplayUtil from '../../utils/display';

export default {
  methods: {
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
  }
}
</script>
