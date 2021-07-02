<template>
  <div class="container-fluid">
    <div class="row">
      <div class="CollectionFilters col-md-12">
        <p>Query: {{ $route.query }}</p>
      </div>
    </div>
    <div class="row">
      <div class="DetailedFilters col-lg-4 col-xl-3 col-xxl-2"></div>
      <div class="SearchResults col-lg-8 col-xl-9 col-xxl-10">
        <ResultItem v-for="resultItem in pageData.items" :item-data="resultItem" :key="resultItem['@id']" />
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
    let queryString;
    Object.entries(query).forEach(([key, val]) => queryString += `${key}=${val}&`);
    const pageData = await $http.$get(`${$config.apiPath}/find.jsonld?${queryString}`)
    return { pageData }
  },
  // call fetch only on client-side
  fetchOnServer: false
}
</script>

<style lang="scss">
.CollectionFilters {
  background-color: $gray-100;
  padding: 1em 0;
  border: solid $gray-200;
  border-width: 0px 0px 1px 0px;
}
.SearchResults {

}
</style>