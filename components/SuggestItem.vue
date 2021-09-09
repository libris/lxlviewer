<template>
  <li class="SuggestItem" @click="suggest" @keyup.enter="suggest">
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
    suggest() {
      this.$emit('suggest', this.item['@id']);
    },
  },
  props: {
    item: {
      type: Object,
      default: null,
    },
  },
}
</script>

<style lang="scss">
.SuggestItem {
  padding: 0.5em 0.5em 0.5em 0;
  list-style: none;
  cursor: pointer;
  i {
    margin-top: 0.6rem;
    margin-left: 1rem;
    margin-right: 0.4em;
    font-size: 125%;
  }
  &:hover {
    background-color: $gray-200;
  }
}
</style>
