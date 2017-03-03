<script>
import LensMixin from './mixins/lens-mixin';
import { getSettings, getVocabulary, getDisplayDefinitions, getEditorData } from '../vuex/getters';

export default {
  mixins: [LensMixin],
  name: 'entity-summary',
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
<div class="thing-summary">
  <div class="main-info">
    <h3 class="header">{{ getSummary.header.join(', ') }}</h3>
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


</style>
