<template>
  <div class="PropertyRow d-md-flex">
    <span class="PropertyRow-bodyKey d-block d-md-inline" :title="translateKey(property)">{{ translateKey(property) }}</span>
    <span class="PropertyRow-bodyValue single" v-if="!Array.isArray(value)">
      <EntityNode :parent-key="property" :entity="value" v-if="!isByLangProperty" />
      <span v-else>{{ value[settings.language] }}</span>
    </span>
    <span class="PropertyRow-bodyValue multiple" v-if="Array.isArray(value)">
      <EntityNode :parent-key="property" :entity="node" v-for="(node, index) in value" :key="index" />
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
    property: {
      type: String,
      default: '',
    },
    value: {
      type: [Object, String, Number, Array],
    },
  },
  methods: {
  },
  computed: {
    ...mapGetters(['entityReferences', 'settings']),
    isByLangProperty() {
      return this.property.includes('ByLang');
    },
  }
}
</script>

<style lang="scss">
.PropertyRow {
  border: solid $gray-200;
  border-width: 0px 0px 1px 0px;
  padding: 0.5rem 0;
  &:last-child {
    border-width: 0px;
  }

  &-bodyKey {
    color: $gray-700;
    flex-basis: 15em;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
    font-size: 0.85rem;
    font-weight: 500;
    @media (min-width: 768px) {
      font-size: 1rem;
      font-weight: 400;
    }
    &:first-letter {
      text-transform: uppercase;
    }
  }
  &-bodyValue {
    flex-grow: 0;
    flex-basis: 100%;
    @media (min-width: 768px) {
      padding-left: 1rem;
    }
    a {
      color: $kb-secondary-turquoise;
      text-decoration: none;
      &:hover {
        text-decoration: underline;
      }
    }
  }
}
</style>
