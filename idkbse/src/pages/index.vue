<template>
  <div class="container-fluid">
    <div class="col-12 col-lg-12 col-xl-12 col-xxl-10 py-4">
      <h4>{{ translateUi('Lists') }}</h4>
      <div class="Collections" v-if="pageData">
        <CollectionCard v-for="collection in pageData.statistics.sliceByDimension['inScheme.@id'].observation" :collection-data="collection" :key="collection['@id']" />
      </div>
    </div>
    <div class="col-12" v-if="settings.language == 'sv' && summary">
    <h4>Om tjänsten</h4>
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
  async asyncData({ $config, params, $http, app}) {
    const pageData = await $http.$get(`${app.$defaultHostPath()}/data.jsonld`);
    let summary;
    try {
      summary = await $http.$get(`${app.$defaultHostPath()}/doc/summary/data.jsonld`);
    } catch (e) {
      summary = null;
    }
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
  grid-template-columns: minmax(0, 1fr);
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
