<script>
import FacetGroup from './facet-group.vue';

export default {
  name: 'facet-controls',
  props: {
    result: {},
    isChangeView: {
      type: Boolean,
      default: false,
    },
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
      return this.$store.getters.settings.propertyChains;
    },
    sortedFacets() {
      const unordered = this.result.stats.sliceByDimension;
      const cmp = (dim) => (this.facetSettings.hasOwnProperty(dim) ? this.facetSettings[dim].facet.order : Number.MAX_VALUE);
      const ordered = Object
        .keys(unordered)
        .sort((a, b) => cmp(unordered[a].dimension) - cmp(unordered[b].dimension))
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
      :is-change-view="isChangeView"
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
