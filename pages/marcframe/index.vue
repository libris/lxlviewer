<template>
  <div class="Marcframe-codeDetails">
    <h1>MARC-mappningar</h1>
    <p>KB/Libris mappningar av MARC till RDF-vokabulär. För mer information, se 
      <a class="ext" target="_blank" rel="noopener noreferrer" href="https://github.com/libris/librisxl/blob/master/whelk-core/src/main/resources/ext/marcframe.json">källfil</a>
      och <a class="ext" target="_blank" rel="noopener noreferrer" href="https://github.com/libris/librisxl/blob/master/whelk-core/src/main/resources/ext/marcframe.md">dokumentation</a>.
    </p>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import * as VocabUtil from '@/utils/vocab';
import ResultItem from '@/components/ResultItem';

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
      listShown: 'Classes',
      showMarc: false,
    }
  },
  computed: {
    ...mapGetters(['vocab', 'vocabClasses', 'vocabProperties', 'vocabContext']),
    pageTitle() {
      return 'MARC-mappningar';
    },
    termTitle() {
      return this.getEntityTitle(this.termData);
    },
    chosenList() {
      if (this.listShown === 'Classes') {
        return this.classes;
      } else {
        return this.properties;
      }
    },
    classes() {
      return this.vocabClasses;
    },
    properties() {
      return this.vocabProperties;
    },
  },
  methods: {
  },
  // async asyncData({ $config, route, params, $http }) {
  //   const pageData = await $http.$get(`${$config.apiPath}/vocab/data.jsonld`);
  //   return {
  //     pageData,
  //   };
  // },
  // call fetch only on client-side
  fetchOnServer: false,
  watchQuery: true,
  components: {
    ResultItem,
  },
}
</script>

<style lang="scss">

</style>