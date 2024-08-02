<script>
import { asAppPath, translatePhrase } from '@/utils/filters';
import ResultList from './result-list.vue';
import ResultControls from './result-controls.vue';

export default {
  name: 'search-result',
  props: {
    result: {
      type: Object,
      default: null,
    },
    query: {
      type: String,
      default: '',
    },
    importData: {
      type: Array,
      default: null,
    },
  },
  data() {
    return {
      keyword: '',
      showResult: false,
    };
  },
  methods: {
    translatePhrase,
    asAppPath,
    doSort(newsort) {
      const newQuery = Object.assign({}, this.$route.query, { _sort: newsort, _offset: 0 });
      this.$router.push({ query: newQuery });
    },
  },
  watch: {
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
      if (!page.itemsPerPage) {
        page.itemsPerPage = page.items.length;
      }
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
    isChangeView() {
      return this.$route.params.tool === 'changes';
    },
  },
  components: {
    'result-controls': ResultControls,
    'result-list': ResultList,
  },
  mounted() {
    this.$nextTick(() => {
      setTimeout(() => {
        this.showResult = true;
      }, 1);
    });
  },
};
</script>

<template>
  <div class="SearchResult" :class="{ 'is-showResult': showResult }">
    <div v-if="(status.resultList.loading || status.resultList.error)" class="SearchResult-loadingText panel panel-default">
      <span v-if="!status.resultList.error">
        <i class="fa fa-circle-o-notch fa-spin" />
      </span>
      <span v-if="status.resultList.error">
        <i class="fa fa-warning" />
      </span>
      <span v-if="!status.resultList.error" class="is-status">{{ translatePhrase("Fetching results") }}</span>
      <span v-if="status.resultList.error" class="is-error">{{status.resultList.info}}</span>
    </div>
    <div
      class="suggestions"
      v-if="!status.resultList.loading && !status.resultList.error && result['_spell']"
    >
      <p :key="suggestion" v-for="suggestion in result['_spell']">
        {{translatePhrase('Did you mean')}}
        <router-link
          :to="asAppPath(suggestion.view['@id'], this.$route.params.tool === 'changes')"
        >
          <span v-html="suggestion.labelHTML" />
        </router-link>?
      </p>
    </div>
    <result-controls
      class="SearchResult-controls"
      v-if="!status.resultList.loading && !status.resultList.error"
      :page-data="paginationData"
      :show-details="true"
      :has-pagination="hasPagination"
      :show-pages="false"
      @sortChange="doSort($event)" />
    <result-list
      class="SearchResult-list"
      v-if="!status.resultList.loading && !status.resultList.error"
      :results="result.items"
      :import-data="importData"
      :compact="user.settings.resultListType === 'compact'"
      :isChangeView="isChangeView"
    />
    <result-controls
      class="SearchResult-controls"
      v-if="!status.resultList.loading && !status.resultList.error && hasPagination"
      :has-pagination="hasPagination"
      :page-data="paginationData"
      :show-details="false"
      :show-pages="true" />
  </div>
</template>

<style lang="less">
.SearchResult {
  padding: 2rem 0;

  @media (min-width: @screen-md) {
    padding: 0 0 2rem 0;
  }

  & .suggestions {
    margin-top: 1em;
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
