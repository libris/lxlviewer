<template>
  <div class="TermTreeItemLabel">
    <h5>
      <a :href="translateUriEnv(this['@id'])">
        {{ this.conciseLabel }}
      </a>
    </h5>
    <a
      class="TermTreeItemLabel-anchor"
      :href="`#${encodeURI(this['@id'].split('/').slice(-1).pop())}`"
      :title="translateUi('Copy anchor link')"
      @click="copyAnchor"
    >
      #
    </a>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import LensMixin from "@/mixins/lens";

export default {
  mixins: [LensMixin],
  name: "TermTreeItemLabel",
  data() {
    return {};
  },
  props: {
    "@id": String,
    label: String,
    code: String,
  },
  computed: {
    ...mapGetters([
      "vocab",
      "vocabContext",
      "resources",
      "settings",
      "appState",
    ]),
    conciseLabel() {
      // FIXME
      return this.label
        .replace(` · ${this.code}`, "")
        .replace(" · Genre/form", "");
    },
    hashId() {
      return encodeURI(this["@id"].split("/").pop());
    },
  },
  methods: {
    copyAnchor() {
      const anchorHref = `${window.location.origin}${$nuxt.$route.path}#${this.hashId}`;
      navigator.clipboard.writeText(anchorHref);
    },
  },
};
</script>

<style lang="scss">
.TermTreeItemLabel {
  display: flex;
  width: 100%;
  justify-content: space-between;
  align-items: center;

  &:hover > .TermTreeItemLabel-anchor,
  & > .TermTreeItemLabel-anchor:focus-visible {
    display: inline-flex;
  }

  &-anchor {
    display: none;
    margin-right: 0.5em;
    line-height: 1;
    padding: 1em 0.5em;
    color: $gray-600 !important;
    &:hover,
    &:focus {
      color: $gray-700 !important;
    }
  }
}
</style>
