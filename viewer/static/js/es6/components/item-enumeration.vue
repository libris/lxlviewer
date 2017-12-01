<script>
import * as _ from 'lodash';
import * as VocabUtil from '../utils/vocab';
import * as DataUtil from '../utils/data';
import * as StringUtil from '../utils/string';
import ProcessedLabel from './processedlabel';
import TooltipComponent from './tooltip-component';
import ItemMixin from './mixins/item-mixin';
import LensMixin from './mixins/lens-mixin';
import { getVocabulary, getDisplayDefinitions, getContext, getSettings, getEditorData } from '../vuex/getters';

export default {
  name: 'item-enumeration',
  mixins: [ItemMixin],
  props: {
    value: '',
    key: '',
    index: Number,
    isLocked: false,
    expanded: false,
    entityType: '',
    showActionButtons: false,
    possibleValues: [],
  },
  vuex: {
    getters: {
      vocab: getVocabulary,
      display: getDisplayDefinitions,
      context: getContext,
      settings: getSettings,
      editorData: getEditorData,
    },
  },
  data() {
    return {
      inEdit: false,
      showCardInfo: false,
      searchResult: {},
      searchDelay: 2,
      removeHover: false,
      formObj: {},
      selected: '',
      radioLimit: 0,
    };
  },
  computed: {
    embellishedSelected() {
      return StringUtil.getLabelFromObject(DataUtil.getLinked(this.selected, this.editorData.quoted), this.settings.language);
    },
    embellishedValues() {
      const emb = {};
      if (!this.isLocked) {
        _.each(this.possibleValues, (id) => {
          emb[id] = StringUtil.getLabelFromObject(DataUtil.getLinked(id, this.editorData.quoted), this.settings.language);
        })
      }
      return emb;
    },
    getRange() {
      const types = VocabUtil.getRange(
        this.key,
        this.vocab,
        this.settings.vocabPfx,
        this.context
      );
      return types;
    },
    disabledLabel() {
      return `${StringUtil.getUiPhraseByLang('Choose', this.settings.language)} ${StringUtil.labelByLang(this.key, this.settings.language, this.vocab, this.settings.vocabPfx, this.context)}`;
    },
  },
  ready() {
    this.setInitialValue();
  },
  watch: {
    selected(val) {
      const enumObj = {
        '@id': val,
        '_uid': this.value._uid
      }
      this.$dispatch('update-item', this.index, enumObj);
    },
  },
  methods: {
    setInitialValue() {
      if (typeof this.value['@id'] === 'undefined') {
        console.error(`Enumeration on ${this.key} is missing @id.`);
      } else {
        if (this.value['@id'].indexOf('marc:') > -1) {
          const replacedPrefix = this.value['@id'].replace('marc:', 'https://id.kb.se/marc/');
          this.selected = replacedPrefix;
        } else {
          this.selected = this.value['@id'];
        }
      }
    },
    isEmpty() {
      // TODO: Is the item empty?
      return false;
    },
    size(obj) {
      return _.size(obj);
    },
    isPretty(key, value) {
      return (this.isObject(value) || key === '@id');
    },
    addFocus() {
      this.focused = true;
    },
    removeFocus() {
      this.focused = false;
    },
  },
  components: {
    'processed-label': ProcessedLabel,
    'tooltip-component': TooltipComponent,
  },
};
</script>

<template>
  <div class="item-enumeration" v-bind:class="{'distinguish-removal': removeHover}">
    <div class="item-value" v-if="isLocked && selected">
      {{ embellishedSelected }}
    </div>
    <div class="enumeration-input enumeration-dropdown" v-if="!isLocked && possibleValues.length === 0">
      <select>
        <option value="0">{{ embellishedSelected }}</option>
        <option disabled value="">{{ 'Loading more values' | translatePhrase }}...</option>
      </select>
    </div>
    <div class="enumeration-input enumeration-dropdown" v-if="!isLocked && possibleValues.length > 0">
      <select v-model="selected">
        <option v-if="selected === ''" disabled value="">{{disabledLabel}}</option>
        <option v-for="option in possibleValues" v-bind:value="option">{{ embellishedValues[option] }}</option>
      </select>
    </div>
    <div class="remover" v-show="!isLocked" v-on:click="removeThis()" @mouseover="removeHover = true" @mouseout="removeHover = false">
      <i class="fa fa-trash-o">
        <tooltip-component :show-tooltip="removeHover" tooltip-text="Remove" translation="translatePhrase"></tooltip-component>
      </i>
    </div>
  </div>
</template>

<style lang="less">
@import './_variables.less';

.item-enumeration {
  border: solid 1px transparent;
  display: flex;
  justify-content: space-between;
  align-items: center;
  .item-value {
    padding-left: 5px;
  }
  .enumeration-input {
    max-width: 95%;
    display: inline-block;
    &.enumeration-dropdown {
      width: 94%;
      > select {
        width: 100%;
      }
    }
    &.enumeration-radio {
      list-style: none;
      padding-left: 0.5em;
      li {
        margin-right: 1em;
        input {
          margin-right: 0.5em;
        }
        label {
          font-weight: normal;
        }
      }
    }
  }
  .remover {
    display: inline-block;
    padding: 3px;
    cursor: pointer;
    transition: opacity 0.5s ease;
    &.show-icon {
      opacity: 1;
    }
  }
}

</style>
