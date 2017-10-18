<script>
import * as _ from 'lodash';
import * as DisplayUtil from '../utils/display';
import * as DataUtil from '../utils/data';
import EntitySummary from './entity-summary';
import LensMixin from './mixins/lens-mixin';
import ReverseRelations from '../components/reverse-relations';
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
      showCompact: false,
    };
  },
  methods: {
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
      window.addEventListener('scroll', this.handleScroll);
    });
  },
  components: {
    'entity-summary': EntitySummary,
    'reverse-relations': ReverseRelations,
  },
};
</script>

<template>
  <div class="header-component-container">
    <div class="header-component full">
      <entity-summary :focus-data="focusData" :add-link="false" :lines="full ? 6 : 3"></entity-summary>
    </div>
    <reverse-relations v-if="!status.isNew"></reverse-relations>
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
}

</style>
