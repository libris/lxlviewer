<script>
import LensMixin from './mixins/lens-mixin';
import ResultMixin from './mixins/result-mixin';
import EntitySummary from './entity-summary';
import { getSettings, getVocabulary, getDisplayDefinitions, getEditorData } from '../vuex/getters';

export default {
  name: 'result-item-detailed',
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
  <div class="result-item-detailed">
    <entity-summary :focus-data="focusData" :is-import="isImport" :import-item="importItem" :add-link="true" :lines="4"></entity-summary>
  </div>
</template>


<style lang="less">
@import './_variables.less';

.result-item-detailed {
  list-style: none;
  margin-bottom: 0.5em;
  background-color: @neutral-color;
  border: solid 0px #ccc;
  border-width: 0px 0px 2px 0px;
  .label {
    color: @black;
    font-weight: bold;
    font-size: 16px;
    display: inline-block;
    width: 74%;
    text-align: left;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .type {
    width: 24%;
    display: inline-block;
    text-align: right;
  }
}

</style>
