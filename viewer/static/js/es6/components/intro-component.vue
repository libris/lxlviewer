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
  <div class="panel panel-default intro-component">
    <div class="libris-intro-video-container">
      <div class="libris-intro-video">
        <iframe :src="videoUrl" frameborder="0" allowfullscreen></iframe>
      </div>
    </div>
    <div class="libris-intro-text">
      <div class="content">
        <span class="header">{{ header }}</span>
        <p>{{ text }}</p>
      </div>
      <a v-if="linkUrl" :href="linkUrl" class="card-link">{{ linkText }}</a>
    </div>
  </div>
</template>

<style lang="less">
@import './_variables.less';

.intro-component {
  display: flex;
  justify-content: space-between;
  .libris-intro-video-container {
    flex-basis: 45%;
    padding-bottom: 1px;
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
  .libris-intro-text {
    padding: 1em;
    flex-basis: 45%;
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    .header {
      font-size: 1.1em;
      font-weight: bold;
    }
    a {
      text-align: center;
    }
  }

}

</style>
