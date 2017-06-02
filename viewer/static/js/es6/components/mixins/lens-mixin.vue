<script>
import * as DisplayUtil from '../../utils/display';
import * as StringUtil from '../../utils/string';

export default {
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
    translateable(type) {
      if (type === '@type' || type === 'issuanceType') {
        return true;
      }
      return false;
    },
    getFormattedEntries(list) {
      let formatted = [];
      for (const entry of list) {
        if (this.translateable(entry.property)) {
          formatted = formatted.concat(entry.value.map((obj) => {
            return StringUtil.labelByLang(obj, this.settings.language, this.vocab, this.settings.vocabPfx);
          }));
        } else {
          formatted = formatted.concat(entry.value);
        }
      }
      return formatted;
    },
  },
  computed: {
    getItemLabel() {
      const label = this.getFormattedEntries(this.getSummary.header);
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
