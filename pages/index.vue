<template>
  <div class="container-fluid">
    <div>
      <h1>Listor</h1>
      <p>Current API path is: {{$config.apiPath}}</p>
      <div class="Collections row" v-if="pageData">
        <CollectionCard v-for="collection in pageData.statistics.sliceByDimension['inScheme.@id'].observation" :collection-data="collection" :key="collection['@id']" />
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
  async asyncData({ $config, params, $http }) {
    const pageData = await $http.$get(`${$config.apiPath}/data.jsonld`)
    return { pageData }
  },
  // call fetch only on client-side
  fetchOnServer: false
}
</script>

<style>


.title {
  font-family:
    'Quicksand',
    'Source Sans Pro',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Roboto,
    'Helvetica Neue',
    Arial,
    sans-serif;
  display: block;
  font-weight: 300;
  font-size: 100px;
  color: #35495e;
  letter-spacing: 1px;
}

.subtitle {
  font-weight: 300;
  font-size: 42px;
  color: #526488;
  word-spacing: 5px;
  padding-bottom: 15px;
}

.links {
  padding-top: 15px;
}
</style>
