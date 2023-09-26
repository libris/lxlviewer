<script>
import * as DisplayUtil from 'lxljs/display';
import * as StringUtil from 'lxljs/string';

export default {
  props: {
    excludeProperties: {
      type: Array,
      default: () => [],
    },
  },
  methods: {
    getLabel(item) {
      if (!this.resources.display || !this.inspector.data || !this.resources.vocab || !this.settings || !this.resources.context) {
        throw new Error('Missing display/vocab/settings or similar. Did you set up Vuex getters for this component?');
      }
      const label = DisplayUtil.getItemLabel(
        item,
        this.resources,
        this.inspector.data.quoted,
        this.settings,
      );
      return label;
    },
  },
  computed: {
    settings() {
      return this.$store.getters.settings;
    },
    resources() {
      return this.$store.getters.resources;
    },
    inspector() {
      return this.$store.getters.inspector;
    },
    getItemLabel() {
      return DisplayUtil.getItemLabel(
        this.focusData,
        this.resources,
        this.inspector.data.quoted,
        this.settings,
      );
    },
    getStringLabel() {
      return StringUtil.getLabelByLang(
        this.focusData,
        this.user.settings.language,
        this.resources,
      );
    },
    getChip() {
      const chip = DisplayUtil.getChip(
        this.focusData,
        this.resources,
        this.inspector.data.quoted,
        this.settings,
      );
      return chip;
    },
    getCard() {
      const card = DisplayUtil.getCard(
        this.focusData,
        this.resources,
        this.inspector.data.quoted,
        this.settings,
      );
      return card;
    },
    getSummary() {
      const mainSummary = DisplayUtil.getItemSummary(
        this.focusData,
        this.resources,
        this.inspector.data.quoted,
        this.settings,
        this.resources.displayGroups,
        this.excludeProperties,
      );
      const record = this.focusData.meta || this.recordData || {};
      const recordSummary = DisplayUtil.getItemSummary(
        record,
        this.resources,
        this.inspector.data.quoted,
        this.settings,
        this.resources.displayGroups,
        this.excludeProperties,
      );
      return {
        categorization: mainSummary.categorization.concat(recordSummary.categorization),
        header: mainSummary.header,
        info: mainSummary.info,
      };
    },
  },
};
</script>
