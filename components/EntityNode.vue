<template>
  <div class="EntityNode">
    <span class="" v-if="typeof entity == 'string'">{{ entity }}</span>
    <span class="" v-else-if="!entity.hasOwnProperty('@id')">
      <template v-if="entity.hasOwnProperty('prefLabel')">{{ entity.prefLabel }}</template>
      <template v-else-if="entity.hasOwnProperty('titleByLang')">{{ entity.titleByLang['sv'] }}</template>
      <template v-else>{{ entity }}</template>
    </span>
    <a v-else-if="entity.hasOwnProperty('@id')" :href="entity['@id'] | filterBaseUri">
      <template v-if="entity.hasOwnProperty('prefLabel')">{{ entity.prefLabel }}</template>
      <template v-else-if="entity.hasOwnProperty('titleByLang')">{{ entity.titleByLang['sv'] }}</template>
      <template v-else>{{ entity['@id'] }}</template>
    </a>
    <span v-else>
      <template>{{ entity }}</template>
    </span>
  </div>
</template>

<script>
export default {
  data() {
    return {
      show: false
    }
  },
  props: {
    entity: {
      type: [Object, String, Number],
    },
  },
  methods: {
  },
  computed: {
  }
}
</script>

<style lang="scss">
.EntityNode {
  display: inline-block;
  &:not(:first-child) {
    &::before {
      content: ' • ';
    }
    margin-left: 0.4em;
  }
}
</style>
