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
    <div v-if="settings.siteInfo.title == 'libris.kb.se'" class="libris-intro-video-container">
      <div class="libris-intro-video">
        <iframe src="https://www.youtube-nocookie.com/embed/n5NOBPmIEf8?rel=0&amp;showinfo=0&html5=1" frameborder="0" allowfullscreen></iframe>
      </div>
    </div>
    <div v-if="settings.siteInfo.title == 'libris.kb.se'" class="libris-intro-text">
      <span class="header">Text</span>
      <p>Lorizzle ipsum dolizzle nizzle amizzle, shiznit adipiscing elit. Nullam sapizzle velizzle, bow wow wow volutpizzle, suscipizzle check it out, mammasay mammasa mamma oo sa vel, arcu. Crunk eros. Pizzle izzle dolizzle bling bling turpis tempizzle.</p>
      <a class="btn btn-primary">Gå till...</a>
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
