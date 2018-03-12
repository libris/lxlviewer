<script>
import * as _ from 'lodash';
import * as httpUtil from '@/utils/http';
import * as VocabUtil from '@/utils/vocab';
import * as DisplayUtil from '@/utils/display';
import * as LayoutUtil from '@/utils/layout';
import * as RecordUtil from '@/utils/record';
import * as StringUtil from '@/utils/string';
import * as CombinedTemplates from '@/resources/json/combinedTemplates.json';
import * as StructuredValueTemplates from '@/resources/json/structuredValueTemplates.json';
import ProcessedLabel from '../shared/processedlabel';
import ToolTipComponent from '../shared/tooltip-component';
import EntitySearchList from '../search/entity-search-list';
import ModalComponent from '@/components/shared/modal-component.vue';
import LensMixin from '../mixins/lens-mixin';
import { mixin as clickaway } from 'vue-clickaway';

export default {
  mixins: [clickaway, LensMixin],
  data() {
    return {
      searchOpen: false,
      searchResult: {},
      keyword: '',
      loading: false,
      debounceTimer: 500,
      chooseLocalType: false,
      showToolTip: false,
      rangeInfo: false,
      selectedType: '',
      addEmbedded: false,
      searchMade: false,
      currentSearchTypes: [],
    };
  },
  props: {
    fieldKey: '',
    allowLocal: true,
    propertyTypes: {
      type: Array,
      default: () => [],
    },
    showActionButtons: false,
    active: false,
    isPlaceholder: false,
    isChip: false,
    path: '',
    alreadyAdded: {
      type: Array,
      default: () => [],
    },
    valueList: {
      type: Array,
      default: () => [],
    },
    possibleValues: [],
    hasRescriction: false,
    entityType: '',
  },
  events: {
    'close-modals'() {
      this.closeSearch();
      return true;
    },
    'add-entity'(item) {
      this.$dispatch('add-item', item);
      this.closeSearch();
    },
  },
  components: {
    'modal-component': ModalComponent,
    'tooltip-component': ToolTipComponent,
    'entity-search-list': EntitySearchList,
  },
  watch: {
    valueList(newVal) {
      if (newVal.length === 0 && this.onlyEmbedded && this.getFullRange.length > 1) {
        this.addEmbedded = true;
      } else {
        this.addEmbedded = false;
      }
    },
    keyword(value) {
      this.handleChange(value);
    },
  },
  computed: {
    settings() {
      return this.$store.getters.settings;
    },
    user() {
      return this.$store.getters.user;
    },
    resources() {
      return this.$store.getters.resources;
    },
    inspector() {
      return this.$store.getters.inspector;
    },
    getClassTree() {
      const tree = this.getRange.map(type => {
        return VocabUtil.getTree(type, this.resources.vocab, this.settings.vocabPfx, this.resources.context);
      });
      return VocabUtil.flattenTree(tree, this.resources.vocab, this.settings.vocabPfx, this.resources.context, this.settings.language);
    },
    hasSingleRange() {
      return this.getFullRange.length === 1;
    },
    addLabel() {
      if (this.isLiteral) {
        return this.fieldKey;
      } else if (this.getRange.length === 1) {
        return this.getRange[0];
      } else if (this.getRange.length > 1) {
        return StringUtil.getUiPhraseByLang('entity', this.settings.language);
      }
      return this.fieldKey;
    },
    getRange() {
      const fetchedRange = VocabUtil.getRange(this.entityType, this.fieldKey, this.resources.vocab, this.settings.vocabPfx, this.resources.context)
        .map(item => item.replace(this.settings.vocabPfx, ''));
      return fetchedRange;
    },
    getFullRange() {
      return VocabUtil.getFullRange(this.entityType, this.fieldKey, this.resources.vocab, this.settings.vocabPfx, this.resources.context, this.resources.vocabClasses);
    },
    allSearchTypes() {
      const types = this.getFullRange;
      const typeArray = [];
      for (const type of types) {
        typeArray.push(type.replace(this.settings.vocabPfx, ''));
      }
      return typeArray;
    },
    onlyEmbedded() {
      const range = this.getFullRange;
      for (const prop of range) {
        if (!VocabUtil.isEmbedded(prop, this.resources.vocab, this.settings, this.resources.context)) {
          return false;
        }
      }
      return true;
    },
    isEnumeration() {
      if (this.possibleValues && this.possibleValues.length > 0) {
        return true;
      }
      return false;
    },
    canRecieveObjects() {
      return (this.propertyTypes.indexOf('DatatypeProperty') === -1);
    },
    isLiteral() {
      // TODO: Verify usage
      if (this.getFullRange.length > 0) {
        for (const rangeElement of this.getFullRange) {
          if (rangeElement.indexOf('Literal') > -1) {
            return true;
          }
        }
      }
      return false;
    },
  },
  ready() {
    this.addEmbedded = (this.valueList.length === 0 && this.onlyEmbedded && this.getFullRange.length > 1);
    this.searchOpen = false;
    this.currentSearchTypes = this.getRange;
  },
  methods: {
    getFormattedSelectOption(term) {
      return DisplayUtil.getFormattedSelectOption(term, this.settings, this.resources.vocab, this.resources.context);
    },
    handleChange(value) {
      this.setSearching();
      this.searchMade = false;
      let searchPhrase = value;
      if (value) {
        setTimeout(() => {
          if (this.keyword === value) {
            this.search(searchPhrase);
          }
        }, this.debounceTimer);
      } else {
        this.searchResult = {};
      }
    },
    setSearching() {
      if (this.keyword === '') {
        this.loading = false;
      } else {
        this.loading = true;
      }
    },
    dismissTypeChooser() {
      if (this.valueList.length > 0) {
        this.addEmbedded = false;
      }
      this.showToolTip = false;
      this.selectedType = '';
    },
    add() {
      if (this.isEnumeration) {
        this.addItem({'@id': ''});
      } else if (this.canRecieveObjects) {
        const range = this.getFullRange;
        if (range.length === 1 && this.onlyEmbedded) {
          this.addEmpty(range[0]);
        } else if (this.onlyEmbedded) {
          this.addEmbedded = true;
        } else {
          this.show();
        }
      } else {
        this.addItem('');
      }
    },
    show() {
      this.active = true;
      this.$nextTick(() => {
        this.$el.querySelector('.entity-search-keyword-input').focus();
      });
      this.$store.dispatch('setStatusValue', { property: 'keybindState', value: 'entity-adder' });
    },
    hide() {
      if (!this.active) return;
      this.active = false;
      this.$store.dispatch('setStatusValue', { property: 'keybindState', value: 'overview' });
    },
    openSearch() {
      this.keyword = '';
      this.searchOpen = true;
    },
    closeSearch() {
      this.searchOpen = false;
      this.keyword = '';
      this.searchResult = {};
      this.chooseLocalType = false;
      this.hide();
    },
    addItem(obj) {
      let currentValue = _.get(this.inspector.data, this.path);
      if (!_.isArray(currentValue)) {
        currentValue = [currentValue];
      }
      currentValue.push(obj);
      this.$store.dispatch('updateInspectorData', {
          path: `${this.path}`,
          value: currentValue
      });
    },
    addEmpty(typeId) {
      this.closeSearch();
      const shortenedType = StringUtil.convertToPrefix(typeId, this.resources.context);
      let obj = {'@type': shortenedType};
      if (StructuredValueTemplates.hasOwnProperty(shortenedType)) {
        obj = _.cloneDeep(StructuredValueTemplates[shortenedType]);
      }
      this.addItem(obj);
    },
    addType(typeId) {
      const shortenedType = StringUtil.convertToPrefix(typeId, this.resources.context);
      this.addEmpty(shortenedType);
      this.dismissTypeChooser();
    },
    search(keyword) {
      const self = this;
      self.searchResult = {};
      this.getItems(keyword, [].concat(this.currentSearchTypes)).then((result) => {
        setTimeout(() => {
          self.searchResult = result;
          self.loading = false;
          self.searchMade = true;
        }, 500);
      }, (error) => {
        self.loading = false;
      });
    },
    getItems(keyword, typeArray) {
      // TODO: Support asking for more items
      const searchKey = keyword !== '*' ? `${keyword}*` : keyword;
      let searchUrl = `${this.settings.apiPath}/find.json?q=${searchKey}`;
      if (typeof typeArray !== 'undefined' && typeArray.length > 0) {
        for (const type of typeArray) {
          searchUrl += `&@type=${type}`;
        }
      }
      searchUrl += '&_limit=40';
      return new Promise((resolve, reject) => {
        httpUtil.get({ url: searchUrl, accept: 'application/ld+json' }).then((response) => {
          resolve(response.items);
        }, (error) => {
          reject('Error searching...', error);
        });
      });
    },
  },
};
</script>

