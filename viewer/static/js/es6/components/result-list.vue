<script>
import ResultItemCompact from './result-item-compact';
import ResultItemDetailed from './result-item-detailed';
import * as RecordUtil from '../utils/record';

export default {
  name: 'result-list',
  props: {
    results: [],
    compact: false,
    importData: [],
  },
  data() {
    return {
      keyword: '',
    }
  },
  methods: {
    getImportItem(index) {
      if (typeof this.importData !== 'undefined') {
        const node = this.importData[index].data;
        const importItem = RecordUtil.getImportObject(node['@graph']);
        return importItem;
      }
      return {};
    },
  },
  computed: {
  },
  components: {
    'result-item-compact': ResultItemCompact,
    'result-item-detailed': ResultItemDetailed,
  },
  watch: {
  },
  ready() { // Ready method is deprecated in 2.0, switch to "mounted"
  },
};
</script>

<template>
  <div class="result">
    <ul class="result-list" v-if="!compact && results.length > 0">
      <result-item-detailed :focus-data="item" :import-item="getImportItem($index)" v-for="item in results" track-by="$index"></result-item-detailed>
    </ul>
    <ul class="result-list" v-if="compact && results.length > 0">
      <result-item-compact :focus-data="item" :import-item="getImportItem($index)"  v-for="item in results" track-by="$index"></result-item-compact>
    </ul>
  </div>
</template>

<style lang="less">
@import './_variables.less';

.result {
  .result-list {
    width: 100%;
    padding: 0px;
    list-style-type: none;
  }
}

</style>
