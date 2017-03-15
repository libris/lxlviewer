<script>
import LensMixin from './mixins/lens-mixin';
import EntitySummary from './entity-summary';
import { getSettings, getVocabulary, getDisplayDefinitions, getEditorData } from '../vuex/getters';

export default {
  name: 'result-list-item',
  mixins: [LensMixin],
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
  <div class="result-list-item">
    <entity-summary :focus-data="focusData" :render-link="true"></entity-summary>
  </div>
</template>


<style lang="less">
@import './_variables.less';

.result-list-item {
  list-style: none;
  margin-bottom: 0.5em;
  background-color: @neutral-color;
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
