<template>
  <div class="Article container-fluid">
    <div class="row">
      <div v-if="settings.language != 'sv'" class="alert alert-warning mt-4" role="alert">
        Article only available in Swedish at the moment.
      </div>
      <div class="col-12 col-md-12 col-lg-10 col-xl-8 col-xxl-6 py-4" v-html="pageData['@graph'][1].articleBody"></div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  head() {
    return {
      title: `${this.pageData['@graph'][1].title} | ${this.$config.siteName}`,
      meta: [
        { hid:'og:title', property:'og:title', content: this.pageData['@graph'][1].title },
      ],
    };
  },
  data() {
    return {
    }
  },
  computed: {
    ...mapGetters(['settings']),
  },
  async asyncData({ $config, error, route, params, $http, store, app }) {
    const domain = store.getters.appState.domain
    const siteConfig = $config.siteConfig
    const host = app.$translateAliasedUri(siteConfig[domain].baseUri)

    const pageData = await $http.$get(`${host}/doc/${params.article}/data.jsonld`).catch((err) => {
      error({ statusCode: err.statusCode, message: err.message })
    });
    return { pageData }
  },
  // call fetch only on client-side
  fetchOnServer: false
}
</script>

<style lang="scss">
.Article {
  h1 {
    font-size: 3rem;
  }
}
</style>
