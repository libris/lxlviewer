<script>
import { mapGetters } from 'vuex';
import * as DisplayUtil from 'lxljs/display';

export default {
  props: {
    // excludeProperties: {
    //   type: Array,
    //   default: () => [],
    // },
  },
  methods: {
  },
  computed: {
    ...mapGetters(['vocab', 'display', 'currentDocument', 'quoted', 'resources', 'vocabContext', 'settings']),
    getItemLabel() {
      const label = DisplayUtil.getItemLabel(
        this.entityData,
        this.resources,
        this.quoted,
        this.settings,
      );
      if (label === this.entityData) {
        return this.translateKey(this.entityData);
      }
      return label;
    },
    getChip() {
      const chip = DisplayUtil.getChip(
        this.entityData,
        this.resources,
        this.quoted,
        this.settings,
      );
      return chip;
    },
    getCard() {
      const card = DisplayUtil.getCard(
        this.entityData,
        this.resources,
        this.quoted,
        this.settings,
      );
      return card;
    },
    getSummary() {
      const summary = DisplayUtil.getItemSummary(
        this.entityData,
        this.resources,
        this.quoted,
        this.settings,
        this.excludeProperties,
      );
      return summary;
    },
  },
};
</script>
