<template>
  <div class="Property">
    <div class="Property-key" v-if="itemKey">
      {{ itemKey }}
    </div>
    <div class="Property-value">
      <template v-if="isString">
        {{ itemValue }}
      </template>
      <template v-if="!isString && isArray">
        <ItemLocal :value="node" :key="node" v-for="node in itemValue" />
      </template>
      <template v-if="!isArray && !isString">
        <ItemLocal :value="itemValue" />
      </template>
    </div>
  </div>
</template>

<script>
import ItemLocal from '@/components/ItemLocal';

export default {
  data() {
    return {
      show: false
    }
  },
  computed: {
    isArray() {
      return Array.isArray(this.itemvalue);
    },
    isString() {
      return typeof this.itemValue === 'string';
    },
  },
  props: {
    itemValue: {
      type: [Object, String, Array],
      default: null,
    },
    itemKey: {
      type: [Object, String, Number],
      default: null,
    },
  },
  components: {
    ItemLocal,
  },
}
</script>

<style lang="scss">
.Property {
  &:nth-child(odd) {
    background-color: $gray-100;
  }
  &:nth-child(even) {
    background-color: $gray-200;
  }
  display: flex;
  flex-direction: row;
  &-key {
    flex-basis: 15em;
    font-weight: 600;
    font-size: 85%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    padding: 0.5em;
    color: $gray-800;
  }
  &-value {
    flex-basis: 100%;
    padding: 0.5em;
  }
}
</style>
