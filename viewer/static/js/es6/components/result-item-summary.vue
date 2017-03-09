<script>
import LensMixin from './mixins/lens-mixin';
import { getSettings, getVocabulary, getDisplayDefinitions, getEditorData } from '../vuex/getters';

export default {
  mixins: [LensMixin],
  name: 'result-item-summary',
  props: {
    focusData: {},
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
    isTitle(key) {
      const k = key.toLowerCase();
      return ~k.indexOf('title') || ~k.indexOf('preflabel');
    },
    showKey(k) {
      const listOfKeys = ['ISBN']; // TODO: Fix list of keys to show.
      return _.indexOf(listOfKeys, k) > -1;
    },
    isInline(k) {
      return (this.settings.inlineKeys.indexOf(k) !== -1);
    },
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
<div class="result-item-summary">
  <div class="main-info">
    <h3 class="header"><a :href="focusData['@id']">{{ getSummary.header.join(', ') }}</a></h3>
    <ul class="info">
      <li v-for="v in getSummary.info">{{ v }}</li>
    </ul>
  </div>
  <div class="identifiers">
    <ul>
      <li v-for="v in getSummary.identifiers">{{v}}</li>
    </ul>
  </div>
  <div class="sub">
    <span>{{ getSummary.sub.join(', ') }}</span>
  </div>
</div>
</template>

<style lang="less">
@import './_variables.less';
.result-item-summary {
  width: 100%;
  border: 1px solid #ccc;
  font-size: 14px;
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  > * {
    padding: 5px;
  }
  &:hover {
      background-color: darken(white, 2%);
  }
  .main-info {
    flex-basis: 80%;
    max-width: 80%;
    .header {
      color: @brand-primary;
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
    flex-basis: 20%;
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
  }
}

</style>
