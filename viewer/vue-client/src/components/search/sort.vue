<script>
import { mapGetters } from 'vuex';
import * as VocabUtil from '@/utils/vocab';

export default {
  name: 'sort',
  props: {
    recordTypes: {
      type: [String, Array],
      required: true,
    },
    currentSort: { // sortparam-value to set initial select option
      type: String,
    },
  },
  data() {
    return {
      boundVal: this.currentSort,
    };
  },
  computed: {
    ...mapGetters([
      'inspector',
      'resources',
    ]),
    newSort() {
      if (this.boundVal) {
        return this.boundVal;
      } return '';
    },
    options() {
      const sortOptions = this.$store.getters.settings.sortOptions[this.commonBaseType];
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
        } return false; // different base classes -> disallow sort
      }
      return false;
    },
  },
  methods: {
  },
  mounted() {
  },
};
</script>

<template>
  <div class="Sort" v-if="options">
    <label class="Sort-label" for="sort-select">{{ 'Sorting' | translatePhrase }}:</label>
    <select id="sort-select"
      class="Sort-select customSelect" 
      v-model="boundVal" 
      @change="$emit('change', newSort)">
      <option 
        v-for="(option, index) in options" 
        :value="option.query"
        :key="index">
        {{ option.label | translatePhrase }}
      </option>
    </select>
  </div>
</template>

<style lang="less">
.Sort {
  display: flex;
  flex-wrap: nowrap;

  &-label {
    margin: 0 10px 10px 0;
    font-weight: 600;
  }
  &-select {
    text-align-last: start;
    margin: 0 10px 10px 0;
  }
}
</style>
