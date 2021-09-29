<template>
  <div class="Marcframe-termDetails">
    <template v-if="codeData">
      <h1>{{ category.toUpperCase() }}-{{ code }}</h1>
      <div class="Marcframe-termDetailsBody">
        <MarcframeObject :value="codeData" />
        <div class="Marcframe-termExamples">
          <hr>
          <h2>Examples:</h2>
            <template v-if="codeData.hasOwnProperty('_spec')">
              <MarcframeExample :example="example" v-for="(example, index) in codeData['_spec']" :key="index" />
            </template>
            <p v-else>
              No examples.
            </p>
        </div>
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
  &-termDetailsBody {
    padding: 0.5rem 1rem 0.5rem 1.5rem;
    > .MarcframeObject {
      border: 1px solid $gray-300;
      > .MarcframeRow {
        > div {
          padding: 0.25em;
        }
        &:nth-child(odd) {
          background-color: $gray-100;
        }
      }
    }
  }
}

</style>