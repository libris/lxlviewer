<script>
export default {
  name: 'facet-controls',
  props: {
    title: 'test',
    result: {},
  },
  data() {
    return {
      keyword: '',
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
  },
  computed: {
  },
  components: {
  },
  watch: {
    keyword(value, oldval) {
      console.log("keyword changed", value, oldval);
    },
  },
  ready() { // Ready method is deprecated in 2.0, switch to "mounted"
    this.$nextTick(() => {
      // Do stuff
    });
  },
};
</script>

<template>
  <div v-if="result" class="panel panel-default">
    <div class="panel-body facet-controls">
      <label>Filtrera</label>
      <div>
        <div v-for="(dimensionKey, dimensionValue) in result.stats.sliceByDimension">
          <div class="dimension-header">{{facetlabels[dimensionValue.dimension]}}</div>
          <ul>
            <li v-for="observation in dimensionValue.observation">
              <a v-if="observation.object.label" :href="observation.view['@id']" title="observation.object.label">
                {{observation.object.label}}
              </a>
              <a v-if="observation.object.prefLabelByLang && observation.object.prefLabelByLang.sv" :href="observation.view['@id']" title="observation.object.prefLabelByLang.sv">
                {{observation.object.prefLabelByLang.sv}}
              </a>
              <span class="quantity">({{observation.totalItems}})</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="less">
@import './_variables.less';

</style>
