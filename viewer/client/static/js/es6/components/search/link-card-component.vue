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
  <div class="panel panel-default link-card LinkCard" v-bind:class="{'no-link': !linkUrl}">
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
.LinkCard {
  flex-basis: 24%; // To parent
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0;

  &-img {
    width: 100%;
  }

  &-videoWrap {
    flex-basis: 45%;
    padding-bottom: 1px;
  }

  &-video {
    position: relative;
    padding-bottom: 56.25%; /* 16:9 */
    padding-top: 25px;
    height: 0;
  
    &-iframe,
    & iframe,
    & embed {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }
  }

  &-content {
    display: flex;
    align-items: center;
    flex-direction: column;
    justify-content: space-between;
    padding: 0.5em 1em 0em 1em;
    flex-grow: 1;
    width: 100%;

    .LinkCard--large & {
    padding: 1em;
    flex-basis: 45%;
    }
  }

  &-text {
    width: 100%;
  }

  &-title {
    font-size: 18px;
    font-size: 1.8rem;
    font-weight: 700;
    display: block;
  }

  &-descr {
    font-size: 14px;
    font-size: 1.4rem;
  }

  &-link {
  }

  &.no-link {
    padding-bottom: 1em;
  }

  &--large {
    display: flex;
    justify-content: space-between;
    flex-direction: unset;
    align-items: inherit;
  }
}
</style>
