<script>
import * as StringUtil from '@/utils/string';
import RangeInput from './range-input.vue';
import Facet from './facet.vue';

export default {
  name: 'facet-controls',
  props: {
    result: {},
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
      return this.settings.propertyChains[facetType][this.user.settings.language];
    }
  },
  computed: {
    user() {
      return this.$store.getters.user;
    },
    settings() {
      return this.$store.getters.settings;
    },
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
  <div class="FacetControls panel panel-default">
    <div class="panel-body">
      <h3 class="FacetControls-title">Filtrera</h3>
      <div v-if="result.totalItems > 0 && result.stats">
        <nav class="FacetControls-listNav" aria-labelledby=""
        v-for="(dimensionValue, dimensionKey) in result.stats.sliceByDimension" 
        :key="dimensionKey">
          <h4 class="FacetControls-listTitle" id="">{{facetLabelByLang(dimensionValue.dimension) | capitalize}}</h4>
          <!--<range-input v-if="isRangeFacet(dimensionKey)"></range-input>-->
          <ul class="FacetControls-list">
            <facet class="FacetControls-listItem"
            v-for="observation in dimensionValue.observation" 
            :observation="observation" 
            :key="observation.label"></facet>
          </ul>
        </nav>
      </div>
    </div>
  </div>
</template>

<style lang="less">
.FacetControls {
  padding: 15px 5px 15px 15px;

  &-title {
    text-transform: uppercase;
    font-size: 16px;
    font-size: 1.6rem;
  }

  &-listTitle {
    margin: 10px 0 2px 0;
    padding: 0px;
    font-size: 16px;
    font-size: 1.6rem;
    font-weight: 700;
  }

  &-listNav {
    margin: 20px 0 0;
  }

  &-list {
    list-style: none;
    padding: 0px 0 0 15px;
  }
}
</style>
