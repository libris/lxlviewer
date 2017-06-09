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
    <a class="header" :class="{'blue-link': settings.siteInfo.title === 'id.kb.se'}" title="{{ header.join(', ') }}" :href="focusData['@id']">{{ header.join(', ') }}</a>
    <span class="categorization">
      {{categorization.join(', ')}}
    </span>
  </div>
</template>


<style lang="less">
@import './_variables.less';

.result-item-compact {
  margin-bottom: 0;
  margin-top: -1px;
  background-color: @white;
  border: 1px solid #ccc;
  padding: 0.4em 1em;
  line-height: 1.2em;
  .header {
    margin: 0px;
    display: inline-block;
    width: 70%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 16px;
    font-weight: normal;
  }
  .categorization {
    float: right;
    display: inline-block;
    width: 28%;
    font-size: 14px;
    text-align: right;
  }
}

</style>
