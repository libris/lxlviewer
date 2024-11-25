<template>
  <div class="Marcframe-codeDetails">
    <h1>{{ translateUi('MARC mappings') }}</h1>
    <p v-if="settings.language == 'sv'">KB/Libris mappningar av MARC till RDF-vokabulär. För mer information, se
      <a class="ext" target="_blank" rel="noopener noreferrer" :href="marcFrameUri">källfil</a>
      och <a class="ext" target="_blank" rel="noopener noreferrer" href="https://github.com/libris/librisxl/blob/master/whelk-core/src/main/resources/ext/marcframe.md">dokumentation</a>.
    </p>
    <p v-else>
      KB/Libris mappings for MARC to RDF. For more information see
      <a class="ext" target="_blank" rel="noopener noreferrer" :href="marcFrameUri">source file</a>
      and <a class="ext" target="_blank" rel="noopener noreferrer" href="https://github.com/libris/librisxl/blob/master/whelk-core/src/main/resources/ext/marcframe.md">documentation</a>.
    </p>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import * as VocabUtil from 'lxljs/vocab';
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
    ...mapGetters(['settings', 'vocab', 'vocabContext']),
    pageTitle() {
      return 'MARC-mappningar';
    },
    termTitle() {
      return this.getEntityTitle(this.termData);
    },
    marcFrameUri() {
      const baseUri = this.$config.siteConfig['libris.kb.se']?.baseUri;
      return `${baseUri}/sys/marcframe.json`;
    }
  },
  methods: {
  },
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
