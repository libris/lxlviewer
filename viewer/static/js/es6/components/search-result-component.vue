<script>
import ResultList from './result-list';
import EntitySearchList from './entity-search-list';
import SearchPagination from './search-pagination';

export default {
  name: 'search-result-component',
  props: {
    result: {},
  },
  data() {
    return {
      keyword: '',
    }
  },
  methods: {
  },
  computed: {
    paginationData() {
      const page = Object.assign({}, this.result);
      delete page.items;
      return page;
    },
  },
  components: {
    'entity-search-list': EntitySearchList,
    'search-pagination': SearchPagination,
    'result-list': ResultList,
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
  <div>
    <search-pagination :page-data="paginationData" show-details="true"></search-pagination>
    <result-list :results="result.items"></result-list>
    <search-pagination :page-data="paginationData" show-details="false"></search-pagination>
  </div>
</template>

<style lang="less">
@import './_variables.less';

</style>
