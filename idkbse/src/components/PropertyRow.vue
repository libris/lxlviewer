<template>
  <div class="PropertyRow d-md-flex" :data-property="property">
    <div :data-property="property" class="PropertyRow-bodyKey d-block d-md-inline" :title="property">{{ translateKey(property) }}</div>
    <div :data-property="property" class="PropertyRow-bodyValue single" v-if="!Array.isArray(value)">
      <span class="" v-if="valueType == 'boolean'">{{ translateUi(value == true ? 'Yes' : 'No') }}</span>
      <EntityTable v-else-if="isIntegral && isInner == false" :entity="value" :is-main-entity="false" />
      <EntityNode :parent-key="property" :entity="value" v-else-if="containerType != '@language'" />
      <span v-else-if="valueType !== 'object'">{{ value }}</span>
      <div class="PropertyRow-grid" v-else>
        <template v-for="(v, lang) in value">
          <div class="PropertyRow-gridKey" :key="`${property}-${lang}-key`">
            {{ lang }}
          </div>
          <div class="PropertyRow-gridValue"  :key="`${property}-${lang}-value`">
            {{ v }}
          </div>
        </template>
      </div>
    </div>
    <div :data-property="property" class="PropertyRow-bodyValue multiple" v-else>
      <EntityNode :parent-key="property" :entity="node" v-for="(node, index) in finalizedValue" :key="index" />
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import LensMixin from '@/mixins/lens';
import EntityNode from '@/components/EntityNode';
import * as DisplayUtil from 'lxljs/display';
import * as VocabUtil from 'lxljs/vocab';
import * as StringUtil from 'lxljs/string';

export default {
  name: 'PropertyRow',
  mixins: [LensMixin],
  data() {
    return {
      show: false,
      filteredTypes: [
        'Restriction',
      ],
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
    isInner: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
  },
  computed: {
    ...mapGetters(['quoted', 'settings', 'resources', 'vocabContext', 'display', 'vocab']),
    valueType() {
      return typeof this.value;
    },
    isIntegral() {
      return VocabUtil.hasCategory(this.property, 'integral', this.resources);
    },
    containerType() {
      return VocabUtil.getContextValue(this.property, '@container', this.vocabContext);
    },
    finalizedValue() {
      if (Array.isArray(this.withoutFilteredTypes)) {
        return [...this.withoutFilteredTypes].sort((a, b) => {
          const labelA = StringUtil.getLabelByLang(a['@id'], this.settings.language, this.resources)
          const labelB = StringUtil.getLabelByLang(b['@id'], this.settings.language, this.resources)
          return labelA ? labelA.localeCompare(labelB) : 1
        })
      }
      return this.withoutFilteredTypes;
    },
    withoutFilteredTypes() {
      const original = this.valueSorted;
      return original.filter((item) => {
        if (item.hasOwnProperty('@type') == false) {
          return true;
        } else {
          return this.filteredTypes.includes(item['@type']) == false;
        }
      });
    },
    objectLabelReference() {
      // Returns a map with objects as keys and labels as values
      const refMap = new Map();
      this.value.forEach((item) => {
        const sortValue = typeof item === 'object' ? DisplayUtil.getItemLabel(
            item,
            this.resources,
            this.quoted,
            this.settings,
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
    EntityTable: () => import('@/components/EntityTable.vue'),
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

  &-grid {
    display: grid;
    grid-template-columns: 2em 1fr;
  }
  &-gridKey {
    font-family: monospace;
  }
  &-gridValue {

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