<template>
<div class="entity-adder" :class="{'inner-adder': isPlaceholder, 'fill-width': addEmbedded}">
  <div v-if="isPlaceholder && !addEmbedded" v-on:click="add()" @mouseenter="showToolTip = true" @mouseleave="showToolTip = false">
    <span class="chip-label">
      <i class="fa fa-fw fa-plus plus-icon" aria-hidden="true">
        <tooltip-component :show-tooltip="showToolTip" tooltip-text="Add" translation="translatePhrase"></tooltip-component>
      </i>
    </span>
  </div>
  <div v-if="!isPlaceholder && !addEmbedded" class="action-button add-entity-button" v-on:click="add()" @mouseenter="showToolTip = true" @mouseleave="showToolTip = false">
    <span class="chip-label">
      <i class="fa fa-fw fa-plus plus-icon" aria-hidden="true">
        <tooltip-component :show-tooltip="showToolTip" tooltip-text="Add" translation="translatePhrase"></tooltip-component>
      </i>
    <span class="label-text">{{ addLabel | labelByLang | capitalize }}</span></span>
  </div>
  <div class="type-chooser" v-if="addEmbedded" v-on-clickaway="dismissTypeChooser">
    <select v-model="selectedType" @change="addType(selectedType, true)">
      <option disabled value="">{{"Choose type" | translatePhrase}}</option>
      <option v-for="term in getClassTree" :disabled="term.abstract" :key="term.id" :value="term.id" v-html="getFormattedSelectOption(term, settings, resources.vocab, resources.context)"></option>
    </select>
  </div>
  <modal-component v-if="active" class="EntityAdderModal">
    <template slot="modal-header">
      {{ "Add entity" | translatePhrase }} | {{ addLabel | labelByLang }}
      <span class="ModalComponent-windowControl">
        <i @click="hide" class="fa fa-close"></i>
      </span>
    </template>
    <template slot="modal-body">
      <div class="stage-0">
        <div class="search-header">
          <span>{{ "Search" | translatePhrase }}</span>
          <div class="search">
            <!--<input class="entity-search-keyword-input" v-model="keyword" @input="setSearching()"></input>-->
            <div class="input-container">
              <input
                v-model="keyword"
                class="entity-search-keyword-input"
                autofocus
              >
              <select v-model="currentSearchTypes" @change="handleChange(keyword)">
                <option :value="getRange">{{"All types" | translatePhrase}}</option>
                <option v-for="(term, index) in getClassTree" :key="`${term.id}-${index}`" :value="term.id" v-html="getFormattedSelectOption(term, settings, vocab, context)"></option>
              </select>
            </div>
            <div class="range-info-container" v-if="getFullRange.length > 0" @mouseleave="rangeInfo = false">
              <i class="fa fa-info-circle" @mouseenter="rangeInfo = true"></i>
              <div class="range-info" v-if="rangeInfo">
                {{ "Allowed types" | translatePhrase }}:
                <br>
                <span v-for="(range, index) in getFullRange" :key="index" class="range">
                  - {{range | labelByLang}}
                </span>
              </div>
            </div>
            <div class="controls">
              <button v-if="hasSingleRange" v-on:click="addEmpty(getFullRange[0])">{{ "Create local entity" | translatePhrase }}</button>
              <select v-model="selectedType" @change="addType(selectedType)" v-if="!hasSingleRange">
                <option disabled value="">{{ "Create local entity" | translatePhrase }}</option>
                <option v-for="(term, index) in getClassTree" :disabled="term.abstract" :value="term.id" :key="`${term.id}-${index}`" v-html="getFormattedSelectOption(term, settings, vocab, context)"></option>
              </select>
            </div>
          </div>
        </div>
        <div v-if="!loading && keyword.length === 0" class="search-status">{{ "Start writing to begin search" | translatePhrase }}...</div>
        <div v-if="loading" class="search-status">{{ "Searching" | translatePhrase }}...<br><i class="fa fa-circle-o-notch fa-spin"></i></div>
        <div v-if="!loading && searchResult.length === 0 && keyword.length > 0 && searchMade" class="search-status">
          {{ "No results" | translatePhrase }}...
        </div>
        <entity-search-list v-if="!loading && keyword.length > 0" :results="searchResult" :disabled-ids="alreadyAdded"></entity-search-list>
      </div>
    </template>
  </modal-component>
