<template>
  <div class="Vocab-termDetails">
    <div v-if="termData">
      <ResultItem :entity="termData" :force-expanded="true" :show-download="false" :show-other-services="false" />
      <br>
      <TermLenses v-if="termData['@type'] == 'Class'" :entity="termData" />
    </div>
    <div v-else>
      <h2>
        {{ translateUi("Could not find term") }}: {{ $route.params.term }}
      </h2>
      <p>
        <a href="" @click.prevent="$router.back()">{{ translateUi('Go back') }}</a>
      </p>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import * as VocabUtil from 'lxljs/vocab';
import * as DisplayUtil from 'lxljs/display';
import ResultItem from '@/components/ResultItem';
import TermLenses from '@/components/TermLenses';

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
    ...mapGetters(['vocab', 'vocabContext', 'resources', 'settings']),
    pageTitle() {
      if (this.termData) {
        return `${ this.termTitle || 'Basvokabulär'}`
      }
      return 'Basvokabulär';
    },
    lensDefinitions() {
      const lenses = {};
      lenses.tokens = DisplayUtil.getDisplayProperties(this.termData['@type'], this.resources, this.settings, 'tokens');
      lenses.chips = DisplayUtil.getDisplayProperties(this.termData['@type'], this.resources, this.settings, 'chips');
      lenses.cards = DisplayUtil.getDisplayProperties(this.termData['@type'], this.resources, this.settings, 'cards');
      return lenses;
    },
    documentDescription() {
      if (this.termData && this.termData.hasOwnProperty('@type')) {
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
  // call fetch only on client-side
  fetchOnServer: false,
  watchQuery: true,
  components: {
    TermLenses,
    ResultItem,
  },
}
</script>

<style lang="scss">

.DisplayDefs {
  table {
    border: 1px solid #ccc;
    td {
      border: 1px solid #ccc;
    }
  }
}

</style>
