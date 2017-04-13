<script>
import * as _ from 'lodash';
import * as DisplayUtil from '../utils/display';
import * as VocabUtil from '../utils/vocab';
import * as DataUtil from '../utils/data';
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
      inlineKeys: [
        '@type',
        'issuanceType',
        'extent',
        'dimensions',
        'marc:otherPhysicalDetails',
      ],
    };
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
      if (state === 'mainEntity') {
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
  <div class="header-component" v-bind:class="{ 'compact': !full, 'full': full }">
    <entity-summary :focus-data="focusData" :render-link="false" :lines="full ? 6 : 3"></entity-summary>
  </div>
</template>

<style lang="less">
@import './_variables.less';

.header-component {
  background-color: @neutral-color;
  padding: 0px;
  &.full {
    .entity-summary {
      border-width: 0px 0px 1px 0px;
    }
  }
  &.compact {
    max-height: 74px;
    overflow-y: hidden;
    border: solid rgb(204, 204, 204);
    border-width: 0px 0px 1px 0px;
    box-shadow: 0px 5px 10px -5px rgba(0, 0, 0, 0.26);
    &.collapsed {
      max-height: 0px;
    }
    .entity-summary {
      border-width: 0px 1px 0px 0px;
      .main-info {
        .header {
          line-height: 1.2;
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
