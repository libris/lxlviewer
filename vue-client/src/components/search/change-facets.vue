<script>
import FacetGroup from './facet-group.vue';

export default {
  name: 'change-facets',
  props: {
    result: {},
  },
  data() {
    return {
      numOfExpanded: 6,
    };
  },
  methods: {
  },
  computed: {
    facetSettings() {
      console.log('WE ARE IN THE COMPONENT');
      return this.$store.getters.settings.propertyChains;
    },
    sortedFacets() {
      console.log('results!!', JSON.stringify(this.result));
      console.log('this.result.stats.sliceByDimension', JSON.stringify(this.result.stats.sliceByDimension));
      return [];
    },
  },
  events: {
  },
  components: {
    'facet-group': FacetGroup,
  },
  watch: {
  },
  mounted() {
    this.$nextTick(() => {
      console.log('THE COMPONENT IS MOUNTED');
      console.log('results 3333', JSON.stringify(this.result));
    });
  },
};
</script>

<template>
  <div class="FacetControls">
    <facet-group
      v-for="(dimensionValue, dimensionKey, index) in sortedFacets"
      :key="dimensionKey"
      :group="dimensionValue"
      :expanded="index < numOfExpanded"/>
  </div>
</template>

<style lang="less">
.FacetControls {
  padding: 0 10px;

  @media (min-width: @screen-md) {
    padding: 0;
  }
}
</style>
