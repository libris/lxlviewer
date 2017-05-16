<script>
import LensMixin from './mixins/lens-mixin';
import * as StringUtil from '../utils/string';
import { getSettings, getVocabulary, getDisplayDefinitions, getEditorData } from '../vuex/getters';

export default {
  mixins: [LensMixin],
  name: 'entity-summary',
  props: {
    focusData: {},
    addLink: false,
    lines: Number,
    actions: false,
    isLocal: false,
  },
  vuex: {
    getters: {
      vocab: getVocabulary,
      display: getDisplayDefinitions,
      settings: getSettings,
      editorData: getEditorData,
    },
  },
  data() {
    return {
      keyword: '',
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
      return this.getFormattedEntries(this.getSummary.categorization);
    },
    header() {
      return this.getFormattedEntries(this.getSummary.header);
    },
    identifiers() {
      let identifiersList = this.getFormattedEntries(this.getSummary.identifiers);
      if (identifiersList.length > this.lines) {
        const diff = identifiersList.length - this.lines;
        identifiersList.splice((this.lines - 1), diff+1);
        identifiersList.push(`+ ${diff+1} identifierare`);
      }
      return identifiersList;
    },
    info() {
      return this.getFormattedEntries(this.getSummary.info);
    },
    sub() {
      return this.getFormattedEntries(this.getSummary.sub);
    },
  },
  methods: {
    removeEntity() {
      this.$dispatch('remove-entity');
    },
    extractEntity() {
      this.$dispatch('extract-item');
    },
    translateable(type) {
      if (type === '@type' || type === 'issuanceType') {
        return true;
      }
      return false;
    },
    getFormattedEntries(list) {
      let formatted = [];
      for (const entry of list) {
        if (this.translateable(entry.property)) {
          formatted = formatted.concat(entry.value.map((obj) => {
            return StringUtil.labelByLang(obj, this.settings.language, this.vocab, this.settings.vocabPfx);
          }));
        } else {
          formatted = formatted.concat(entry.value);
        }
      }
      return formatted;
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
  <div class="categorization">
    {{categorization.join(', ')}}
  </div>
  <div class="actions" v-if="actions">
    <i class="fa fa-file-o" v-if="isLocal" v-on:click="extractEntity"></i> <i class="fa fa-trash" v-on:click="removeEntity"></i>
  </div>
  <div class="main-info">
    <h3 class="header">
      <a v-if="renderLink" title="{{ header.join(', ') }}" :href="focusData['@id']">{{ header.join(', ') }}</a>
      <span v-if="!renderLink" title="{{ header.join(', ') }}">{{ header.join(', ') }}</span>
    </h3>
    <ul class="info">
      <li v-for="v in info" track-by="$index">{{ v }}</li>
    </ul>
  </div>
  <div class="identifiers">
    <ul>
      <li v-for="v in identifiers">{{v}}</li>
    </ul>
  </div>
  <div class="sub">
    <span>{{ sub.join(' | ') }}</span>
  </div>
</div>
</template>

<style lang="less">
@import './_variables.less';
.entity-summary {
  width: 100%;
  border: 1px solid #ccc;
  font-size: 12px;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  .categorization {
    color: #8a8a8a;
    flex-basis: 85%;
    padding: 3px;
    flex-grow: 2;
    display: block;
    font-weight: bold;
    margin-bottom: -0.4em;
  }
  .actions {
    flex-basis: 3em;
    text-align: center;
  }
  .main-info {
    flex-basis: 70%;
    max-width: 70%;
    padding: 0px 3px;
    .header {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      font-size: 1.6em;
      line-height: 1.6em;
      min-height: 1.2em;
      margin: 0px;
      width: 100%;
    }
    ul.info {
      list-style-type: none;
      padding: 0px;
    }
  }
  .identifiers {
    flex-basis: 27%;
    text-align: right;
    padding: 0px 0.5em;
    font-weight: bold;
    ul {
      list-style-type: none;
      padding: 0px;
    }
  }
  .sub {
    font-style: italic;
    flex-basis: 100%;
    padding: 3px;
    background-color: rgba(0, 0, 0, 0.01);
    border: solid rgba(0, 0, 0, 0.1);
    border-width: 1px 0px 0px 0px;
    > span {
      display: block;
      height: 1.7em;
      overflow-y: hidden;
    }
  }
}

</style>
