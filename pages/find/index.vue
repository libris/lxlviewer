<template>
  <div class="container-fluid">
    <div class="row">
      <SchemeFilters :schemes="collectionResults.stats.sliceByDimension['inScheme.@id'].observation" />
    </div>
    <div class="row">
      <div class="DetailedFilters col-md-4 col-lg-4 col-xl-3 col-xxl-2">
        <FacetList :stats="pageData.stats" v-if="pageData.stats" />
      </div>
      <div class="SearchResults col-md-8 col-lg-8 col-xl-9 col-xxl-10 p-2">
        <div class="SearchResults-statusRow">
          <SortSelect @change="sortChange" />
          <PageStatus :page-data="pageData" />
        </div>
        <div class="SearchStatus col-md-8 col-lg-8 col-xl-9 col-xxl-10" v-if="pageData.totalItems == 0">
          <p>
            Inga resultat.
          </p>
        </div>
        <div class="SearchResult-resultList">
          <ResultItem v-for="resultItem in pageData.items" :entity="resultItem" :key="resultItem['@id']" />
        </div>
        <Pagination :result-data="pageData" v-if="pageData.totalItems > 0" />
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

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
    ...mapGetters(['collections']),
  },
  async asyncData({ $config, route, params, $http, store }) {
    const query = route.query;
    let queryString = '';
    // const collections = await $http.$get(`${$config.apiPath}/data.jsonld`);
    // store.commit('SET_COLLECTIONS', collections.statistics.sliceByDimension['inScheme.@id'].observation);

    Object.entries(query).forEach(([key, val]) => queryString += `${key}=${val}&`);
    const pageData = await $http.$get(`${$config.apiPath}/find.jsonld?${queryString}`);
    const collectionResults = await $http.$get(`${$config.apiPath}/find.jsonld?q=${route.query.q}`);
    return {
      pageData,
      collectionResults,
      // items: pageData.items,
      // stats: pageData.stats,
      // schemes: pageData.stats.sliceByDimension['inScheme.@id'].observation
    }
  },
  // call fetch only on client-side
  fetchOnServer: false,
  watchQuery: true,
}
</script>

<style lang="scss">

.SearchResults {
  &-statusRow {
    display: flex;
    justify-content: space-between;
    padding: 1em 1.5em 1em 0;
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