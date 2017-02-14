<script>
import LensMixin from './mixins/lens-mixin';
import { getSettings, getVocabulary, getDisplayDefinitions, getEditorData } from '../vuex/getters';

export default {
  name: 'entity-search-item',
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
  },
  watch: {
  },
  ready() { // Ready method is deprecated in 2.0, switch to "mounted"
  },
};
</script>

<template>
  <div class="search-result-item">
    <span class="label">{{ getItemLabel }}</span>
    <span class="type">{{ focusData['@type'] | labelByLang }}</span>
  </div>
</template>


<style lang="less">
@import './_variables.less';

.search-result-item {
  padding: 3px;
  .label {
    font-weight: bold;
    font-size: 16px;
    display: inline-block;
    width: 74%;
    text-align: left;
  }
  .type {
    width: 24%;
    display: inline-block;
    text-align: right;
  }
}

</style>
