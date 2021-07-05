<template>
  <div class="ItemLocal">
    <div class="ItemLocal-header" v-if="value['@id']">
      {{ value['@id'] }}
    </div>
    <div class="ItemLocal-body">
      <div v-if="!isString && !isArray">
        <Property v-for="(value, key) in value" :key="key" :item-key="key" :item-value="value" />
      </div>
      <div v-if="!isString && isArray">
        <Property v-for="(value, key) in value" :key="key" :item-value="value" />
      </div>
      <span v-if="isString">{{ value }}</span>
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
    isString() {
      if (typeof this.value === 'string') {
        return true;
      }
      return false;
    },
    isArray() {
      return Array.isArray(this.value);
    },
  },
  props: {
    value: {
      type: [Object, String, Array],
      default: null,
    },
  },
}
</script>

<style lang="scss">
.ItemLocal {
  // border: 1px solid black;
  display: inline-block;
  box-shadow: 0px 0px 1em 0px #00000038;
  &-header {
    padding: 0.5em;
  }
  &-body {
  }
}
</style>
