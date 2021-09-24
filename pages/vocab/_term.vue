<template>
  <div class="Vocab-termDetails">
    <ResultItem :entity="termData" :force-expanded="true" :show-download="false" />
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
        { hid:'og:title', property:'og:title', content: this.termTitle || 'Basvokabulär' },
        { hid: 'description', name: 'description', content: this.documentDescription },
        { hid:'og:description', property:'og:description', content: this.documentDescription },
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
      if (this.termData) {
        return `${ this.termTitle || 'Basvokabulär'}`
      }
      return 'Basvokabulär';
    },
    documentDescription() {
      if (this.termData.hasOwnProperty('@type')) {
        let type = '';
        if (Array.isArray(this.termData['@type'])) {
          type = this.termData['@type'][0];
        } else {
          type = this.termData['@type'];
        }
        return this.translateKey(type);
      }
      return '';
    },
    termTitle() {
      return this.getEntityTitle(this.termData);
    },
    termData() {
      if (this.$route.params.term) {
        return VocabUtil.getTermObject(this.$route.params.term, this.vocab, this.vocabContext);
      }
      return null;
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