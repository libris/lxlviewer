<script>
import * as _ from 'lodash';
import * as VocabUtil from '../utils/vocab';
import * as DataUtil from '../utils/data';
import * as StringUtil from '../utils/string';
import ProcessedLabel from './processedlabel';
import ItemMixin from './mixins/item-mixin';
import LensMixin from './mixins/lens-mixin';
import { getVocabulary, getDisplayDefinitions, getSettings, getEditorData } from '../vuex/getters';

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
    possibleValues: [],
    showActionButtons: false,
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
      inEdit: false,
      showCardInfo: false,
      searchResult: {},
      searchDelay: 2,
      removeHover: false,
      formObj: {},
      selected: '',
      radioLimit: 2,
    };
  },
  computed: {
    getRange() {
      const types = VocabUtil.getRange(
        this.key,
        this.vocab,
        this.settings.vocabPfx
      );
      return types;
    },
    disabledLabel() {
      return `${StringUtil.getUiPhraseByLang('Choose', this.settings.language)} ${StringUtil.labelByLang(this.key, this.settings.language, this.vocab, this.settings.vocabPfx)}`;
    },
  },
  ready() {

  },
  watch: {
    selected(val) {
      const enumObj = {
        '@id': val['@id'],
        '_uid': this.value._uid
      }
      this.$dispatch('add-linked', val);
      this.$dispatch('update-item', this.index, enumObj);
    },
    possibleValues(collection) {
      // Watch so that we can match against value when recieved
      if (collection.length > 0) {
        this.setInitialValue();
      }
    },
  },
  methods: {
    setInitialValue() {
      console.log("Setting init value");
      let matchId = this.value['@id'];
      if (typeof matchId !== 'undefined' && matchId !== '') {
        if (matchId.indexOf('marc:') > -1) {
          matchId = matchId.replace(':', '/');
        }
        const match = _.find(this.possibleValues, (item) => {
          return item['@id'].indexOf(matchId) > -1;
        });
        if (match) {
          this.selected = match;
        } else {
          this.setEmptyValue();
        }
      } else {
        this.setEmptyValue();
      }
    },
    setEmptyValue() {
      // console.log("setting to empty");
      this.$dispatch('update-item', this.index, {'@id': ''});
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
  },
};
</script>

<template>
  <div class="item-enumeration" v-bind:class="{'distinguish-removal': removeHover}">
    <div class="item-value" v-if="isLocked && selected">
      {{ selected.prefLabelByLang[this.settings.language] || selected.prefLabelByLang['en'] }}
    </div>
    <ul class="enumeration-input enumeration-radio" v-if="!isLocked && possibleValues.length < this.radioLimit+1">
      <li v-for="option in possibleValues">
        <input type="radio" v-model="selected" id="{{ this.key + '_' + this.index + '_' + option['@id'] }}" v-bind:value="option"><label for="{{ this.key + '_' + this.index + '_' + option['@id'] }}"> {{ option.prefLabelByLang[this.settings.language] || option.prefLabelByLang['en'] }}{{ option.notation ? ` (${option.notation})` : '' }}</label>
      </li>
    </ul>
    <div class="enumeration-input enumeration-dropdown" v-if="!isLocked && possibleValues.length > this.radioLimit">
      <select v-model="selected">
        <option v-if="selected === ''" disabled value="">{{disabledLabel}}</option>
        <option v-for="option in possibleValues" v-bind:value="option">{{ option.prefLabelByLang[this.settings.language] || option.prefLabelByLang['en'] }}{{ option.notation ? ` (${option.notation})` : '' }}</option>
      </select>
    </div>
    <div class="remover" v-show="!isLocked" v-on:click="removeThis()" @mouseover="removeHover = true" @mouseout="removeHover = false"><i class="fa fa-trash-o"></i></div>
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
