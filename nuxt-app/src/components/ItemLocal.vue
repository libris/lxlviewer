<template>
  <div class="ItemLocal">
    <div class="ItemLocal-header" v-if="label">
      {{ label }}
    </div>
    <div class="ItemLocal-body">
      <template v-if="!isString && !isArray">
        <Property v-for="(value, key) in value" :key="key" :item-key="key" :item-value="value" />
      </template>
      <template v-if="!isString && isArray">
        <Property v-for="(value, key) in value" :key="key" :item-value="value" />
      </template>
      <template v-if="isString">{{ value }}</template>
    </div>
  </div>
</template>

<script>
import Property from '@/components/Property';

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
    label() {
      if (this.value.hasOwnProperty('labelByLang')) {
        return this.value.labelByLang['sv'];
      } else if (this.value.hasOwnProperty('titleByLang')) {
        return this.value.titleByLang['sv'];
      } else if (this.value.prefLabel) {
        return this.value.prefLabel;
      } else if (this.value.hasOwnProperty('@id')) {
        return this.value['@id'];
      }
      return this.value['@type'];
    },
  },
  props: {
    value: {
      type: [Object, String, Array],
      default: null,
    },
  },
  components: {
    Property,
  },
}
</script>

<style lang="scss">
.ItemLocal {
  // border: 1px solid black;
  width: 100%;
  display: inline-block;
  box-shadow: 0px 0px 1em 0px #00000038;
  &-header {
    padding: 0.5em;
    font-weight: 500;
  }
  &-body {
  }
}
</style>
