<script>
import * as _ from 'lodash';
import * as VocabUtil from '../utils/vocab';
import * as DataUtil from '../utils/data';
import * as StringUtil from '../utils/string';
import ProcessedLabel from './processedlabel';
import TooltipComponent from './tooltip-component';
import ItemMixin from './mixins/item-mixin';
import LensMixin from './mixins/lens-mixin';
import { getVocabulary, getContext, getVocabularyClasses, getDisplayDefinitions, getSettings, getEditorData } from '../vuex/getters';

export default {
  name: 'item-vocab',
  mixins: [ItemMixin],
  props: {
    value: '',
    key: '',
    index: Number,
    isLocked: false,
    expanded: false,
    entityType: '',
  },
  vuex: {
    getters: {
      context: getContext,
      vocab: getVocabulary,
      vocabClasses: getVocabularyClasses,
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
      possibleValues: [],
      selected: '',
    };
  },
  computed: {
    range() {
      const types = VocabUtil.getRange(
        this.entityType,
        this.key,
        this.vocab,
        this.settings.vocabPfx,
        this.context
      );
      return types;
    },
  },
  ready() {
    this.possibleValues = this.getPossibleValues();
    this.setInitialValue();
  },
  watch: {
    selected(value) {
      this.$dispatch('update-item', this.index, value);
    },
  },
  methods: {
    getPossibleValues() {
      let values = [];
      const possibleValues = [];
      _.each(this.range, (item) => {
        values = values.concat(VocabUtil.getTermByType(item, this.vocabClasses));
      });
      _.each(values, (value) => {
        possibleValues.push(value['@id'].replace(this.settings.vocabPfx, ''));
      });
      return _.sortBy(possibleValues, value => StringUtil.getLabelByLang(value, this.settings.language, this.vocab, this.settings.vocabPfx, this.context));
    },
    setInitialValue() {
      if (this.possibleValues.indexOf(this.value) > -1) {
        this.selected = this.value;
      }
    },
  },
  components: {
    'processed-label': ProcessedLabel,
    'tooltip-component': TooltipComponent,
  },
};
</script>

<template>
  <div class="item-vocab" v-bind:class="{'locked': isLocked, 'unlocked': !isLocked, 'distinguish-removal': removeHover, 'removed': removed}">
    <div v-if="!isLocked">
      <select v-model="selected">
        <option v-for="option in possibleValues" v-bind:value="option">{{ option | labelByLang }}</option>
      </select>
    </div>
    <span v-if="isLocked">{{value | labelByLang}}</span>
  </div>
</template>

<style lang="less">
@import './_variables.less';

.item-vocab {
  &.locked {
    line-height: 2;
    padding-left: 5px;
    span {
      word-break: break-word;
    }
  }
  select {
    width: 100%;
  }
}

</style>
