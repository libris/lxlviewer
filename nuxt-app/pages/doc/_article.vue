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
import { defaultHostPath } from '../../plugins/env';
const HOST_PATH = defaultHostPath();

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
  async asyncData({ $config, error, route, params, $http }) {
    const pageData = await $http.$get(`${HOST_PATH}/doc/${params.article}/data.jsonld`).catch((err) => {
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