</div>
</template>

<style lang="less">

.entity-adder {
  .disabled {
    visibility: hidden;
  }
  &.fill-width {
    width: 100%;
  }
  &.inner-adder {
    cursor: pointer;
  }
  > .chip {
    .label-text {
      display: inline-block;
    }
  }
  .type-chooser {
    text-align: center;
    padding: 5px;
    border: 2px solid #b2b2b2;
    > select {
      width: 100%;
    }
  }
  .add-entity-button {
    padding: 0.3em 0;
    opacity: 1;
    transition: opacity 0.5s ease;
    &.fade {
      opacity: 0;
    }
    cursor: pointer;
    .chip-label {
      color: @gray-dark;
    }
    &:hover {
      .chip-label {
        color: @gray-dark;
      }
    }
    .chip-action {

    }
  }
  .window {
    .body {
      width: 100%;
      background-color: white;
      border: 1px solid #ccc;
      padding: 0px;
      overflow-y: scroll;
      .stage-1 {
        text-align: center;
      }
      button {
        font-size: 12px;
      }
      .search-result {
        padding-top: 80px;
        margin-bottom: 100px;
      }
      .search-header {
        position: absolute;
        width: 100%;
        padding: 0.5em 1em;
        border: solid #ccc;
        border-width: 0px 0px 1px 0px;
        background-color: darken(@neutral-color, 4%);
        z-index: @modal-z;
        > span {
         font-weight: bold;
        }
        .search {
          display: flex;
          align-items: center;
          .input-container {
            display: flex;
            border: 2px solid @gray;
            border-radius: 0.2em;
            flex: 60% 0 0;
            background: @white;
            padding: 0.5em;
            > select {
              max-width: 50%;
              padding: 0.2em 0.5em;
              margin: 0 0.3em;
              border-radius: 0.3em;
              border: 0px;
              outline: none;
              background: @brand-primary;
              color: @white;
              cursor: pointer;
              font-weight: bold;
            }
            > input {
              width: 100%;
              border: none;
              outline: none;
            }
          }
          .range-info-container {
            margin-left: 0.5em;
            display: inline-block;
            .range-info {
              position: absolute;
              background-color: #fff;
              border: 1px solid #ccc;
              padding: 5px;
              border-radius: 3px;
              font-size: 1.2rem;
              .range {
                display: block;
                font-size: 1.4rem;
              }
            }
          }
        }
        .controls {
          display: flex;
          flex-grow: 1;
          justify-content: flex-end;
          button, select {
            cursor: pointer;
            padding: 0.5em 1em;
            color: #444;
            border: none;
            border-radius: 2px;
            background: #ccc;
            font-weight: bold;
            font-size: 12px;
          }
        }
      }
      .search-status {
        padding: 10px;
        padding-top: 30%;
        font-size: 2em;
        text-align: center;
        > i {
          font-size: 8rem;
        }
      }
    }
  }

}

</style>
