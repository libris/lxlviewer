<script>
import { getVocabulary, getSettings, getEditorData } from '../vuex/getters';

export default {
  name: 'header-component',
  vuex: {
    getters: {
      vocab: getVocabulary,
      settings: getSettings,
      editorData: getEditorData,
    }
  },
  props: {
  },
  data: function() {
    return {
    }
  },
  computed: {
  },
  methods: {
  },
  components: {
  },
};
</script>

<template>
  <div class="header-component">
    <h1>Header</h1>
  </div>
</template>

<style lang="less">

.header-component {
  padding: 20px;
}

</style>
