<template>
  <div class="TermTree">
    <h2>Termer i {{ termTitle }}</h2>
    {{ JSON.stringify(this.terms) }}
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import * as DisplayUtil from "lxljs/display";

export default {
  data() {
    return {
      terms: []
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
  },
  methods: {},
  components: {},
  async fetch() {
    this.terms = await this.$http.$get(`${this.baseUri()}/find.json?inScheme.@id=https://id.kb.se/term/saogf`)
  }
}
</script>

<style lang="scss"></style>
