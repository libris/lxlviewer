<script>
import FacetGroup from './facet-group.vue';

export default {
  name: 'facet-controls',
  props: {
    result: {},
  },
  data() {
    return {
      numOfExpanded: 4,
    };
  },
  methods: {
  },
  computed: {
    facetSettings() {
      return this.$store.getters.settings.propertyChains;
    },
    sortedFacets() {
      const unordered = this.result.stats.sliceByDimension;
      const ordered = Object
        .keys(unordered)
        .sort((a, b) => this.facetSettings[unordered[a].dimension].facet.order 
            - this.facetSettings[unordered[b].dimension].facet.order)
        .reduce((_sortedObj, key) => ({
          ..._sortedObj, 
          [key]: unordered[key],
        }), {});
      return ordered;
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
