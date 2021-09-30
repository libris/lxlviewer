<template>
  <div class="PropertyRow d-md-flex" :data-property="property">
    <span class="PropertyRow-bodyKey d-block d-md-inline" :title="translateKey(property)">{{ translateKey(property) }}</span>
    <span class="PropertyRow-bodyValue single" v-if="!Array.isArray(value)">
      <span class="" v-if="typeof value == 'boolean'">{{ value == true ? 'Ja' : 'Nej' }}</span>
      <span v-else-if="typeof value !== 'object'">{{ value }}</span>
      <EntityNode :parent-key="property" :entity="value" v-else-if="!isByLangProperty" />
      <span v-else>{{ value[settings.language] ? value[settings.language] : value[Object.keys(value)[0]] }}</span>
    </span>
    <span class="PropertyRow-bodyValue multiple" v-if="Array.isArray(value)">
      <EntityNode :parent-key="property" :entity="node" v-for="(node, index) in valueSorted" :key="index" />
    </span>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import LensMixin from '@/mixins/lens';
import EntityNode from '@/components/EntityNode';
import * as DisplayUtil from '@/utils/display';

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
      type: [Object, String, Number, Array, Boolean],
    },
  },
  methods: {
  },
  computed: {
    ...mapGetters(['entityReferences', 'settings', 'vocabContext', 'display', 'vocab']),
    isByLangProperty() {
      return this.property.includes('ByLang');
    },
    containerType() {
      if (this.vocabContext[1].hasOwnProperty(this.property) && this.vocabContext[1][this.property].hasOwnProperty('@container')) {
        return this.vocabContext[1][this.property]['@container'];
      }
      return null;
    },
    objectLabelReference() {
      // Returns a map with objects as keys and labels as values
      const refMap = new Map();
      this.value.forEach((item) => {
        const sortValue = typeof item === 'object' ? DisplayUtil.getItemLabel(
            item,
            this.display,
            this.entityReferences,
            this.vocab,
            this.settings,
            this.vocabContext,
          ) : item;
        refMap.set(item, sortValue);
      });
      return refMap;
    },
    valueSorted() {
      if (this.containerType == '@set') {
        const ref = this.objectLabelReference;
        const value = this.value.slice(0);
        if (this.containerType == '@set') {
          return value.sort((a, b) => {
              if(ref.get(a) < ref.get(b)) { return -1; }
              if(ref.get(a) > ref.get(b)) { return 1; }
              return 0;
          });
        }
        return value;
      } else {
        return this.value;
      }
    },
  },
  components: {
    EntityNode,
  },
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
    min-width: 0;
    @media (min-width: 768px) {
      padding-left: 1rem;
    }
    a {
      color: $kb-secondary-turquoise;
      text-decoration: none;
      word-break: break-all;
      &:hover {
        text-decoration: underline;
      }
    }
  }
}
</style>
