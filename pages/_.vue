<template>
  <div class="container-fluid">
    <div class="Document">
      <h1>{{ documentTitle }}</h1>
      <EntityTable :item-data="pageData['@graph'][1]" :show-download="true" />
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
    documentTitle() {
      return this.getEntityTitle(this.itemData);
    },
    itemData() {
      return this.pageData['@graph'][1];
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

<style lang="scss">
.Document {
  h1 {
    padding: 0.5rem 1rem 0.5rem 1.5rem;
    font-size: 3rem;
  }
}
</style>