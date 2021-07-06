<template>
  <div class="container-fluid">
    <div class="row">
      <SchemeFilters :schemes="pageData.stats.sliceByDimension['inScheme.@id'].observation" v-if="pageData.stats && pageData.stats.sliceByDimension && pageData.stats.sliceByDimension['inScheme.@id']" />
    </div>
    <div class="row">
      <div class="DetailedFilters col-lg-4 col-xl-3 col-xxl-2">
        <FacetList :stats="pageData.stats" v-if="pageData.stats" />
      </div>
      <div class="SearchResults col-lg-8 col-xl-9 col-xxl-10 p-2">
        <ResultItem v-for="resultItem in pageData.items" :item-data="resultItem" :key="resultItem['@id']" />
      </div>
      <div class="SearchStatus col-lg-8 col-xl-9 col-xxl-10" v-if="pageData.totalItems == 0">
        Inga resultat.
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
    }
  },
  async asyncData({ $config, route, params, $http }) {
    const query = route.query;
    let queryString = '';
    Object.entries(query).forEach(([key, val]) => queryString += `${key}=${val}&`);
    const pageData = await $http.$get(`${$config.apiPath}/find.jsonld?${queryString}`)

    return {
      pageData
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

}
.DetailedFilters {
  border: solid $gray-200;
  border-width: 0px 1px 0px 0px;
}
</style>