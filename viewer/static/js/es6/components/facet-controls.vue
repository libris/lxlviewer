<script>
import RangeInput from './range-input.vue';
import Facet from './facet.vue';
export default {
  name: 'facet-controls',
  props: {
    result: {},
  },
  data() {
    return {
      facetlabels: {
        '@type': 'Typ',
        'carrierType': 'Bärartyp',
        'instanceOf.@type': 'Verkstyp',
        'instanceOf.contentType': 'Verksinnehållstyp',
        'instanceOf.language': 'Verksspråk',
        'publication.date': 'Utgivningsdatum'
      },
    }
  },
  methods: {
    isRangeFacet(dimensionKey) {
      return dimensionKey === 'publication.date';
    },
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
          <div class="dimension-header">{{facetlabels[dimensionValue.dimension]}}</div>
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
