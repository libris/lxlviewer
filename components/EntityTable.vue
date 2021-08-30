<template>
  <div class="EntityTable-body">
    <div class="EntityTable-bodyRow d-md-flex" v-for="(value, key) in filteredItem" :key="key">
      <span class="EntityTable-bodyKey d-block d-md-inline" :title="translateKey(key)">{{ translateKey(key) }}</span>
      <span class="EntityTable-bodyValue single" v-if="!Array.isArray(value)">
        <EntityNode :entity="value" />
      </span>
      <span class="EntityTable-bodyValue multiple" v-if="Array.isArray(value)">
        <EntityNode :entity="node" v-for="(node, index) in value" :key="index" />
      </span>
    </div>
    <div class="EntityTable-bodyRow d-md-flex" v-if="showDownload">
      <span class="EntityTable-bodyKey d-block d-md-inline">Ladda ner</span>
      <span class="EntityTable-bodyValue"><a :href="`${itemData['@id']}/data.jsonld` | replaceBaseWithApi">JSON-LD</a> • <a :href="`${itemData['@id']}/data.ttl` | replaceBaseWithApi">Turtle</a> • <a :href="`${itemData['@id']}/data.rdf` | replaceBaseWithApi">RDF/XML</a></span>
    </div>
  </div>
</template>

<script>

export default {
  data() {
    return {
    }
  },
  methods: {
  },
  computed: {
    filteredItem() {
      const filtered = Object.assign({}, this.itemData);
      delete filtered['@id'];
      delete filtered['@type'];
      delete filtered.reverseLinks;
      delete filtered.meta;
      return filtered;
    },
  },
  props: {
    itemData: {
      type: Object,
      default: null,
    },
    showDownload: {
      type: Boolean,
      default: false,
    },
  },
}
</script>

<style lang="scss">
.EntityTable {
  border: solid $gray-200;
  border-width: 0px 1px 1px 1px;
  &:first-child {
    border-width: 1px 1px 1px 1px;
  }
  &-header {
    width: 100%;
    display: flex;
    flex-direction: row;
    padding: 0.5em 1em;
    gap: 1em;
    > span {
      padding: 0.5em;
      &:first-child {
        flex-grow: 1;
      }
    }
  }
  &-title {
    a {
      color: $kb-secondary-turquoise;
      font-weight: 500;
      text-decoration: none;
      &:hover {
        text-decoration: underline;
      }
    }
  }
  &-body {
    padding: 0.5rem 1rem 0.5rem 1.5rem;
  }
  &-bodyRow {
    border: solid $gray-200;
    border-width: 0px 0px 1px 0px;
    padding: 0.5rem 0;
    &:last-child {
      border-width: 0px;
    }
  }
  &-bodyKey {
    color: $gray-700;
    flex-basis: 15em;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
    &:first-letter {
      text-transform: uppercase;
    }
  }
  &-bodyValue {
    flex-grow: 0;
    flex-basis: 100%;
    a {
      color: $kb-secondary-turquoise;
      text-decoration: none;
      &:hover {
        text-decoration: underline;
      }
    }
  }
  &.hovered {
    box-shadow: 0 0.25em 0.5em 0 rgba(0, 0, 0, 0.25);
    .chip {
      border-color: $gray-500;
      color: $black;
    }
  }
  .chip {
    transition: 0.25s ease all;
    border: 1px solid $gray-100;
    background-color: $gray-100;
    border-radius: 2em;
    color: $gray-600;
    padding: 0.5em 0.75em;
  }

}

</style>
