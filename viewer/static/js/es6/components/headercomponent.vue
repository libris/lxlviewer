<script>
import * as _ from 'lodash';
import * as DisplayUtil from '../utils/display';
import * as VocabUtil from '../utils/vocab';
import * as EditUtil from '../utils/edit';
import EntitySummary from './entity-summary';
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
    isInline(k) {
      return (this.settings.inlineKeys.indexOf(k) !== -1);
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
    'entity-summary': EntitySummary,
  },
};
</script>

<template>
  <div class="header-component" v-bind:class="{ 'compact': !full }">
    <entity-summary :focus-data="focusData"></entity-summary>
  </div>
</template>

<style lang="less">
@import './_variables.less';

.header-component {
  padding: 0px;
  &.compact {
    .thing-summary {
      .main-info {
        .header {
          //
        }
        .info {
          > li {
            display: inline-block;
            &:first-child {
              margin-right: 0.3em;
            }
            &:not(:first-child):before {
              content: "| ";
            }
          }
        }
      }
      .identifiers {
        //
      }
      .sub {
        display: none;
      }
    }
  }

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

}

</style>
