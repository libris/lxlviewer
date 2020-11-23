<script>
import { mapGetters } from 'vuex';
import * as LayoutUtil from '@/utils/layout';
import * as VocabUtil from '@/utils/vocab';
import PropertyMappings from '@/resources/json/propertymappings.json';

export default {
  name: 'param-select',
  props: {
    types: {
      type: Array,
    },
    reset: {
      type: Number,
    },
  },
  data() {
    return {
      selectedParam: '',
      baseClasses: [],
    };
  },
  methods: {
    handleChange() {
      this.$emit('param-selected', this.selectedParam);
    },
    resetSelectValue() {
      if (!this.availableSearchParams.includes(this.selectedParam)) {
        this.selectedParam = this.availableSearchParams[0];
      }
    },
  },
  computed: {
    ...mapGetters([
      'resources',
    ]),
    availableSearchParams() {
      const intersects = ((a1, a2) => a1.find(value => a2.includes(value)) !== undefined);

      if (this.types === [] || this.types === undefined) {
        return PropertyMappings;
      }

      const types = this.types.concat(this.baseClasses);
      return PropertyMappings.filter(m => intersects(m.types, types));
    },
  },
  components: {
  },
  watch: {
    types(newVal) {
      if (newVal !== undefined && !newVal.includes(undefined)) {
        this.baseClasses = VocabUtil.getBaseClassesFromArray(
          newVal,
          this.resources.vocab,
          this.resources.context,
        );
      } else {
        this.baseClasses = [];
      }

      this.resetSelectValue();
    },
    reset() {
      this.resetSelectValue();
    },
  },
  mounted() {
    this.$nextTick(() => {
      LayoutUtil.enableTabbing();
    });
  },
};
</script>

<template>
  <div class="ParamSelect">
    <select
      class="SearchForm-paramSelect SearchForm-select customSelect"
      v-model="selectedParam"
      @change="handleChange()"
      :aria-label="'Choose type' | translatePhrase">
      <option
        v-for="prop in availableSearchParams"
        :key="prop.key"
        :value="prop">
        {{prop.key | translatePhrase}}
      </option>
    </select>
  </div>
</template>

<style lang="less">
.ParamSelect {
  display: flex;
}
</style>
