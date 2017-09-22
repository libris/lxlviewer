<script>
import { getSettings } from '../vuex/getters';
import * as httpUtil from '../utils/http';
import * as DataUtil from '../utils/data';

export default {
  name: 'landing-box',
  vuex: {
    getters: {
      settings: getSettings,
    },
  },
  props: [
    'title',
    'text',
  ],
  data() {
    return {
      releaseFeed: '',
      showReleaseInfo: false,
    }
  },
  methods: {
    getFeed() {
      return new Promise((resolve, reject) => {
        httpUtil.get({ url: '/releasefeed', accept: 'application/xml' }).then((result) => {
          resolve(result);
        }, (error) => {
          reject(error);
        });
      })
    },
    fetchFeed() {
      this.getFeed().then((feed) => {
        const xml = new DOMParser().parseFromString(feed, 'text/xml');
        const json = DataUtil.xmlToJson(xml).feed;
        this.releaseFeed = json;
      });
    },
    expandReleaseInfo() {
      this.showReleaseInfo = true;
    },
    collapseReleaseInfo() {
      this.showReleaseInfo = false;
    },
  },
  computed: {
    serviceName() {
      return this.title === 'libris.kb.se' ? 'Libris katalogiseringstjänst' : 'id.kb.se';
    },
    latestVersion() {
      if (this.releaseFeed) {
        return this.releaseFeed.entry[0];
      }
      return '';
    },
  },
  components: {
  },
  watch: {
    keyword(value, oldval) {
      console.log("keyword changed", value, oldval);
    },
  },
  ready() { // Ready method is deprecated in 2.0, switch to "mounted"
    this.$nextTick(() => {
      // Do stuff
      this.fetchFeed();
    });
  },
};
</script>

<template>
  <div class="landing-box" :class="{'libris-color': settings.siteInfo.title === 'libris.kb.se', 'id-color': settings.siteInfo.title === 'id.kb.se'}">
    <p v-html="text">
    </p>
    <hr>
    <div class="release-info" v-show="releaseFeed">
      <div class="release-header">
        <b>Version {{latestVersion.title}}</b>
        <a v-if="!showReleaseInfo" v-on:click="expandReleaseInfo()">(visa versionsinfo)</a>
        <a v-if="showReleaseInfo" v-on:click="collapseReleaseInfo()">(dölj versionsinfo)</a>
      </div>
      <div class="release-content" v-if="showReleaseInfo" v-html="latestVersion.content">
      </div>
      <a href="https://github.com/libris/lxlviewer/releases" v-if="showReleaseInfo" target="_blank">Visa fler versioner</a>
    </div>
  </div>
</template>

<style lang="less">
@import './_variables.less';

.landing-box {
  .release-info {
    .release-header {
      margin-bottom: 0.5em;
    }
    .release-content {
      font-size: 85%;
      ul {
        padding-left: 2em;
      }
    }
    a {
      font-size: 85%;
      cursor: pointer;
    }
  }
}

</style>
