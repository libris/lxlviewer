<template>
  <div class="TermTree">
    <h2>Termer i {{ termTitle }}</h2>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import * as DisplayUtil from "lxljs/display";

export default {
  data() {
    return {};
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
};
</script>

<style lang="scss"></style>
