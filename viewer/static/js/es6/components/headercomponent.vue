<script>
import * as _ from 'lodash';
import * as DisplayUtil from '../utils/display';
import * as VocabUtil from '../utils/vocab';
import * as EditUtil from '../utils/edit';
import LensMixin from './mixins/lens-mixin';
import { getSettings, getVocabulary, getDisplayDefinitions, getEditorData, getStatus } from '../vuex/getters';

export default {
  name: 'header-component',
  mixins: [LensMixin],
  vuex: {
    getters: {
      vocab: getVocabulary,
      settings: getSettings,
      editorData: getEditorData,
      display: getDisplayDefinitions,
      status: getStatus,
    },
  },
  props: {
    full: false,
  },
  data() {
    return {
      showChipHeader: false,
      inlineKeys: [
        '@type',
        'issuanceType',
        'extent',
        'dimensions',
        'marc:otherPhysicalDetails',
      ],
    };
  },
  ready() { // Ready method is deprecated in 2.0, switch to "mounted"
    this.$nextTick(() => {
      window.addEventListener('scroll', (e) => {
        const cardHeader = document.getElementById('card-header');
        const chipHeaderThreshold = cardHeader.offsetTop + (cardHeader.offsetHeight / 2);
        const scrollPosition = e.target.body.scrollTop;
        if (chipHeaderThreshold < scrollPosition) {
          this.showChipHeader = true;
        } else {
          this.showChipHeader = false;
        }
      });
      const expandableAdminInfo = document.getElementsByClassName('admin-info-container')[0];
      expandableAdminInfo.onresize = this.resize;
    });
  },
  methods: {
    isTitle(key) {
      const k = key.toLowerCase();
      return ~k.indexOf('title');
    },
    showKey(k) {
      const listOfKeys = ['ISBN']; // TODO: Fix list of keys to show.
      return _.indexOf(listOfKeys, k) > -1;
    },
  },
  computed: {
    state() {
      const state = this.status.level;
      if (state === 'it') {
        return 'Instance';
      } else if (state === 'work') {
        return 'Work';
      }
      return 'Unknown';
    },
    focusData() {
      return this.editorData[this.status.level];
    },
  },
  components: {
  },
};
</script>

<template>
  <div class="header-component">
    <div v-if="full" class="main-header" id="card-header">
      <ul>
        <li v-for="(k, v) in getCard" v-bind:class="{'large-title': isTitle(k), 'inline': (inlineKeys.indexOf(k) !== -1) }">{{v}}</li>
      </ul>
    </div>
    <div v-if="full == false && showChipHeader" class="container fixed-header-container">
      <div class="row">
        <div class="fixed-header">
          <span v-for="(k, v) in getCard">
            <span v-if="isTitle(k)">
              <span class="small-title">{{v}}</span>
            </span>
            <span v-if="!isTitle(k)" class="minimum-text">
              <span v-if="showKey(k)">{{k}}: {{v}}</span>
              <span v-if="!showKey(k)">{{v}}</span>
            </span>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="less">
@import './_variables.less';

.header-component {
  padding: 0px;

  .container {
    .row {
      margin: 0px;
    }
    .fixed-header {
      text-align: center;
      padding: 5px;
      width: inherit;
      background-color: white;
      color: black;
      box-shadow: 0px 6px 10px -6px rgba(0, 0, 0, 0.6);
    }
  }

  .main-header {
    ul {
      padding: 20px;
      .inline {
        display: inline;
        &::after {
          content: ", ";
        }
      }
    }
  }

  ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }


  .large-title {
    font-size: 20px;
    font-weight: bold;
  }

  .work-title {
    font-size: 22px;
    border-bottom: 1px solid white;
  }

  .small-title {
    font-size: 16px;
    font-weight: bold;
  }

  .medium-text {
    font-size: 14px;
  }

  .small-text {
    font-size: 12px;
  }

  .minimum-text {
    font-size: 10px;
    font-style: italic;
  }
}

</style>
