<script>
import LensMixin from './mixins/lens-mixin';
import { getSettings, getVocabulary, getDisplayDefinitions, getEditorData } from '../vuex/getters';

export default {
  mixins: [LensMixin],
  name: 'entity-summary',
  props: {
    focusData: {},
    renderLink: false,
  },
  vuex: {
    getters: {
      vocab: getVocabulary,
      display: getDisplayDefinitions,
      settings: getSettings,
      editorData: getEditorData,
    },
  },
  data() {
    return {
      keyword: '',
    }
  },
  methods: {
  },
  computed: {
  },
  components: {
  },
  watch: {
  },
  ready() { // Ready method is deprecated in 2.0, switch to "mounted"
  },
};
</script>

<template>
<div class="entity-summary">
  <div class="main-info">
    <div class="categorization">{{ getSummary.categorization.join(', ') }}</div>
    <h3 class="header">
      <a v-if="renderLink" :href="focusData['@id']">{{ getSummary.header.join(', ') }}</a>
      <span v-if="!renderLink">{{ getSummary.header.join(', ') }}</span>
    </h3>
    <ul class="info">
      <li v-for="v in getSummary.info">{{ v }}</li>
    </ul>
  </div>
  <div class="identifiers">
    <ul>
      <li v-for="v in getSummary.identifiers">{{v}}</li>
    </ul>
  </div>
  <div class="sub" v-if="getSummary.sub.length > 0 && getSummary.sub[0] !== ''">
    <span>{{ getSummary.sub.join(', ') }}</span>
  </div>
</div>
</template>

<style lang="less">
@import './_variables.less';
.entity-summary {
  width: 100%;
  border: 1px solid #ccc;
  font-size: 14px;
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  > * {
    padding: 5px;
  }
  .main-info {
    flex-basis: 70%;
    max-width: 70%;
    .categorization {
      color: #8a8a8a;
      font-weight: bold;
      font-size: 0.9em;
      margin-bottom: -0.4em;

    }
    .header {
      a {
        color: @brand-primary;
      }
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      line-height: 1.6em;
      margin: 0px;
      width: 100%;
    }
    ul.info {
      list-style-type: none;
      padding: 0px;
    }
  }
  .identifiers {
    flex-basis: 30%;
    text-align: right;
    padding: 10px;
    font-weight: bold;
    ul {
      list-style-type: none;
      padding: 0px;
    }
  }
  .sub {
    font-style: italic;
    flex-basis: 100%;
    background-color: rgba(0, 0, 0, 0.01);
    border: solid rgba(0, 0, 0, 0.1);
    border-width: 1px 0px 0px 0px;
    > span {
      display: block;
      height: 1.7em;
      overflow-y: hidden;
    }
  }
}

</style>
