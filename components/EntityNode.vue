<template>
  <div class="EntityNode" v-if="entityData != null">
    <span class="" v-if="typeof entityData == 'string'">{{ entityData }}</span>
    <span class="" v-else-if="entityData && !entityData.hasOwnProperty('@id')">
      {{ getItemLabel }}
    </span>
    <a v-else-if="entityData && entityData.hasOwnProperty('@id')" :href="entityData['@id'] | removeBaseUri">
      <template v-if="Object.keys(entityData).length > 1">{{ getItemLabel }}</template>
      <template v-else>{{ entityData['@id'] }}</template>
    </a>
    <span v-else>
      <template>{{ entity }}</template>
    </span>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import LensMixin from '@/mixins/lens';

export default {
  mixins: [LensMixin],
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
    ...mapGetters(['entityReferences']),
    entityData() {
      if (this.entity.hasOwnProperty('@id') && this.entityReferences.hasOwnProperty(this.entity['@id'])) {
        return this.entityReferences[this.entity['@id']];
      }
      return this.entity;
    }
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
