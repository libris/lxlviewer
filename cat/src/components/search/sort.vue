<script>
import { mapGetters } from 'vuex';
import * as VocabUtil from 'lxljs/vocab';
import { translatePhrase } from '@/utils/filters';

export default {
  name: 'sort',
  props: {
    recordTypes: {
      type: [String, Array],
      default: () => [],
    },
    currentSort: { // sortparam-value to set initial select option
      type: String,
    },
    commonSortFallback: {
      type: Boolean,
      default: false,
    },
    styleVariant: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      boundVal: this.currentSort,
    };
  },
  emits: ['change'],
  computed: {
    ...mapGetters([
      'inspector',
      'resources',
      'user',
    ]),
    newSort() {
      if (this.boundVal) {
        return this.boundVal;
      } return '';
    },
    options() {
      let sortOptions = this.$store.getters.settings.sortOptions[this.commonBaseType];
      if (sortOptions) {
        return sortOptions;
      }
      if (this.commonSortFallback) {
        sortOptions = this.$store.getters.settings.sortOptions.Common;
      }
      if (sortOptions) {
        return sortOptions;
      }
      return false;
    },
    commonBaseType() {
      if (typeof this.recordTypes === 'string') {
        return VocabUtil.getRecordType(
          this.recordTypes,
          this.resources.vocab,
          this.resources.context,
        );
      }
      if (Array.isArray(this.recordTypes)) {
        const baseTypes = this.recordTypes.reduce((accumulator, currType) => {
          const baseType = VocabUtil.getRecordType(currType, this.resources.vocab, this.resources.context);
          const length = accumulator.length;
          if (length === 0 || accumulator[length - 1] !== baseType) {
            accumulator.push(baseType);
          }
          return accumulator;
        }, []);
        if (baseTypes.length === 1) { // same base class -> check sort options
          return baseTypes.join();
        }
        return false;
      }
      return false;
    },
  },
  methods: {
    translatePhrase,
    handleSortChange() {
      const user = this.user;
      user.settings.sort = this.newSort;
      this.$store.dispatch('setUser', user)
        .then(() => this.$emit('change', this.newSort));
    },
  },
  mounted() {
  },
};
</script>

<template>
  <div
    class="Sort"
    :class="{ variantMaterial: styleVariant === 'material' }"
    v-if="options">
    <label class="Sort-label" for="sort-select">{{ translatePhrase('Sorting') }}{{ styleVariant === 'material' ? '' : ':' }}</label>
    <select
      id="sort-select"
      class="Sort-select customSelect"
      v-model="boundVal"
      @change="handleSortChange">
      <option
        v-for="(option, index) in options"
        :value="option.query.endsWith('_sortKeyByLang') ? `${option.query}.${user.settings.language || 'sv'}` : option.query"
        :key="index">
        {{ translatePhrase(option.label) }}
      </option>
    </select>
  </div>
</template>

<style lang="less">
.Sort {
  display: flex;
  flex-wrap: nowrap;
  align-items: center;

  &.variantMaterial {
    flex-direction: column;
    align-items: start;
    position: relative;
  }

  &-label {
    margin: 0 10px 10px 0;
    font-weight: 600;

    .Sort.variantMaterial & {
      position: absolute;
      font-size: 1.2rem;
      left: 1rem;
      top: 0.4rem;
      color: @brand-primary;
    }
  }
  &-select {
    text-align: start;
    margin: 0 10px 10px 0;

    .Sort.variantMaterial & {
      margin: 0;
      padding: 1.8rem 3.5rem 0 1rem;
      background-color: @white;
      border: 1px solid @grey-lighter;
      line-height: 2.8rem;
      height: 4.8rem;
    }
  }
}
</style>
