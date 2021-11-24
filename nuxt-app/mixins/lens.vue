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
    ...mapGetters(['vocab', 'display', 'currentDocument', 'resources', 'vocabContext', 'settings']),
    getItemLabel() {
      return DisplayUtil.getItemLabel(
        this.entityData,
        this.resources,
        this.currentDocument.quoted,
        this.settings,
      );
    },
    getChip() {
      const chip = DisplayUtil.getChip(
        this.entityData,
        this.resources,
        this.currentDocument.quoted,
        this.settings,
      );
      return chip;
    },
    getCard() {
      const card = DisplayUtil.getCard(
        this.entityData,
        this.resources,
        this.currentDocument.quoted,
        this.settings,
      );
      return card;
    },
    getSummary() {
      const summary = DisplayUtil.getItemSummary(
        this.entityData,
        this.resources,
        this.currentDocument.quoted,
        this.settings,
        this.excludeProperties,
      );
      return summary;
    },
  },
};
</script>
