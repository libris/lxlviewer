<script>
import ResultListItem from './result-list-item';
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
    'result-list-item': ResultListItem,
  },
  watch: {
  },
  mounted() { // Ready method is deprecated in 2.0, switch to "mounted"
  },
};
</script>

<template>
  <ol class="ResultList" aria-labelledby="resultDescr">
    <result-list-item  v-if="!compact && results.length > 0" class="ResultList-item"
      :database="getDatabase(index)" 
      :show-detailed="true"
      :focus-data="item" 
      :import-item="getImportItem(index)" v-for="(item, index) in results" 
      :key="item['@id']"></result-list-item>

    <result-list-item v-if="compact && results.length > 0" class="ResultList-item"
      :database="getDatabase(index)" 
      :show-detailed="false"
      :focus-data="item" 
      :import-item="getImportItem(index)" v-for="(item, index) in results" 
      :key="item['@id']"></result-list-item>
  </ol>
</template>

<style lang="less">
.ResultList {
  width: 100%;
  padding: 0px;
  list-style-type: none;
}
</style>
