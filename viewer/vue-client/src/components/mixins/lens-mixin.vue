<script>
import * as DisplayUtil from '@/utils/display';

export default {
  props: {
    excludeProperties: {
      type: Array,
      default: () => [],
    },
  },
  methods: {
    getLabel(item) {
      if (!this.display || !this.inspector.data || !this.resources.vocab || !this.settings || !this.resources.context) {
        throw new Error('Missing display/vocab/settings or similar. Did you set up Vuex getters for this component?');
      }
      const label = DisplayUtil.getItemLabel(
        item,
        this.resources.display,
        this.inspector.data.quoted,
        this.resources.vocab,
        this.settings,
        this.resources.context,
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
      // const label = this.getLabel(this.focusData);
      const labelArray = [];
      for (const key of Object.keys(this.getChip)) {
        labelArray.push(this.getChip[key]);
      }
      labelArray.forEach((el, i) => {
        if (Array.isArray(el) && (el.length > 1)) {
          labelArray[i] = labelArray[i].join(', ');
        }
      });
      return labelArray.join(' • ');
    },
    getChip() {
      const chip = DisplayUtil.getChip(
        this.focusData,
        this.resources.display,
        this.inspector.data.quoted,
        this.resources.vocab,
        this.settings,
        this.resources.context,
      );
      return chip;
    },
    getCard() {
      const card = DisplayUtil.getCard(
        this.focusData,
        this.resources.display,
        this.inspector.data.quoted,
        this.resources.vocab,
        this.settings,
        this.resources.context,
      );
      return card;
    },
    getSummary() {
      const summary = DisplayUtil.getItemSummary(
        this.focusData,
        this.resources.display,
        this.inspector.data.quoted,
        this.resources.vocab,
        this.settings,
        this.resources.context,
        this.excludeProperties,
      );
      return summary;
    },
  },
};
</script>
