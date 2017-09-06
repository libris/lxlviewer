<script>
import * as _ from 'lodash';
import * as DisplayUtil from '../utils/display';
import * as VocabUtil from '../utils/vocab';
import * as DataUtil from '../utils/data';
import * as HttpUtil from '../utils/http';
import EntitySummary from './entity-summary';
import CreateItemButton from '../components/create-item-button';
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
      hasHolding: false,
      checkingHolding: false,
      holdingId: '',
    };
  },
  methods: {
    isSubClassOf(type) {
      const baseClasses = VocabUtil.getBaseClasses(this.editorData.mainEntity['@type'], this.vocab, this.settings.vocabPfx)
        .map(id => id.replace(this.settings.vocabPfx, ''));
      return baseClasses.indexOf(type) > -1;
    },
    getHoldingInfo() {
      this.checkingHolding = true;
      const holdingCheckUrl = `/_findhold?library=${this.libraryUrl}&id=${this.editorData.record['@id']}`
      HttpUtil.get({ url: holdingCheckUrl, accept: 'application/ld+json' }).then((response) => {
        this.checkingHolding = false;
        if (response.length > 0) {
          this.hasHolding = true;
          this.holdingId = response;
        } else {
          this.hasHolding = false;
        }
      }, (error) => {
        console.log('Error checking for holding');
      });
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
    isNew() {
      if (this.editorData.record['@id'] === '_:TEMP_ID') {
        return true;
      }
      return false;
    },
    focusData() {
      return this.editorData[this.status.level];
    },
    libraryUrl() {
      return `https://libris.kb.se/library/${this.settings.userSettings.currentSigel}`;
    }
  },
  ready() { // Ready method is deprecated in 2.0, switch to "mounted"
    if (this.isNew === false) {
      this.getHoldingInfo();
    }
  },
  components: {
    'entity-summary': EntitySummary,
    'create-item-button': CreateItemButton,
  },
};
</script>

<template>
  <div class="header-component-container">
    <div class="header-component" v-bind:class="{ 'compact': !full, 'full': full }">
      <entity-summary :focus-data="focusData" :add-link="false" :lines="full ? 6 : 3"></entity-summary>
    </div>
    <div class="create-item-container" v-if="!isNew && isSubClassOf('Instance')">
      <div>
        <span v-if="!hasHolding && !checkingHolding">{{'Missing holding for sigel' | translatePhrase}}</span>
        <span v-if="hasHolding && !checkingHolding">{{'Has holding for sigel' | translatePhrase}}</span>
        <span v-if="!checkingHolding"> {{settings.userSettings.currentSigel}}</span>
      </div>
      <create-item-button :disabled="status.inEdit" :has-holding="hasHolding" :checking-holding="checkingHolding" :holding-id="holdingId"></create-item-button>
    </div>
  </div>
</template>

<style lang="less">
@import './_variables.less';
.header-component-container {
  display: flex;
  background-color: @neutral-color;
  padding: 0px;
  margin-bottom: 2em;
  outline: solid #ccc;
  outline-width: 1px;
  .header-component {
    flex: 8 8 80%;
    border-right: 1px solid #ccc;
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
  .create-item-container {
    flex: 2 2 20%;
    display: flex;
    padding: 1em;
    text-align: center;
    flex-direction: column;
    justify-content: space-evenly;
    align-items: center;
  }
}

</style>
