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
  async asyncData({ $config, route, params, $http }) {
    const pageData = await $http.$get(`${$config.apiPath}/doc/${params.article}/data.jsonld`)
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