<template>
  <li class="SuggestItem" @mouseenter="onHover" :class="{ 'is-selected': selected }" @click="suggest">
    <i class="bi-search"></i>
    <span>{{ getItemLabel }}</span>
  </li>
</template>

<script>
import LensMixin from '@/mixins/lens';

export default {
  mixins: [LensMixin],
  data() {
    return {
      show: false
    }
  },
  computed: {
    entityData() {
      return this.item;
    },
  },
  methods: {
    onHover() {
      this.$emit('hovered');
    },
    suggest() {
      this.$emit('suggest', this.item['@id'].replace('https://id.kb.se/', '/'));
    },
  },
  props: {
    item: {
      type: Object,
      default: null,
    },
    selected: {
      type: Boolean,
      default: false,
    },
  },
}
</script>

<style lang="scss">
.SuggestItem {
  padding: 0.5em 0.5em 0.5em 0;
  list-style: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  overflow: hidden;
  span {
    white-space: nowrap;
  }
  i {
    margin-left: 1rem;
    margin-right: 0.4em;
    font-size: 125%;
  }
  &:hover, &.is-selected {
    background-color: $gray-200;
  }
  &-divider {
    color: $gray-600;
    display: flex;
    font-weight: 400;
    padding: 0.25em 0.5em 0em 0.85em;
    align-items: center;
    gap: 0.25em;
    hr {
      margin: 0;
      color: $gray-600;
      border: solid $gray-600;
      border-width: 1px;
      flex-grow: 1;
    }
  }
}
</style>
