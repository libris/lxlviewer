<script>
import * as DisplayUtil from '../../utils/display';
import * as StringUtil from '../../utils/string';
import { getVocabularyClasses } from '../../vuex/getters';

export default {
  vuex: {
    actions: {
    },
    getters: {
      vocabClasses: getVocabularyClasses,
    },
  },
  methods: {
    getLabel(item) {
      if (!this.display || !this.editorData || !this.vocab || !this.settings) {
        throw new Error('Missing display/vocab/settings or similar. Did you set up Vuex getters for this component?');
      }
      const label = DisplayUtil.getItemLabel(
        item,
        this.display,
        this.editorData.quoted,
        this.vocab,
        this.settings
      );
      return label;
    },
  },
  computed: {
    getItemLabel() {
      const label = this.getLabel(this.focusData);
      return label;
    },
    getChip() {
      const chip = DisplayUtil.getChip(
        this.focusData,
        this.display,
        this.editorData.quoted,
        this.vocab,
        this.settings
      );
      return chip;
    },
    getCard() {
      const card = DisplayUtil.getCard(
        this.focusData,
        this.display,
        this.editorData.quoted,
        this.vocab,
        this.settings
      );
      return card;
    },
    getSummary() {
      const summary = DisplayUtil.getItemSummary(
        this.focusData,
        this.display,
        this.editorData.quoted,
        this.vocab,
        this.settings
      );
      return summary;
    },
  },
};
</script>
