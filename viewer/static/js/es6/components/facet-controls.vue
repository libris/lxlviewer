<script>
import * as StringUtil from '../utils/string';
import { getSettings, getVocabulary } from '../vuex/getters';
import RangeInput from './range-input.vue';
import Facet from './facet.vue';
export default {
  name: 'facet-controls',
  props: {
    result: {},
  },
  vuex: {
    getters: {
      settings: getSettings,
      vocab: getVocabulary,
    },
  },
  data() {
    return {
    }
  },
  methods: {
    isRangeFacet(dimensionKey) {
      return dimensionKey === 'publication.date';
    },
    facetLabelByLang(facetType) {
      const typeByLang = StringUtil.labelByLang(facetType, this.settings.language, this.vocab, this.settings.vocabPfx);
      if (typeByLang.indexOf('unhandled term') < 0) {
        return typeByLang;
      }
      return this.settings.propertyChains[facetType][this.settings.language];
    }
  },
  computed: {
  },
  events: {
  },
  components: {
    'range-input': RangeInput,
    'facet': Facet,
  },
  watch: {
  },
  ready() { // Ready method is deprecated in 2.0, switch to "mounted"
    this.$nextTick(() => {
      // Do stuff
    });
  },
};
</script>

<template>
  <div v-if="result.totalItems > 0" class="panel panel-default">
    <div class="panel-body facet-controls">
      <label>Filtrera</label>
      <div>
        <div v-for="(dimensionKey, dimensionValue) in result.stats.sliceByDimension">
          <div class="dimension-header">{{facetLabelByLang(dimensionValue.dimension)}}</div>
          <!--<range-input v-if="isRangeFacet(dimensionKey)"></range-input>-->
          <ul>
            <facet v-for="observation in dimensionValue.observation" :observation="observation"></facet>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="less">
@import './_variables.less';

</style>
