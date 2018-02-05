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
        <div v-for="(dimensionKey, dimensionValue) in result.stats.sliceByDimension" :key="dimensionKey">
          <div class="dimension-header">{{facetLabelByLang(dimensionValue.dimension) | capitalize}}</div>
          <!--<range-input v-if="isRangeFacet(dimensionKey)"></range-input>-->
          <ul>
            <facet v-for="observation in dimensionValue.observation" :observation="observation" :key="observation.label"></facet>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="less">
@import '../shared/_variables.less';
.facet-controls {
  padding: 15px 5px 15px 15px;
  label {
    text-transform: uppercase;
  }
  .dimension-header {
    margin-top: 10px;
    margin-bottom: 2px;
    padding: 0px;
    font-weight: bold;
  }
  div {
    padding: 5px;
  }
  ul {
    list-style: none;
    padding: 0px;
    li {
      padding: 2px 0px;
      width: 100%;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      a {
        color: @gray-darker;
        font-size: 14px;
      }
      span {
        cursor: pointer;
        span {
          color: @gray-darker;
          font-size: 14px;
        }
      }
      i {

        margin-right: 0.4em;
      }
      .quantity {
        color: @gray;
        font-size: 0.8em;
      }
    }
  }
}
</style>
