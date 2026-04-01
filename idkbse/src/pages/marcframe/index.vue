<template>
  <div class="Marcframe-codeDetails">

    <h1>{{ translateUi('MARC mappings') }}</h1>

    <div v-if="settings.language == 'sv'">
      <p>KB/Libris mappningar av MARC till RDF-vokabulär. För mer information, se
        <a class="ext" target="_blank" rel="noopener noreferrer" :href="marcFrameUri">källfil</a>
        och <a class="ext" target="_blank" rel="noopener noreferrer" href="https://github.com/libris/librisxl/blob/master/whelk-core/src/main/resources/ext/marcframe.md">dokumentation</a>.
      </p>
      <div class="alert alert-warning">
        I och med Libris 1.42 har följande förändringar skett i MARC-mappningarna för bibliografisk information (BIB):
        <dl>
        <dt>Verk</dt>
        <dd> Egenskaperna <code>contentType</code> och <code>genreForm</code> utgår och ersätts av egenskapen <code>category</code>.</dd>
        <dt>Instans</dt>
        <dd>Egenskaperna <code>mediaType</code>, <code>carrierType</code> och <code>genreForm</code> utgår och ersätts av egenskapen <code>category</code>.
          Egenskapen <code>issuanceType</code> utgår och ersätts av egenskapen <code>@type</code> <em>på verket</em>.</dd>
        </dl>
        Den påverkan detta har i relation till MARC-formatet exemplifieras i nedanstående sektioner.
      </div>
    </div>
    <div v-else>
      <p>
        KB/Libris mappings from MARC to RDF. For more information see
        <a class="ext" target="_blank" rel="noopener noreferrer" :href="marcFrameUri">source file</a>
        and <a class="ext" target="_blank" rel="noopener noreferrer" href="https://github.com/libris/librisxl/blob/master/whelk-core/src/main/resources/ext/marcframe.md">documentation</a>.
      </p>
      <div class="alert alert-warning">
        Mapping of the following MARC fields has been changed after Libris release 1.42
      </div>
    </div>

    <section v-for="fieldSpec in marcExamples" class="MarcframeExample">
      <div class="MarcframeExample-header">{{ fieldSpec.field }}</div>
      <p v-if="settings.language == 'sv'" v-for="note in fieldSpec.notes">{{ note }}</p>
      <MarcframeExample :example="example" v-for="(example, index) in fieldSpec.examples" :key="index" />
    </section>

  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import * as VocabUtil from 'lxljs/vocab';
import ResultItem from '@/components/ResultItem';
import MarcframeExample from '@/components/MarcframeExample';
import marcExamples from '@/resources/json/marcExamples.json';

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
      marcExamples, // doesn't make a difference (nor if using a different name)
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

<script setup>
  // required to expose marcExamples (for some reason)
</script>

<style lang="scss">

</style>
