<template>
  <div class="Marcframe-codeDetails">
    <template v-if="codeData">
      <div class="Marcframe-codeHeader" id="code-section">
        <h1>{{ category.toUpperCase() }}-{{ code }}</h1> <a href="#example-section">Gå till kodexempel</a>
      </div>
      <div class="Marcframe-codeBody">
        <MarcframeObject :value="codeData" />
      </div>
      <div class="Marcframe-codeHeader" id="example-section">
        <h2>Examples</h2> <a href="#code-section">Gå till toppen av sidan</a>
      </div>
      <div class="Marcframe-codeBody">
        <template v-if="codeData.hasOwnProperty('_spec')">
          <MarcframeExample :example="example" v-for="(example, index) in codeData['_spec']" :key="index" />
        </template>
        <template v-else>
          No examples.
        </template>
      </div>
    </template>
    <template v-else>
      <h1>Hittade inte mappning för kod {{ category }}-{{ code }}</h1>
    </template>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import ResultItem from '@/components/ResultItem';
import EntityNode from '@/components/EntityNode';
import MarcframeExample from '@/components/MarcframeExample';

export default {
  head() {
    return {
      title: `${this.pageTitle} | ${this.$config.siteName}`,
      meta: [
        { hid:'og:title', property:'og:title', content: this.pageTitle },
        { hid: 'description', name: 'description', content: this.documentDescription },
        { hid:'og:description', property:'og:description', content: this.documentDescription },
      ],
    };
  },
  data() {
    return {
      listShown: 'Classes',
      showMarc: false,
      showExamples: true,
    }
  },
  computed: {
    ...mapGetters(['vocab', 'vocabClasses', 'vocabProperties', 'vocabContext', 'resources']),
    pageTitle() {
      if (this.codeTitle) {
        return `${ this.codeTitle.toUpperCase() }`;
      }
      return 'MARC-mappningar';
    },
    category() {
      return this.$route.params.category;
    },
    code() {
      return this.$route.params.code;
    },
    codeData() {
      return this.resources.marcframe[this.category][this.code];
    },
    documentDescription() {
      return 'MARC-mappning';
    },
    codeTitle() {
      return `${ this.category }-${ this.code }`;
    },
  },
  methods: {
  },
  // call fetch only on client-side
  fetchOnServer: false,
  watchQuery: true,
  components: {
    ResultItem,
    EntityNode,
    MarcframeExample,
    MarcframeObject: () => import('@/components/MarcframeObject.vue'),
  },
}
</script>

<style lang="scss">

.Marcframe {
  &-codeBody {
    padding: 0.5rem 1rem 0.5rem 1.5rem;
    > .MarcframeObject {
      border: 1px solid $gray-300;
      > .MarcframeRow {
        > div {
          padding: 0.25em;
        }
        &:nth-child(odd) {
          background-color: rgba($gray-100, .5);
        }
      }
    }
  }
  &-codeHeader {
    display: flex;
    align-items: baseline;
    scroll-margin-top: 10em;
  }
}

</style>