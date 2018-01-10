<script>
import ResultList from './result-list';
import EntitySearchList from './entity-search-list';
import SearchPagination from './search-pagination';
import { getUser, getStatus, getSettings } from '../../vuex/getters';

export default {
  name: 'search-result-component',
  vuex: {
    actions: {
    },
    getters: {
      user: getUser,
      status: getStatus,
      settings: getSettings,
    },
  },
  props: {
    result: {},
    importData: [],
  },
  data() {
    return {
      keyword: '',
      showResult: false,
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
    hasPagination() {
      return (typeof this.paginationData.first !== 'undefined');
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
      setTimeout(() => {
        this.showResult = true;
      }, 1);
    });
  },
};
</script>

<template>
  <div class="search-result-component" :class="{'show-result': showResult}">
    <div v-if="(status.resultList.loading || status.resultList.error)" class="loadingText panel panel-default">
      <h1 v-if="!status.resultList.error"><i class="fa fa-circle-o-notch fa-spin"></i></h1>
      <h1 v-if="status.resultList.error"><i class="fa fa-warning"></i></h1>
      <span v-if="!status.resultList.error" class="status">{{"Fetching results" | translatePhrase}}</span>
      <span v-if="status.resultList.error" class="error">{{status.resultList.info}}</span>
    </div>
    <search-pagination v-if="!status.resultList.loading && !status.resultList.error" :page-data="paginationData" :show-details="true" :has-pagination="hasPagination" :show-pages="false"></search-pagination>
    <result-list v-if="!status.resultList.loading && !status.resultList.error" :results="result.items" :import-data="importData" :compact="user.settings.resultListType === 'compact'"></result-list>
    <search-pagination v-if="!status.resultList.loading && !status.resultList.error && hasPagination" :has-pagination="hasPagination" :page-data="paginationData" :show-details="false" :show-pages="true"></search-pagination>
  </div>
</template>

<style lang="less">
@import '../shared/_variables.less';

.search-result-component {
  opacity: 0;
  transition: 0.5s ease opacity;
  &.show-result {
    opacity: 1;
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
