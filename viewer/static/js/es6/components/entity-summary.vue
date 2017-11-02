<script>
import SummaryActionButton from './summary-action-button';
import LensMixin from './mixins/lens-mixin';
import * as StringUtil from '../utils/string';
import { getSettings, getVocabulary, getContext, getDisplayDefinitions, getEditorData } from '../vuex/getters';

export default {
  mixins: [LensMixin],
  name: 'entity-summary',
  props: {
    focusData: {},
    addLink: false,
    lines: Number,
    actions: false,
    isLocal: false,
    isExtractable: false,
    importItem: '',
    isImport: false,
    actionSettings: {},
  },
  vuex: {
    getters: {
      context: getContext,
      vocab: getVocabulary,
      display: getDisplayDefinitions,
      settings: getSettings,
      editorData: getEditorData,
    },
  },
  data() {
    return {
      defaultSettings: {
        show: false,
        styling: 'gray',
        text: '',
        payload: {},
        event: '',
      },
    }
  },
  computed: {
    renderLink() {
      if (this.addLink === true && !this.isLocal) {
        return true;
      }
      return false;
    },
    categorization() {
      return StringUtil.getFormattedEntries(this.getSummary.categorization, this.vocab, this.settings);
    },
    header() {
      return StringUtil.getFormattedEntries(this.getSummary.header, this.vocab, this.settings);
    },
    identifiers() {
      let identifiersList = StringUtil.getFormattedEntries(this.getSummary.identifiers, this.vocab, this.settings);
      if (identifiersList.length > this.lines) {
        const diff = identifiersList.length - this.lines;
        identifiersList.splice((this.lines - 1), diff+1);
        identifiersList.push(`+ ${diff+1} identifierare`);
      }
      return identifiersList;
    },
    info() {
      return StringUtil.getFormattedEntries(this.getSummary.info, this.vocab, this.settings);
    },
    sub() {
      return StringUtil.getFormattedEntries(this.getSummary.sub, this.vocab, this.settings);
    },
  },
  methods: {
    importThis() {
      this.$dispatch('import-this');
    },
    removeEntity() {
      this.$dispatch('remove-entity');
    },
    extractEntity() {
      this.$dispatch('extract-item');
    },
  },
  components: {
    'summary-action-button': SummaryActionButton,
  },
  watch: {
  },
  ready() { // Ready method is deprecated in 2.0, switch to "mounted"
  },
};
</script>

<template>
<div class="entity-summary">
  <div class="main-info">
    <div class="categorization">
      {{categorization.join(', ')}} {{ isLocal ? '{lokal entitet}' : '' }}
    </div>
    <h3 class="header">
      <span class="import-header" title="{{ header.join(', ') }}" v-on:click="importThis()" v-if="isImport">{{ header.join(', ') }}</span>
      <a v-if="!isImport && renderLink" :class="{'blue-link': settings.siteInfo.title === 'id.kb.se'}" title="{{ header.join(', ') }}" :href="focusData['@id']">{{ header.join(', ') }}</a>
      <span v-if="!isImport && !renderLink" title="{{ header.join(', ') }}">{{ header.join(', ') }}</span>
    </h3>
    <div class="info">
      {{ info.join(', ') }}
    </div>
    <!-- <ul class="info">
      <li v-for="v in info" track-by="$index">{{ v }}</li>
    </ul> -->
  </div>
  <div class="identifiers">
    <summary-action-button :settings="actionSettings || defaultSettings"></summary-action-button>
    <ul>
      <li v-for="v in identifiers" track-by="$index">{{v}}</li>
    </ul>
  </div>
  <div class="sub">
    <div class="other">{{ sub.join(' · ') }}</div>
    <code class="id">{{focusData['@id']}}</code>
  </div>
</div>
</template>

<style lang="less">
@import './_variables.less';
.entity-summary {
  font-size: 12px;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  .actions {
    flex-basis: 3em;
    text-align: center;
  }
  .main-info {
    .categorization {
      color: #8a8a8a;
      flex-basis: 85%;
      padding: 3px 3px 0px 0px;
      flex-grow: 2;
      display: block;
      font-weight: bold;
      margin-bottom: -0.4em;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    height: 7.5em;
    max-width: 70%;
    padding: 3px 0px 0px 9px;
    a {
      color: @brand-primary;
      &.blue-link {
        color: @brand-id;
      }
    }
    .header {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      width: 100%;
      font-size: 1.6em;
      line-height: 1.6em;
      min-height: 1.2em;
      margin: 0px;
    }
    ul.info {
      list-style-type: none;
      padding: 0px;
    }
  }
  .identifiers {
    text-align: right;
    padding: 5px 8px 0px 0px;
    font-weight: bold;
    max-width: 30%;
    ul {
      list-style-type: none;
      padding: 0px;
    }
  }
  .sub {
    flex-basis: 100%;
    display: flex;
    background-color: rgba(0, 0, 0, 0.01);
    border: solid rgba(0, 0, 0, 0.1);
    border-width: 1px 0px 0px 0px;
    > .other {
      flex: 1;
      height: 1.7em;
      overflow-y: hidden;
      padding: 0px 9px;
    }
    > .id {
      border-radius: 0px;
      border: solid rgba(0, 0, 0, 0.1);
      border-width: 0px 0px 0px 1px;
      background: transparent;
    }
  }
}

</style>
