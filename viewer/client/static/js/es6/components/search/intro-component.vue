<script>

import { getSettings, getVocabulary, getVocabularyClasses, getDisplayDefinitions, getEditorData, getStatus, getChangeHistory } from '../../vuex/getters';

export default {
  name: 'intro-component',
  vuex: {
    getters: {
      settings: getSettings,
    },
    actions: {
    },
  },
  props: [
    "videoUrl",
    "linkUrl",
    "linkText",
    "header",
    "text",
  ],
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
    this.$nextTick(() => {
      // Do stuff
    });
  },
};
</script>

<template>
  <div class="panel panel-default LinkCard LinkCard--large">
    <div class="LinkCard-videoWrap">
      <div class="LinkCard-video Video">
        <iframe :src="videoUrl" frameborder="0" allowfullscreen></iframe>
      </div>
    </div>
     <div class="LinkCard-content">
      <div class="LinkCard-text">
        <span class="LinkCard-title">{{ header }}</span>
        <div class="LinkCard-descr">{{ text }}</div>
      </div>
      <a v-if="linkUrl" :href="linkUrl" class="card-link LinkCard-link">{{ linkText }}</a>
    </div>
  </div>
</template>

<style lang="less">
  @import '../shared/_variables.less';
  @import '../../../../less/components/_linkcard.less';
  @import '../../../../less/components/_video.less';
</style>
