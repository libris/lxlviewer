<template>
  <div class="Property">
    <div class="Property-key" v-if="itemKey">
      {{ itemKey }}
    </div>
    <div class="Property-value">
      <div class="Property-textValue" v-if="isString">
        {{ itemValue }}
      </div>
      <div class="Property-valueList" v-if="!isString && isArray">
        <ItemLocal :value="node" :key="node" v-for="node in itemValue" />
      </div>
      <span v-if="!isArray && !isString">
        <ItemLocal :value="itemValue" />
      </span>
    </div>
  </div>
</template>

<script>
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
    width: 10em;
    font-weight: 600;
    text-transform: uppercase;
    font-size: 85%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    padding: 0.5em;
    color: $gray-800;
  }
  &-value {
    padding: 0.5em;
  }
}
</style>
