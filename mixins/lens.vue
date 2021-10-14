<script>
import { mapGetters } from 'vuex';
import * as DisplayUtil from '@/utils/display';

export default {
  props: {
    // excludeProperties: {
    //   type: Array,
    //   default: () => [],
    // },
  },
  methods: {
  //   getLabel(item) {
  //     if (!this.display || !this.inspector.data || !this.vocab || !this.settings || !this.context) {
  //       throw new Error('Missing display/vocab/settings or similar. Did you set up Vuex getters for this component?');
  //     }
  //     const label = DisplayUtil.getItemLabel(
  //       item,
  //       this.display,
  //       this.entityReferences,
  //       this.vocab,
  //       this.settings,
  //       this.context,
  //     );
  //     return label;
  //   },
  },
  computed: {
    ...mapGetters(['vocab', 'display', 'entityReferences', 'resources', 'vocabContext', 'settings']),
    getItemLabel() {
      return DisplayUtil.getItemLabel(
        this.entityData,
        this.resources,
        this.entityReferences,
        this.settings,
      );
    },
    getChip() {
      const chip = DisplayUtil.getChip(
        this.entityData,
        this.resources,
        this.entityReferences,
        this.settings,
      );
      return chip;
    },
    getCard() {
      const card = DisplayUtil.getCard(
        this.entityData,
        this.resources,
        this.entityReferences,
        this.settings,
      );
      return card;
    },
    getSummary() {
      const summary = DisplayUtil.getItemSummary(
        this.entityData,
        this.resources,
        this.entityReferences,
        this.settings,
        this.excludeProperties,
      );
      return summary;
    },
  },
};
</script>
