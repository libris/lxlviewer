<script>
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
      return StringUtil.getFormattedEntries(this.getSummary.categorization, this.vocab, this.settings, this.context);
    },
    header() {
      return StringUtil.getFormattedEntries(this.getSummary.header, this.vocab, this.settings, this.context);
    },
    identifiers() {
      let identifiersList = StringUtil.getFormattedEntries(this.getSummary.identifiers, this.vocab, this.settings, this.context);
      if (identifiersList.length > this.lines) {
        const diff = identifiersList.length - this.lines;
        identifiersList.splice((this.lines - 1), diff+1);
        identifiersList.push(`+ ${diff+1} identifierare`);
      }
      return identifiersList;
    },
    info() {
      return StringUtil.getFormattedEntries(this.getSummary.info, this.vocab, this.settings, this.context);
    },
    sub() {
      let allThings = StringUtil.getFormattedEntries(this.getSummary.info, this.vocab, this.settings, this.context);
      allThings = allThings.concat(StringUtil.getFormattedEntries(this.getSummary.sub, this.vocab, this.settings, this.context));
      return allThings;
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
  },
  watch: {
  },
  ready() { // Ready method is deprecated in 2.0, switch to "mounted"
  },
};
</script>

<template>
<div class="entity-summary">
  <div class="sub">
    <div class="categorization">
      {{categorization.join(', ')}} {{ isLocal ? '{lokal entitet}' : '' }}
    </div>
  </div>
  <div class="main-info">
    <h3 class="header">
      <span class="import-header" title="{{ header.join(', ') }}" v-on:click="importThis()" v-if="isImport">{{ header.join(', ') }}</span>
      <a v-if="!isImport && renderLink" :class="{'blue-link': settings.siteInfo.title === 'id.kb.se'}" title="{{ header.join(', ') }}" :href="focusData['@id']">{{ header.join(', ') }}</a>
      <span v-if="!isImport && !renderLink" title="{{ header.join(', ') }}">{{ header.join(', ') }}</span>
    </h3>
    <div class="id" v-if="identifiers.length > 0">{{ identifiers[0] }} <span class="id-info" v-if="identifiers.length > 1">(+{{ identifiers.length-1 }})</span></div>
    <div class="info">
      {{ sub.join(' · ') }}
    </div>
  </div>
</div>
</template>

<style lang="less">
@import './_variables.less';
.entity-summary {
  width: 100%;
  font-size: 13px;
  padding: 0.5em 1em;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  .actions {
    flex-basis: 3em;
    text-align: center;
  }
  .main-info {
    height: 7.5em;
    overflow: hidden;
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
    .id {
      color: #333;
      font-weight: bold;
      margin-top: -0.3em;
      margin-bottom: 0.5em;
      .id-info {
        font-weight: normal;
      }
    }
    ul.info {
      list-style-type: none;
      padding: 0px;
    }
  }
  .sub {
    border-width: 0px;
    .categorization {
      color: #8a8a8a;
      flex-basis: 85%;
      flex-grow: 2;
      display: block;
      font-weight: bold;
      margin-bottom: -0.4em;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
}

</style>
