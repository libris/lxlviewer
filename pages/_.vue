<template>
  <div class="container-fluid">
    <div class="Document">
      <h1>{{ documentTitle }}</h1>
      <EntityTable :item-data="pageData['@graph'][1]" />
    </div>
  </div>
</template>

<script>
export default {
  head() {
    return {
      title: `${this.documentTitle} | ${this.$config.siteName}`,
      meta: [
        { hid:'og:title', property:'og:title', content:`${this.documentTitle}` },
      ],
    };
  },
  data() {
    return {
    }
  },
  computed: {
    itemData() {
      return this.pageData['@graph'][1];
    },
    documentTitle() {
      if (this.itemData.prefLabel) {
        return this.itemData.prefLabel;
      }
      return 'Unnamed';
    },
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