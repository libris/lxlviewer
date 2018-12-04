<script>
import ResultList from './result-list';
import ResultControls from './result-controls';

export default {
  name: 'search-result',
  props: {
    result: {},
    query: {
      type: String,
      default: '',
    },
    importData: Array,
  },
  data() {
    return {
      fullResult: {},
      keyword: '',
      showResult: false,
    };
  },
  methods: {
    getFullLocalResult() {
      let currentQuery = this.query;
      currentQuery = currentQuery.replace(/&_offset=.*/, '&_offset=');

      const unlimitedQuery = currentQuery.replace(/_limit=.*&/, `_limit=${this.totalItems}&`);
      
      const fetchUrl = `${this.settings.apiPath}/find.json?${unlimitedQuery}`;

      fetch(fetchUrl).then(response => response.json(), (error) => {
        this.$store.dispatch('pushNotification', { type: 'danger', message: StringUtil.getUiPhraseByLang('Something went wrong', this.user.settings.language) });
        this.searchInProgress = false;
      }).then((result) => {
        this.fullResult = result;
        this.searchInProgress = false;
      });
    },
  },
  watch: {
    fullResult(newValue) {
      this.$store.dispatch('setBreadcrumbData',
        [
          {
            type: 'searchResult',
            result: newValue,
            resultUrl: this.$route.fullPath,
          },
        ]);
    },
  },
  computed: {
    status() {
      return this.$store.getters.status;
    },
    user() {
      return this.$store.getters.user;
    },
    settings() {
      return this.$store.getters.settings;
    },
    paginationData() {
      const page = Object.assign({}, this.result);
      delete page.items;
      return page;
    },
    hasPagination() {
      return (
        typeof this.paginationData.first !== 'undefined'
        && typeof this.paginationData.last !== 'undefined'
      );
    },
    totalItems() {
      return this.result.totalItems;
    },
  },
  components: {
    'result-controls': ResultControls,
    'result-list': ResultList,
  },
  mounted() {
    this.$nextTick(() => {
      this.getFullLocalResult();
      setTimeout(() => {
        this.showResult = true;
      }, 1);
    });
  },
};
</script>

<template>
  <div class="SearchResult" :class="{'is-showResult': showResult}">
    <div v-if="(status.resultList.loading || status.resultList.error)" class="SearchResult-loadingText panel panel-default">
      <span v-if="!status.resultList.error">
        <i class="fa fa-circle-o-notch fa-spin"></i>
      </span>
      <span v-if="status.resultList.error">
        <i class="fa fa-warning"></i>
      </span>
      <span v-if="!status.resultList.error" class="is-status">{{"Fetching results" | translatePhrase}}</span>
      <span v-if="status.resultList.error" class="is-error">{{status.resultList.info}}</span>
    </div>
    <result-controls class="SearchResult-controls" 
      v-if="!status.resultList.loading && !status.resultList.error" 
      :page-data="paginationData" 
      :show-details="true" 
      :has-pagination="hasPagination" 
      :show-pages="false">
    </result-controls>
    <result-list class="SearchResult-list" 
      v-if="!status.resultList.loading && !status.resultList.error" 
      :results="result.items" 
      :import-data="importData" 
      :compact="user.settings.resultListType === 'compact'">
    </result-list>
    <result-controls class="SearchResult-controls" 
      v-if="!status.resultList.loading && !status.resultList.error && hasPagination" 
      :has-pagination="hasPagination" 
      :page-data="paginationData" 
      :show-details="false" 
      :show-pages="true">
    </result-controls>
  </div>
</template>

<style lang="less">
.SearchResult {
  padding: 10px;

  @media (min-width: @screen-md) {
    padding: 0;
  }

  &-loadingText {
    box-shadow: 0px 2px 2px 0px rgba(0, 0, 0, 0.1);
    padding: 20px 0px;
    min-height: 50vh;
    vertical-align: middle;
    text-align: center;

    & .is-status {
      display: block;
      font-size: 0.7em;
    }

    & .is-error {
      display: inline-block;
      font-family: monospace;
      border: 1px solid rgb(94, 39, 39);
      margin-top: 30px;
      padding: 5px;
      max-width: 50%;
      color: maroon;
    }
  }
}
</style>
