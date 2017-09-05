<script>
import ResultList from './result-list';
import EntitySearchList from './entity-search-list';
import SearchPagination from './search-pagination';
import { getStatus, getSettings } from '../vuex/getters';

export default {
  name: 'search-result-component',
  vuex: {
    actions: {
    },
    getters: {
      status: getStatus,
      settings: getSettings,
    },
  },
  props: {
    result: {},
    formDataSupported: false,
    importData: [],
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
  <div class="search-result-component">
    <div v-if="(status.resultList.loading || status.resultList.error) && formDataSupported" class="loadingText panel panel-default">
      <h1 v-if="!status.resultList.error"><i class="fa fa-circle-o-notch fa-spin"></i></h1>
      <h1 v-if="status.resultList.error"><i class="fa fa-warning"></i></h1>
      <span v-if="!status.resultList.error" class="status">{{"Fetching results" | translatePhrase}}</span>
      <span v-if="status.resultList.error" class="error">{{status.resultList.info}}</span>
    </div>
    <search-pagination v-if="!status.resultList.loading && !status.resultList.error" :page-data="paginationData" :show-details="true"></search-pagination>
    <result-list v-if="!status.resultList.loading && !status.resultList.error" :results="result.items" :import-data="importData" :compact="settings.userSettings.resultListType === 'compact'"></result-list>
    <search-pagination v-if="!status.resultList.loading && !status.resultList.error" :page-data="paginationData" :show-details="false"></search-pagination>
  </div>
</template>

<style lang="less">
@import './_variables.less';

.search-result-component {
  .main-info {
    height: 7em;
  }
  .loadingText {
    box-shadow: 0px 2px 2px 0px rgba(0, 0, 0, 0.1);
    // margin: 120px 0;
    padding: 20px 0px;
    min-height: 50vh;
    vertical-align: middle;
    text-align: center;
    .status {
      display: block;
      font-size: 0.7em;
    }
    .error {
      display: inline-block;
      font-family: monospace;
      border: 1px solid maroon;
      margin-top: 30px;
      padding: 5px;
      max-width: 50%;
      color: maroon;
    }
  }
}

</style>
