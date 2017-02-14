<script>
import * as DisplayUtil from '../../utils/display';

export default {
  methods: {
    getLabel(item) {
      if (!this.display || !this.editorData || !this.vocab || !this.settings) {
        throw new Error('Missing display/vocab/settings or similar. Did you set up Vuex getters for this component?');
      }
      const label = DisplayUtil.getItemLabel(
        item,
        this.display,
        this.editorData.linked,
        this.vocab,
        this.settings
      );
      return label;
    }
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
