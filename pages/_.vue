<template>
  <div class="container-fluid">
    <div class="Document">
      <ItemLocal :value="pageData['@graph'][1]" />
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
    }
  },
  methods: {
  },
  async asyncData({ $config, route, params, $http }) {
    const pageData = await $http.$get(`${$config.apiPath}/${route.path}/data.jsonld`)
    return { pageData }
  },
  // call fetch only on client-side
  fetchOnServer: false
}
</script>

<style>
.Document {

}
</style>