<template>
  <div class="EntityNode" :class="{ 'chip': isChip }" v-if="entityData != null">
    <span class="" v-if="typeof entityData == 'string'">{{ entityData }}</span>
    <span class="" v-else-if="entityData && !entityData['@id']">
      {{ getItemLabel }}
    </span>
    <template v-else-if="entityData && entityData['@id']">
      <NuxtLink v-if="entityData['@id'].startsWith('https://id.kb.se')" :to="entityData['@id'] | removeBaseUri">
        <template v-if="Object.keys(entityData).length > 1">{{ getItemLabel }}</template>
        <template v-else>{{ decodeURI(entityData['@id']) | translateUriEnv }}</template>
      </NuxtLink>
      <a v-else :href="entityData['@id']">{{ decodeURI(entityData['@id']) }}</a>
    </template>
    <span v-else>
      <template>{{ entity }}</template>
    </span>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import * as VocabUtil from '@/utils/vocab';
import LensMixin from '@/mixins/lens';

export default {
  mixins: [LensMixin],
  data() {
    return {
      show: false
    }
  },
  props: {
    parentKey: {
      type: String,
      default: '',
    },
    entity: {
      type: [Object, String, Number, Boolean],
    },
    isChip: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
  },
  computed: {
    ...mapGetters(['entityReferences', 'settings', 'vocab', 'vocabContext']),
    isByLangValue() {
      return this.parentKey.includes('ByLang');
    },
    entityData() {
      if (!this.entity) {
        return {};
      }
      if (this.entity.hasOwnProperty('@id') && this.entityReferences.hasOwnProperty(this.entity['@id'])) {
        return this.entityReferences[this.entity['@id']];
      }
      if (this.parentKey == '@type') {
        return VocabUtil.getTermObject(this.entity, this.vocab, this.vocabContext);
      }
      return this.entity;
    }
  }
}
</script>

<style lang="scss">
.EntityNode {
  display: block;
  min-width: 0;
  overflow: hidden;
  &.chip {
    transition: 0.25s ease all;
    border: 1px solid $gray-100;
    background-color: $gray-100;
    border-radius: 2em;
    color: $gray-600;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0.25rem 0.4rem;
    white-space: nowrap;
    a {
      text-decoration: none;
    }
    @media (min-width: 768px) {
      padding: 0.5em 0.75em;
    }
    font-size: 1rem;
  }
}
</style>
