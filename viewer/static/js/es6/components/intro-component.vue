<script>

import { getSettings, getVocabulary, getVocabularyClasses, getDisplayDefinitions, getEditorData, getStatus, getChangeHistory } from '../vuex/getters';

export default {
  name: 'intro-component',
  vuex: {
    getters: {
      settings: getSettings,
    },
    actions: {
    },
  },
  props: {
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
    this.$nextTick(() => {
      // Do stuff
    });
  },
};
</script>

<template>
  <div class="panel panel-default intro-component">
    <div class="libris-intro-video">
      <iframe v-if="settings.siteInfo.title == 'libris.kb.se'" src="https://www.youtube-nocookie.com/embed/n5NOBPmIEf8?rel=0&amp;showinfo=0&html5=1" frameborder="0" allowfullscreen></iframe>
    </div>
  </div>
</template>

<style lang="less">
@import './_variables.less';

.intro-component {
  .libris-intro-video {
  	position: relative;
  	padding-bottom: 56.25%; /* 16:9 */
  	padding-top: 25px;
  	height: 0;
    iframe {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }
  }

}

</style>
