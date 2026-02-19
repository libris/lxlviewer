<template>
  <div class="TermTree">
    <hgroup class="TermTree-header">
      <h4>Termer i {{ termTitle }}</h4>
      <p class="total-term-items">{{ totalTermItems }} termer</p>
    </hgroup>
    <ul class="TermTree-list">
      <TermTreeItem
        v-for="treeItem in tree"
        :key="treeItem['@id']"
        :@id="treeItem['@id']"
        :code="treeItem.code"
        :label="treeItem.label"
        :narrower="treeItem.narrower"
      />
    </ul>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import * as DisplayUtil from "lxljs/display";
import TermTreeItem from "@/components/TermTreeItem";

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
    tree() {
      const getNarrower = (parent) => {
        return parent?.["@reverse"]?.broader
          ?.map((child) => ({
            "@id": child["@id"],
            code: this.entity.code,
            label: DisplayUtil.getItemLabel(
              child,
              this.resources,
              this.quoted,
              this.settings
            ),
            narrower: getNarrower(
              this.terms.items.find((t) => t["@id"] === child["@id"])
            ),
          }))
          ?.sort((a, b) => a.label.localeCompare(b.label, "sv"));
      };

      const schemeIri = this.entity["@id"];

      const asArray = (o) => {
        if (Array.isArray(o)) return o;
        return o != null && o != undefined ? [o] : [];
      };

      return this.terms.items
        .filter(
          (term) =>
            !asArray(term.broader).find(
              (t) =>
                typeof t === "object" && t?.["inScheme"]?.["@id"] === schemeIri
            )
        ) // get root terms
        .map((term) => ({
          "@id": term["@id"],
          code: this.entity.code,
          label: DisplayUtil.getItemLabel(
            term,
            this.resources,
            this.quoted,
            this.settings
          ),
          narrower: getNarrower(term),
        }));
    },
    totalTermItems() {
      return this.terms.totalItems;
    },
  },
  methods: {},
  components: {
    TermTreeItem,
  },
  async fetch() {
    this.terms = await this.$http.$get(
      `${this.activeHost()}/find.json?inScheme.@id=https://id.kb.se/${
        this.$route.params.pathMatch
      }&_limit=2000&_stats=false&_sort=_sortKeyByLang.sv`
    );
  },
};
</script>

<style lang="scss">
.total-term-items {
  color: $gray-700;
}
.TermTree {
  &-header {
    padding: 0.5em 0;

    & h4 {
      margin: 0 0 0.25em 0;
    }

    & p {
      margin: 0 0 0.25em 0;
    }
  }
  &-list {
    list-style-type: none;
    padding: 0;
  }
}
</style>
