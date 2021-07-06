<template>
  <div class="container-fluid">
    <div class="col-12 col-md-12 col-lg-10 col-xl-8 col-xxl-6 py-4" v-html="pageData['@graph'][1].articleBody"></div>
  </div>
</template>

<script>
export default {
  data() {
    return {
    }
  },
  async asyncData({ $config, route, params, $http }) {
    const pageData = await $http.$get(`${$config.apiPath}/doc/${params.article}/data.jsonld`)
    return { pageData }
  },
  // call fetch only on client-side
  fetchOnServer: false
}
</script>

<style>
</style>