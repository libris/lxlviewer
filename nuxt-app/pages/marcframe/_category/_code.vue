<template>
  <div class="Marcframe-codeDetails">
    <template v-if="codeData">
      <div class="Marcframe-codeHeader" id="code-section">
        <h1>{{ category.toUpperCase() }}-{{ code }}</h1> <a href="#example-section">{{ translateUi('Go to examples') }}</a>
      </div>
      <div class="Marcframe-codeBody">
        <MarcframeObject :value="codeData" />
      </div>
      <div class="Marcframe-codeHeader" id="example-section">
        <h2>{{ translateUi('Examples') }}</h2> <a href="#code-section">{{ translateUi('Go to top of page') }}</a>
      </div>
      <div class="Marcframe-codeBody">
        <template v-if="codeData.hasOwnProperty('_spec')">
          <MarcframeExample :example="example" v-for="(example, index) in codeData['_spec']" :key="index" />
        </template>
        <template v-else>
          {{ translateUi('No examples') }}.
        </template>
      </div>
    </template>
    <template v-else>
      <div>
        <h1>{{ translateUi('Did not find mapping for code') }} {{ category ? category : '' }}-{{ code ? code : '' }}</h1>
        <p>
          <a href="" @click.prevent="$router.back()">{{ translateUi('Go back') }}</a>
        </p>
      </div>
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
    ...mapGetters(['vocab', 'vocabContext', 'resources']),
    pageTitle() {
      if (this.codeTitle) {
        return `${ this.codeTitle.toUpperCase() }`;
      }
      return 'MARC-mappningar';
    },
    category() {
      if (this.$route.params.category) {
        return this.$route.params.category;
      }
      return null;
    },
    code() {
      if (this.$route.params.code) {
        return this.$route.params.code;
      }
      return null;
    },
    codeData() {
      if (this.code && this.category) {
        return this.resources.marcframe[this.category][this.code];
      }
      return null;
    },
    documentDescription() {
      return 'MARC-mappning';
    },
    codeTitle() {
      if (this.category && this.code) {
        return `${ this.category }-${ this.code }`;
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