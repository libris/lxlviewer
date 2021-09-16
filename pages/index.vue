<template>
  <div class="container-fluid">
    <div class="col-12 col-lg-12 col-xl-12 col-xxl-10 py-4">
      <h3>Listor</h3>
      <div class="Collections" v-if="pageData">
        <CollectionCard v-for="collection in pageData.statistics.sliceByDimension['inScheme.@id'].observation" :collection-data="collection" :key="collection['@id']" />
      </div>
      <h3>Om tjänsten</h3>
      <div class="col-12 col-md-10 col-lg-9 col-xl-8 col-xxl-7" v-html="summary['@graph'][1].articleBody"></div>
    </div>
  </div>
</template>

<script>
import CollectionCard from '@/components/CollectionCard';

export default {
  data() {
    return {
    }
  },
  async asyncData({ $config, params, $http }) {
    const pageData = await $http.$get(`${$config.apiPath}/data.jsonld`);
    const summary = await $http.$get(`${$config.apiPath}/doc/summary/data.jsonld`);
    return { pageData, summary }
  },
  // call fetch only on client-side
  fetchOnServer: false,
  components: {
    CollectionCard,
  },
}
</script>

<style lang="scss">

.Collections {
  display: grid;
  grid-template-columns: 1fr;
  @include media-breakpoint-up(md) {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  }
  @include media-breakpoint-up(xl) {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr);
  }
}

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
