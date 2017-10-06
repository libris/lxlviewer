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
      numberOfHoldings: '?',
      showCompact: false,
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
      const numberOfHoldingsUrl = `/_dependencies?id=${this.editorData.record['@id']}&relation=itemOf&reverse=true`;
      HttpUtil.get({ url: numberOfHoldingsUrl, accept: 'application/ld+json' }).then((response) => {
        this.numberOfHoldings = response.length;
      }, (error) => {
        console.log('Error checking for holding');
      });
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
    handleScroll(e) {
      e.target.scrollingElement.scrollTop > this.headerThreshold ? this.showCompact = true : this.showCompact = false;
    }
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
    libraryUrl() {
      return `https://libris.kb.se/library/${this.settings.userSettings.currentSigel}`;
    },
    headerThreshold() {
      const headerContainer = document.getElementById('main-header');
      return headerContainer.offsetTop + headerContainer.offsetHeight -20;
    },
    compactSummary() {
      let summary = [];
      _.each(this.getSummary, summaryArray => {
        summary = summary.concat(summaryArray.map(obj => obj.value.join(' | ')));
      });
      return summary.join(' | ');
    },
  },
  beforeDestroy() {
    window.removeEventListener('scroll', this.handleScroll);
  },
  ready() { // Ready method is deprecated in 2.0, switch to "mounted"
    this.$nextTick(() => {
      if (!this.status.isNew && this.isSubClassOf('Instance')) {
        this.getHoldingInfo();
      }
      window.addEventListener('scroll', this.handleScroll);
    });
  },
  components: {
    'entity-summary': EntitySummary,
    'create-item-button': CreateItemButton,
  },
};
</script>

<template>
  <div class="header-component-container">
    <div class="header-component full">
      <entity-summary :focus-data="focusData" :add-link="false" :lines="full ? 6 : 3"></entity-summary>
    </div>
    <div class="create-item-container" v-if="!status.isNew && isSubClassOf('Instance')">
      <div>
        <span v-if="!hasHolding && !checkingHolding">{{'Missing holding' | translatePhrase}}</span>
        <span v-if="hasHolding && !checkingHolding">{{'Has holding' | translatePhrase}}</span>
      </div>
      <create-item-button :disabled="status.inEdit" :has-holding="hasHolding" :checking-holding="checkingHolding" :holding-id="holdingId"></create-item-button>
      <div class="holdings-number">{{ "Number of holdings" | translatePhrase }}: {{numberOfHoldings}}</div>
    </div>
    <div class="container compact-header" :class="{ 'show-compact': showCompact }">
      {{ compactSummary }}
    </div>
  </div>
</template>

<style lang="less">
@import './_variables.less';
.header-component-container {
  display: flex;
  background-color: @bib-color;
  box-shadow: @shadow-base;
  padding: 0px;
  .header-component {
    flex: 8 8 100%;
    max-width: 100%;
    min-width: 0;
    &.full {
      .entity-summary {
        border-width: 0;
        height: 100%;
        * {
          color: @white;
        }
      }
    }
  }
  .compact-header {
    position: fixed;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    background: @bib-color;
    color: @white;
    padding: 0.5em;
    z-index: @header-z;
    top: 0;
    box-shadow: 0 2px 5px rgba(0,0,0,.26);
    max-height: 0px;
    opacity: 0;
    transition: all 0.3s ease;
    line-height: 0;
    &.show-compact {
      max-height: 55px;
      opacity: 1;
      line-height: inherit;
    }
  }
  .create-item-container {
    background-color: @white;
    flex: 2 2 20%;
    display: flex;
    padding: 1em;
    text-align: center;
    flex-direction: column;
    justify-content: space-evenly;
    align-items: center;
    .holdings-number {
      font-weight: bold;
    }
  }
}

</style>
