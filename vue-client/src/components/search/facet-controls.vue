<script>
import { mapState } from 'pinia';
import { useSettingsStore } from '@/stores/settings';
import FacetGroup from './facet-group.vue';

export default {
  name: 'facet-controls',
  props: {
    result: {},
  },
  data() {
    return {
      numOfExpanded: 6,
    };
  },
  computed: {
    ...mapState(useSettingsStore, ['propertyChains']),
    sortedFacets() {
      const unordered = this.result.stats.sliceByDimension;
      const cmp = dim => (this.propertyChains.hasOwnProperty(dim) ? this.propertyChains[dim].facet.order : Number.MAX_VALUE);
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
  components: {
    'facet-group': FacetGroup,
  },
};
</script>

<template>
  <div class="FacetControls">
    <facet-group
      v-for="(dimensionValue, dimensionKey, index) in sortedFacets"
      :key="dimensionKey"
      :group="dimensionValue"
      :expanded="index < numOfExpanded"
    />
  </div>
</template>

<style lang="scss">
.FacetControls {
  padding: 0 10px;

  @include media-breakpoint-up(md) {
    padding: 0;
  }
}
</style>
