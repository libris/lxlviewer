<script>
import * as DisplayUtil from '../../utils/display';

export default {
  methods: {
  },
  computed: {
    getItemLabel() {
      const label = DisplayUtil.getItemLabel(
        this.focusData,
        this.display,
        this.editorData.linked,
        this.vocab,
        this.settings
      );
      return label;
    },
    getChip() {
      const chip = DisplayUtil.getChip(
        this.focusData,
        this.display,
        this.editorData.linked,
        this.vocab,
        this.settings
      );
      return chip;
    },
    getCard() {
      const card = DisplayUtil.getCard(
        this.focusData,
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
