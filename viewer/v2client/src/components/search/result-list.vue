<script>
import ResultItemCompact from './result-item-compact';
import ResultItemDetailed from './result-item-detailed';
import * as RecordUtil from '@/utils/record';

export default {
  name: 'result-list',
  props: {
    results: Array,
    compact: Boolean,
    importData: Array,
  },
  data() {
    return {
      keyword: '',
    }
  },
  methods: {
    getImportItem(index) {
      if (this.importData.length !== 0) {
        const node = this.importData[index].data;
        const importItem = RecordUtil.getImportObject(node['@graph']);
        return importItem;
      }
      return {};
    },
    getDatabase(index) {
      if (this.importData.length !== 0) {
        return this.importData[index].database;
      }
      return '';
    }
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
    <ul class="ResultList">
      <div v-if="!compact && results.length > 0">
        <result-item-detailed class="ResultList-item"
          :database="getDatabase(index)" 
          :focus-data="item" 
          :import-item="getImportItem(index)" v-for="(item, index) in results" 
          :key="item['@id']"></result-item-detailed>
      </div>
      <div v-if="compact && results.length > 0">
        <result-item-compact class="ResultList-item"
          :database="getDatabase(index)" 
          :focus-data="item" 
          :import-item="getImportItem(index)" v-for="(item, index) in results" 
          :key="item['@id']"></result-item-compact>
      </div>
    </ul>
</template>

<style lang="less">

.ResultList {
  width: 100%;
  padding: 0px;
  list-style-type: none;
}

</style>
