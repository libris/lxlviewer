<template>
  <div class="container-fluid">
    <div class="Document">
      <h1>{{ documentTitle }}</h1>
      <EntityTable v-if="itemData != null" :item-data="itemData" :show-download="true" />
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex';

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
      if (this.pageData['@graph']) {
        return this.pageData['@graph'][1];
      }
      return null;
    },
  },
  methods: {
    ...mapActions(['setCurrentDocument']),
  },
  async asyncData({ $config, route, params, $http, store }) {
    const pageData = await $http.$get(`${$config.apiPath}/${route.path}/data.jsonld`);
    store.commit('SET_CURRENT_DOCUMENT', pageData);
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