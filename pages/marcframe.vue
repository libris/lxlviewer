<template>
  <div class="Marcframe container-fluid">
    <div class="row">
      <div class="col-12 col-md-12 col-lg-10 col-xl-8 col-xxl-6 py-4">
        <h1>Marcframe</h1>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  head() {
    return {
      title: `${this.pageTitle} | ${this.$config.siteName}`,
      meta: [
        { hid:'og:title', property:'og:title', content: this.pageTitle },
      ],
    };
  },
  data() {
    return {
    }
  },
  computed: {
    pageTitle() {
      return 'Marcframe';
    },
  },
  async asyncData({ $config, route, params, $http }) {
    const marcframeGithub = 'https://raw.githubusercontent.com/libris/librisxl/master/whelk-core/src/main/resources/ext/marcframe.json';
    const marcFrameJson = `${$config.apiPath}/sys/marcframe.json`;
    const pageData = await $http.$get(marcframeGithub);
    return { pageData }
  },
  // call fetch only on client-side
  fetchOnServer: false
}
</script>

<style lang="scss">
.Marcframe {
  h1 {
    font-size: 3rem;
  }
}
</style>