<template>
  <div class="container-fluid">
    <div class="row">
      <CollectionFilters :stats="stats" />
    </div>
    <div class="row">
      <div class="DetailedFilters col-lg-4 col-xl-3 col-xxl-2"></div>
      <div class="SearchResults col-lg-8 col-xl-9 col-xxl-10">
        <ResultItem v-for="resultItem in items" :item-data="resultItem" :key="resultItem['@id']" />
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
    const items = pageData.items;
    const stats = pageData.stats;
    return { items, stats }
  },
  // call fetch only on client-side
  fetchOnServer: false,
  watchQuery: true,
}
</script>

<style lang="scss">

.SearchResults {

}
</style>