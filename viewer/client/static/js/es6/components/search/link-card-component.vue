<script>

import { getSettings, getVocabulary, getVocabularyClasses, getDisplayDefinitions, getEditorData, getStatus, getChangeHistory } from '../../vuex/getters';

export default {
  name: 'link-card',
  vuex: {
    getters: {
      settings: getSettings,
    },
    actions: {
    },
  },
  props: [
    "image",
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
    getImage() {
      if (Modernizr.webp) {
        return this.image.replace('.png', '.webp');
      }
      return this.image;
    },
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
  <div class="panel panel-default LinkCard" v-bind:class="{'no-link': !linkUrl}">
    <img :src="getImage" class="LinkCard-img"/>
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
</style>
