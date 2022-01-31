<template>
  <li class="VocabMenuItem">
    <NuxtLink :to="removeBaseUri(item['@id'])">{{ shortId }} <span v-if="item.labelByLang && getItemLabel.length > 0" class="VocabMenuItem-termId text-muted text-small"> - {{ getItemLabel }}</span></NuxtLink>
  </li>
</template>

<script>
import * as VocabUtil from 'lxljs/vocab';
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
    contextBaseUri() {
      return VocabUtil.getContainedBaseUri(this.item['@id'], this.vocabContext);
    },
    contextPrefix() {
      return VocabUtil.getContainedPrefix(this.item['@id'], this.vocabContext);
    },
    shortId() {
      const shortId = this.item['@id'].split('/').pop();
      if (this.contextPrefix.length > 0) {
        const idWithoutBase = this.item['@id'].replace(this.contextBaseUri, '');
        return `${this.contextPrefix}:${idWithoutBase}`;
      }
      return shortId;
    },
    labelSameAsId() {
      return this.getItemLabel === this.shortId;
    }
  },
  props: {
    item: {
      type: Object,
      default: null,
    },
  },
  components: {

  },
}
</script>

<style lang="scss">
.VocabMenuItem {
  white-space: nowrap;
  &-termId {
    font-size: 0.8em;
  }
}
</style>
