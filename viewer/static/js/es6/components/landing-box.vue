<script>
import { getSettings, getStatus } from '../vuex/getters';
import { changeStatus } from '../vuex/actions';
import * as httpUtil from '../utils/http';
import * as DataUtil from '../utils/data';
import * as LayoutUtil from '../utils/layout';
import * as StringUtil from '../utils/string';
import * as _ from 'lodash';

export default {
  name: 'landing-box',
  vuex: {
    getters: {
      settings: getSettings,
    },
    actions: {
      changeStatus,
    },
  },
  props: [
    'title',
    'text',
  ],
  data() {
    return {
      releases: [],
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
        this.releases = this.verifyFeed(json);
      });
    },
    verifyFeed(json) {
      const releases = [];
      const envVersion = this.settings.siteInfo.version.split('-')[0];
      const envVersionSemverParts = envVersion.split('.');

      _.each(json.entry, (release) => {
        const releaseSemverParts = release.title.split('.');
        let isValid = true;
        if (releaseSemverParts.length > 3) {
          isValid = false;
        }
        for (let i = 0; i < releaseSemverParts.length; i++) {
          if (!StringUtil.isNumeric(releaseSemverParts[i])) {
            isValid = false;
            break;
          }
        }
        if (isValid) {
          release.implemented = false;
          const envPar = envVersionSemverParts.join('.');
          if (releaseSemverParts[0] < envVersionSemverParts[0]) {
            release.implemented = true;
          } else if (releaseSemverParts[0] === envVersionSemverParts[0]) {
            if (releaseSemverParts[1] < envVersionSemverParts[1]) {
              release.implemented = true;
            } else if (releaseSemverParts[1] === envVersionSemverParts[1]) {
              if (releaseSemverParts[2] <= envVersionSemverParts[2]) {
                release.implemented = true;
              }
            }
          }
        }
        if (isValid && release.implemented) {
          releases.push(release);
        }
      });
      return releases;
    },
    openReleaseInfo() {
      this.showReleaseInfo = true;
      LayoutUtil.scrollLock(true);
      this.changeStatus('keybindState', 'release-notes');
    },
    closeReleaseInfo() {
      this.showReleaseInfo = false;
      LayoutUtil.scrollLock(false);
      this.changeStatus('keybindState', 'overview');
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
  events: {
    'close-modals'() {
      this.closeReleaseInfo();
    },
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
    <div class="release-info" v-show="releases">
      <div class="release-header">
        <b>Version {{latestVersion.title}}</b>
        <a v-on:click="openReleaseInfo()">(visa versionsinfo)</a>
      </div>
      <div class="release-info-window window" v-if="showReleaseInfo">
        <div class="header">
          <span class="title">
            {{ "Release notes" | translatePhrase }}
          </span>
          <span class="windowControl">
            <i v-on:click="closeReleaseInfo" class="fa fa-close"></i>
          </span>
        </div>
        <div class="body">
          <div class="release-info-node" v-for="release in releases">
            <h4>{{release.title}}</h4>
            <div v-html="release.content"></div>
          </div>
          <div class="show-more">
            <a href="https://github.com/libris/lxlviewer/releases" v-if="showReleaseInfo" target="_blank">Visa fler versioner</a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="less">
@import './_variables.less';

.landing-box {
  .release-info {
    .release-header {
      margin-bottom: 0.5em;
      a {
        font-size: 85%;
        cursor: pointer;
      }
    }
    .release-info-window {
      .window-mixin();
      height: 50%;
      min-height: 600px;
      .body {
        overflow-y: scroll;
        .show-more {
          padding: 1em;
        }
        .release-info-node {
          padding: 1em;
          border: solid #ccc;
          border-width: 0px 0px 1px 0px;
          h4 {
            display: inline-block;
            margin-top: 0;
          }
        }
      }
    }
  }
}

</style>
