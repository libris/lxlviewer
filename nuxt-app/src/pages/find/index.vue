<template>
  <div class="Find">
    <div class="container-fluid FilterContainer">
      <div class="row">
        <SchemeFilters v-if="collectionResults.stats" :slices="collectionResults.stats.sliceByDimension" />
      </div>
    </div>
    <div class="container-fluid">
      <div class="row">
        <div class="DetailedFilters col-md-4 col-lg-3 col-xl-4 col-xxl-3">
          <FacetList :page-data="pageData" v-if="pageData" />
        </div>
        <div class="SearchResults col-md-8 col-lg-9 col-xl-8 col-xxl-9 p-2">
          <div class="SearchResults-statusRow">
            <SortSelect @change="sortChange" />
            <PageStatus :page-data="pageData" />
          </div>
          <div class="SearchStatus col-md-8 col-lg-8 col-xl-9 col-xxl-10" v-if="pageData.totalItems == 0">
            <p>
              {{ translateUi('No results') }}.
            </p>
          </div>
          <div class="SearchResult-resultList">
            <ResultItem v-for="resultItem in pageData.items" :entity="resultItem" :key="resultItem['@id']" :show-other-services="false" />
          </div>
          <Pagination :result-data="pageData" v-if="pageData.totalItems > 0" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import SchemeFilters from '@/components/SchemeFilters';
import FacetList from '@/components/FacetList';
import SortSelect from '@/components/SortSelect';
import PageStatus from '@/components/PageStatus';
import ResultItem from '@/components/ResultItem';
import Pagination from '@/components/Pagination';

export default {
  head() {
    return {
      title: `Sökresultat | ${this.$config.siteName}`,
      meta: [
        { hid:'og:title', property:'og:title', content:`Sökresultat` },
      ],
    };
  },
  data() {
    return {
    }
  },
  methods: {
    sortChange(value) {
      const query = Object.assign({}, this.$route.query);
      query['_sort'] = value;
      this.$router.push({
        query
      });
    },
  },
  computed: {
    ...mapGetters(['collections', 'appState']),
  },
  async asyncData({ $config, route, params, $http, store, app }) {
    const domain = store.getters.appState.domain
    const siteConfig = $config.siteConfig
    const host = app.$translateAliasedUri(siteConfig[domain].baseUri)
    const query = route.query;
    let queryString = '';

    Object.entries(query).forEach(([key, val]) => queryString += `${key}=${app.$encodeSpecialChars(val)}&`);
    const pageData = await $http.$get(`${host}/find.jsonld?${queryString}`);
    const collectionResults = await $http.$get(`${host}/find.jsonld?q=${app.$encodeSpecialChars(route.query.q)}&_limit=0`);
    return {
      pageData,
      collectionResults,
    }
  },
  beforeRouteLeave(to, from, next) {
    if (this.appState.navigatingFromSearchBar) {
      console.log("Navigating from search bar");
      this.$store.dispatch('setAppState', { property: 'navigatingWithFacetColumn', value: false });
      this.$store.dispatch('setAppState', { property: 'navigatingFromSearchBar', value: false });
    } else {
      console.log("Navigating from link");
      this.$store.dispatch('setAppState', { property: 'navigatingWithFacetColumn', value: true });
    }
    next();
  },
  // call fetch only on client-side
  fetchOnServer: false,
  watchQuery: true,
  components: {
    SchemeFilters,
    FacetList,
    SortSelect,
    PageStatus,
    ResultItem,
    Pagination,
  },
}
</script>

<style lang="scss">

.FilterContainer {
  background-color: $gray-100;
  border: solid $gray-200;
  border-width: 0px 0px 1px 0px;
  min-height: 3.5em;
}

.SearchResults {
  &-statusRow {
    display: flex;
    justify-content: space-between;
    padding: 0.5em 1.5em 1em 0;
    flex-wrap: wrap;
  }
}
.SearchStatus {
  padding: 1em 1.5em;
}
.DetailedFilters {
  border: solid $gray-200;
  border-width: 0px 1px 0px 0px;
}
</style>
