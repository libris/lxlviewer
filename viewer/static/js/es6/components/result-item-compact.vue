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
    categorization() {
      return this.getFormattedEntries(this.getSummary.categorization);
    },
    header() {
      return this.getFormattedEntries(this.getSummary.header);
    },
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
    <h3 class="header">
      <a :class="{'blue-link': settings.siteInfo.title === 'id.kb.se'}" title="{{ header.join(', ') }}" :href="focusData['@id']">{{ header.join(', ') }}</a>
    </h3>
    <div class="categorization">
      {{categorization.join(', ')}}
    </div>
  </div>
</template>


<style lang="less">
@import './_variables.less';

.result-item-compact {
  margin-bottom: 0;
  background-color: @white;
  border: 1px solid #ccc;
  padding: 0.2em;
  .header {
    margin: 0px;
    display: inline-block;
    width: 70%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 16px;
  }
  .categorization {
    display: inline-block;
    width: 28%;
    font-size: 14px;
    text-align: right;
  }
}

</style>
