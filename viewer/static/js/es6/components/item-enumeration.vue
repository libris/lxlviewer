<script>
import * as _ from 'lodash';
import * as VocabUtil from '../utils/vocab';
import * as DataUtil from '../utils/data';
import ProcessedLabel from './processedlabel';
import ItemMixin from './mixins/item-mixin';
import LensMixin from './mixins/lens-mixin';
import { getVocabulary, getDisplayDefinitions, getSettings, getEditorData } from '../vuex/getters';

export default {
  name: 'item-enumeration',
  props: {
    value: '',
    key: '',
    index: Number,
    isLocked: false,
    expanded: false,
    restriction: '',
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
      formObj: {},
      possibleValues: [],
      selected: '',
      radioLimit: 4,
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
  },
  ready() {
    this.getPossibleValues();
  },
  watch: {
    selected(val) {
      this.$dispatch('update-item', this.index, val);
    },
  },
  methods: {
    getPossibleValues() {
      VocabUtil.getEnumerations(this.restriction, this.key, this.vocab, this.settings.vocabPfx).then((result) => {
        console.log('enumerations', result);
        this.possibleValues = result;
      });
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
  <div class="item-enumeration">
    <ul class="enumeration-radio" v-if="possibleValues.length < this.radioLimit+1">
      <li v-for="option in possibleValues">
        <input type="radio" v-model="selected" id="{{ this.key + '_' + option['@id'] }}" v-bind:value="option['@id']"><label for="{{ this.key + '_' + option['@id'] }}"> {{ option.prefLabelByLang[this.settings.language] || option.prefLabelByLang['en'] }}</label>
      </li>
    </ul>
    <div class="enumeration-dropdown" v-if="possibleValues.length > this.radioLimit">
      <select v-model="selected">
        <option v-for="option in possibleValues" v-bind:value="option['@id']">{{ option.prefLabelByLang[this.settings.language] || option.prefLabelByLang['en'] }}</option>
      </select>
    </div>
  </div>
</template>

<style lang="less">
@import './_variables.less';

.item-enumeration {
  .enumeration-radio {
    list-style: none;
    padding-left: 0.5em;
    li {
      display: inline-block;
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

</style>
