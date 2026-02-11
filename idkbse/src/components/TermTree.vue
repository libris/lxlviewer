<template>
  <div class="TermTree">
    <h4 class="mt-4">Termer i {{ termTitle }}</h4>
    <p class="total-term-items">{{ totalTermItems }} termer</p>
    <!--<pre>{{ JSON.stringify(termItems, null, 2) }}</pre>-->
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import * as DisplayUtil from "lxljs/display";

export default {
  data() {
    return {
      terms: [],
    };
  },
  props: {
    entity: {
      type: Object,
      default: null,
    },
  },
  computed: {
    ...mapGetters([
      "vocab",
      "vocabContext",
      "resources",
      "settings",
      "appState",
    ]),
    entityData() {
      return this.entity;
    },
    termTitle() {
      return this.getEntityTitle(this.entity);
    },
    termItems() {
      return this.terms.items;
    },
    totalTermItems() {
      return this.terms.totalItems;
    },
  },
  methods: {},
  components: {},
  async fetch() {
    this.terms = await this.$http.$get(
      `${this.baseUri()}/find.json?inScheme.@id=https://id.kb.se/term/saogf&_limit=2000&_stats=false`
    );
  },
};
</script>

<style lang="scss">
  .total-term-items {
    color: $gray-700;
  }
</style>
