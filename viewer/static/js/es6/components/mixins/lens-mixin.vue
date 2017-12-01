<script>
import * as DisplayUtil from '../../utils/display';
import * as StringUtil from '../../utils/string';
import * as _ from 'lodash';
import { getVocabularyClasses, getContext } from '../../vuex/getters';

export default {
  vuex: {
    actions: {
    },
    getters: {
      context: getContext,
      vocabClasses: getVocabularyClasses,
    },
  },
  methods: {
    getLabel(item) {
      if (!this.display || !this.editorData || !this.vocab || !this.settings || !this.context) {
        throw new Error('Missing display/vocab/settings or similar. Did you set up Vuex getters for this component?');
      }
      const label = DisplayUtil.getItemLabel(
        item,
        this.display,
        this.editorData.quoted,
        this.vocab,
        this.settings,
        this.context
      );
      return label;
    },
  },
  computed: {
    getItemLabel() {
      // const label = this.getLabel(this.focusData);
      const labelArray = [];
      _.each(this.getChip, value => labelArray.push(value));
      return labelArray.join(' • ');
    },
    getChip() {
      const chip = DisplayUtil.getChip(
        this.focusData,
        this.display,
        this.editorData.quoted,
        this.vocab,
        this.settings,
        this.context
      );
      return chip;
    },
    getCard() {
      const card = DisplayUtil.getCard(
        this.focusData,
        this.display,
        this.editorData.quoted,
        this.vocab,
        this.settings,
        this.context
      );
      return card;
    },
    getSummary() {
      const summary = DisplayUtil.getItemSummary(
        this.focusData,
        this.display,
        this.editorData.quoted,
        this.vocab,
        this.settings,
        this.context
      );
      return summary;
    },
  },
};
</script>
