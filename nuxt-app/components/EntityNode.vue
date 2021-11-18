<template>
  <div class="EntityNode" :class="{ 'chip': isChip }">
    <template v-if="typeof entityData == 'string'">
      <span class="">{{ entityData }}</span>
    </template>
    <template v-else-if="entityData">
      <span class="" v-if="!entityData['@id']">
        {{ getItemLabel }}
      </span>
      <template v-else-if="entityData['@id']">
        <NuxtLink v-if="entityData['@id'].startsWith('https://id.kb.se')" :to="entityData['@id'] | removeBaseUri">
          <template v-if="entityData['@id'] === 'https://id.kb.se/vocab/'">https://id.kb.se/vocab/</template>
          <template v-else-if="Object.keys(entityData).length > 1">{{ getItemLabel }}</template>
          <template v-else>{{ decodeURI(entityData['@id']) | translateUriEnv }}</template>
        </NuxtLink>
        <NuxtLink v-else-if="entityData['@id'].startsWith('https://libris.kb.se')" :to="entityData['@id'] | removeBaseUri">
          <template v-if="Object.keys(entityData).length > 1">{{ getItemLabel }}</template>
          <template v-else>{{ decodeURI(entityData['@id']) | translateUriEnv }}</template>
        </NuxtLink>
        <a v-else :href="entityData['@id']">{{ decodeURI(entityData['@id']) }}</a>
      </template>
    </template>
    <template v-else>
      <span>{{ entity }}</span>
    </template>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import * as VocabUtil from 'lxljs/vocab';
import LensMixin from '@/mixins/lens';

export default {
  mixins: [LensMixin],
  data() {
    return {
      show: false,
      vocabLinkProperties: [
        '@type',
        'baseClassOf',
        'baseClassChain',
      ],
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
    ...mapGetters(['entityReferences', 'settings', 'resources']),
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
      if (this.entity.hasOwnProperty('@id') && this.entity['@id'].startsWith('https://id.kb.se/vocab/')) {
        if (this.entity['@id'].includes('marc:')) {
          return VocabUtil.getTermObject(this.entity['@id'].split('/').pop(), this.vocab, this.vocabContext);
        } else {
          return VocabUtil.getTermObject(this.entity['@id'], this.vocab, this.vocabContext);
        }
      }
      if (this.vocabLinkProperties.includes(this.parentKey)) {
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
