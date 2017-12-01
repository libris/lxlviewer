<script>
import LensMixin from './mixins/lens-mixin';
import ResultMixin from './mixins/result-mixin';
import EntitySummary from './entity-summary';
import * as StringUtil from '../utils/string';
import { getSettings, getVocabulary, getDisplayDefinitions, getEditorData } from '../vuex/getters';

export default {
  name: 'result-item-compact',
  mixins: [LensMixin, ResultMixin],
  props: {
    focusData: {},
    importItem: {},
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
      return StringUtil.getFormattedEntries(this.getSummary.categorization, this.vocab, this.settings, this.context);
    },
    header() {
      return StringUtil.getFormattedEntries(this.getSummary.header, this.vocab, this.settings, this.context);
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
    <span class="import-header header" title="{{ header.join(', ') }}" v-on:click="importThis()" v-if="isImport">{{ header.join(', ') }}</span>
    <a v-if="!isImport" class="header" :class="{'blue-link': settings.siteInfo.title === 'id.kb.se'}" title="{{ header.join(', ') }}" :href="focusData['@id']">{{ header.join(', ') }}</a>
    <span class="categorization" title="{{categorization.join(', ')}}">
      {{categorization.join(', ')}}
    </span>
  </div>
</template>


<style lang="less">
@import './_variables.less';

.result-item-compact {
  display: flex;
  margin-bottom: 0;
  margin-top: -1px;
  background-color: @white;
  border: 1px solid #ccc;
  padding: 0.4em 1em;
  line-height: 1.2em;
  .header {
    margin: 0px;
    display: inline-block;
    flex-basis: 50%;
    flex-grow: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 16px;
    font-weight: normal;
  }
  .categorization {
    display: inline-block;
    flex-basis: 30%;
    font-size: 14px;
    text-align: right;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

</style>
