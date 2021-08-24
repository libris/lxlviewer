<template>
  <div class="ResultItem" :class="{ 'hovered': hovered }" @mouseover="hovered = true" @mouseout="hovered = false">
    <div class="ResultItem-header" @click="toggle" @keyup.enter="toggle(true)" tabindex="0">
      <span class="ResultItem-title"><a ref="titleLink" :href="itemData['@id'] | removeBaseUri" :tabindex="expanded ? 0 : -1">{{ itemData.prefLabel }}</a></span>
      <span class="ResultItem-scheme chip">{{ itemData['inScheme'].titleByLang['sv'] }}</span>
      <span class="ResultItem-type chip">{{ translateKey(itemData['@type']) }}</span>
    </div>
    <EntityTable v-if="expanded" :item-data="filteredItem" :show-download="true" />
  </div>
</template>

<script>
export default {
  data() {
    return {
      hovered: false,
      expanded: false,
    }
  },
  methods: {
    toggle(withEnter = false) {
      if (this.expanded) {
        this.collapse(withEnter);
      } else {
        this.expand(withEnter);
      }
    },
    expand(withEnter) {
      this.expanded = true;
      if (withEnter) {
        this.$refs.titleLink.focus();
      }
    },
    collapse(withEnter) {
      this.expanded = false;
    },
  },
  computed: {
    filteredItem() {
      const filtered = Object.assign({}, this.itemData);
      delete filtered['@id'];
      delete filtered['@type'];
      delete filtered['@reverse'];
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
  },
}
</script>

<style lang="scss">
.ResultItem {
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
    padding: 0.5em 1em 0.5em 1.5em;
  }
  &-bodyRow {
    border: solid $gray-200;
    border-width: 0px 0px 1px 0px;
    display: flex;
    padding: 0.5em 0;
    &:last-child {
      border-width: 0px;
    }
  }
  &-bodyKey {
    color: $gray-700;
    flex-basis: 15em;
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
