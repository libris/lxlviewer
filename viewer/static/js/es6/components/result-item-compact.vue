<script>
import LensMixin from './mixins/lens-mixin';
import EntitySummary from './entity-summary';
import { getSettings, getVocabulary, getDisplayDefinitions, getEditorData } from '../vuex/getters';

export default {
  name: 'result-item-compact',
  mixins: [LensMixin],
  props: {
    focusData: {},
    compact: false,
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
    'entity-summary': EntitySummary,
  },
  watch: {
  },
  ready() { // Ready method is deprecated in 2.0, switch to "mounted"
  },
};
</script>

<template>
  <div class="result-item-compact">
    <entity-summary :focus-data="focusData" :render-link="true"></entity-summary>
  </div>
</template>


<style lang="less">
@import './_variables.less';

.result-item-compact {
  margin-bottom: 0;
  border: 1px solid #ccc;
  .entity-summary {
    border: 0;
    .identifiers, .info, .sub {
      display: none;
    }
    list-style: none;
    .main-info {
      flex-basis: 100%;
      max-width: 100%;
      .header {
        font-size: 1em;
        display: inline-block;
        width: 68%;
        float: left;
      }
      .categorization {
        display: inline-block;
        width: 30%;
        text-align: right;
      }
    }
  }
}

</style>
