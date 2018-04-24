<script>
/*
  Controls add new entity button and add entity modal with it's content
*/
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
      active: false,
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
  components: {
    'modal-component': ModalComponent,
    'tooltip-component': ToolTipComponent,
    'entity-search-list': EntitySearchList,
  },
  watch: {
    'inspector.event'(val, oldVal) {
      if (val.name === 'modal-control') {
        switch(val.value) {
          case 'close-entity-adder':
          this.closeSearch();
            break;
          default:
            return;
        }
      }
    },
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
        return VocabUtil.getTree(
          type, 
          this.resources.vocab, 
          this.settings.vocabPfx, 
          this.resources.context
        );
      });
      return VocabUtil.flattenTree(
        tree, 
        this.resources.vocab, 
        this.settings.vocabPfx, 
        this.resources.context, 
        this.settings.language
      );
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
      const fetchedRange = VocabUtil.getRange(
        this.entityType, 
        this.fieldKey, 
        this.resources.vocab, 
        this.settings.vocabPfx, 
        this.resources.context)
        .map(item => item.replace(this.settings.vocabPfx, ''));
      return fetchedRange;
    },
    getFullRange() {
      return VocabUtil.getFullRange(
        this.entityType, 
        this.fieldKey, 
        this.resources.vocab, 
        this.settings.vocabPfx, 
        this.resources.context, 
        this.resources.vocabClasses
      );
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
        if (!VocabUtil.isEmbedded(
          prop, this.
          resources.vocab, 
          this.settings, 
          this.resources.context
        )) {
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
      return DisplayUtil.getFormattedSelectOption(
        term, 
        this.settings, 
        this.resources.vocab, 
        this.resources.context
      );
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
      LayoutUtil.scrollLock(true);
      this.active = true;
      this.$nextTick(() => {
        this.$el.querySelector('.entity-search-keyword-input').focus();
      });
      this.$store.dispatch('setStatusValue', { 
        property: 'keybindState', 
        value: 'entity-adder' 
      });
    },
    hide() {
      if (!this.active) return;
      this.active = false;
      LayoutUtil.scrollLock(false);
      this.$store.dispatch('setStatusValue', { 
        property: 'keybindState', 
        value: 'overview' 
      });
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
    addLinkedItem(obj) {
      let currentValue = _.cloneDeep(_.get(this.inspector.data, this.path));
      const linkObj = { '@id': obj['@id'] };
      if (!_.isArray(currentValue)) {
        currentValue = linkObj;
      } else {
        currentValue.push(linkObj);
      }
      this.$store.dispatch('addToQuoted', obj);
      this.$store.dispatch('updateInspectorData', {
          path: `${this.path}`,
          value: currentValue,
          addToHistory: true,
      });
      this.hide();
    },
    addItem(obj) {
      let currentValue = _.cloneDeep(_.get(this.inspector.data, this.path));
      if (!_.isArray(currentValue)) {
        currentValue = obj;
      } else {
        currentValue.push(obj);
      }
      this.$store.dispatch('updateInspectorData', {
          path: `${this.path}`,
          value: currentValue,
          addToHistory: true,
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
          self.searchResult = result.items;
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
        fetch(searchUrl).then((response) => {
          resolve(response.json());
        }, (error) => {
          reject('Error searching...', error);
        });
      });
    },
  },
};
</script>

<template>
  <div class="EntityAdder" :class="{'is-innerAdder': isPlaceholder, 'is-fillWidth': addEmbedded}">
    <div class="EntityAdder-add"
      v-if="isPlaceholder && !addEmbedded" 
      v-on:click="add()" 
      @mouseenter="showToolTip = true" 
      @mouseleave="showToolTip = false">
      <span>
        <i class="fa fa-fw fa-plus plus-icon" aria-hidden="true">
          <tooltip-component 
            :show-tooltip="showToolTip" 
            tooltip-text="Add" 
            translation="translatePhrase"></tooltip-component>
        </i>
      </span>
    </div>

    <div class="EntityAdder-add action-button" 
      v-if="!isPlaceholder && !addEmbedded" 
      v-on:click="add()" 
      @mouseenter="showToolTip = true" 
      @mouseleave="showToolTip = false">
      <i class="EntityAdder-addIcon fa fa-fw fa-plus plus-icon" aria-hidden="true">
        <tooltip-component 
          :show-tooltip="showToolTip" 
          tooltip-text="Add" 
          translation="translatePhrase"></tooltip-component>
      </i>
      <span class="EntityAdder-addLabel label-text">{{ addLabel | labelByLang | capitalize }}</span>
    </div>

    <div class="EntityAdder-typeChooser" 
      v-if="addEmbedded" 
      v-on-clickaway="dismissTypeChooser">
      <select class="EntityAdder-typeSelect" 
        v-model="selectedType" 
        @change="addType(selectedType, true)">
        <option disabled value="">{{"Choose type" | translatePhrase}}</option>
        <option v-for="(term, index) in getClassTree"  
          v-html="getFormattedSelectOption(term, settings, resources.vocab, resources.context)"
          :disabled="term.abstract" 
          :key="`${term.id}-${index}`" 
          :value="term.id"></option>
      </select>
    </div>

    <modal-component v-if="active" class="EntityAdder-modal EntityAdderModal" @close="closeSearch">
      <template slot="modal-header">
        {{ "Add entity" | translatePhrase }} | {{ addLabel | labelByLang }}
        <span class="ModalComponent-windowControl">
          <i @click="hide" class="fa fa-close"></i>
        </span>
      </template>

    <template slot="modal-body">
      <div class="EntityAdder-modalBody">
        <div class="EntityAdder-controls">
          <div class="EntityAdder-controlForm">
            <!--<input class="entity-search-keyword-input" v-model="keyword" @input="setSearching()"></input>-->
              <div class="EntityAdder-search">
                <label for="entityKeywordInput" class="EntityAdder-searchLabel">{{ "Search" | translatePhrase }}</label>
                <div class="EntityAdder-searchInputContainer">
                  <input class="EntityAdder-searchInput entity-search-keyword-input"
                    name="entityKeywordInput"
                    v-model="keyword"
                    autofocus />
                  <select class="EntityAdder-searchSelect"
                    v-model="currentSearchTypes" 
                    @change="handleChange(keyword)">
                    <option :value="getRange">{{"All types" | translatePhrase}}</option>
                    <option 
                      v-for="(term, index) in getClassTree" 
                      :key="`${term.id}-${index}`" 
                      :value="term.id" 
                      v-html="getFormattedSelectOption(term, settings, resources.vocab, resources.context)"></option>
                  </select>
                </div>
              </div>
            <div class="EntityAdder-info" 
              v-if="getFullRange.length > 0" 
              @mouseleave="rangeInfo = false">
              <i class="fa fa-info-circle" @mouseenter="rangeInfo = true"></i>
              <div class="EntityAdder-infoText" v-if="rangeInfo">
                {{ "Allowed types" | translatePhrase }}:
                <br>
                <span v-for="(range, index) in getFullRange" :key="index" class="EntityAdder-infoRange">
                  - {{range | labelByLang}}
                </span>
              </div>
            </div>
            <div class="EntityAdder-create">
              <button class="EntityAdder-createBtn"
                v-if="hasSingleRange" 
                v-on:click="addEmpty(getFullRange[0])">{{ "Create local entity" | translatePhrase }}
              </button>
              <select class="EntityAdder-createSelect"
                v-model="selectedType" 
                @change="addType(selectedType)" 
                v-if="!hasSingleRange">
                <option disabled value="">{{ "Create local entity" | translatePhrase }}</option>
                <option 
                  v-for="(term, index) in getClassTree" 
                  :disabled="term.abstract" 
                  :value="term.id" 
                  :key="`${term.id}-${index}`" 
                  v-html="getFormattedSelectOption(term, settings, resources.vocab, resources.context)"></option>
              </select>
            </div>
          </div>
        </div>
        <div class="EntityAdder-searchStatus search-status"
          v-if="!loading && keyword.length === 0" >{{ "Start writing to begin search" | translatePhrase }}...</div>
        <div class="EntityAdder-searchStatus search-status"
          v-if="loading">
          {{ "Searching" | translatePhrase }}...
          <br><i class="EntityAdder-searchStatusIcon fa fa-circle-o-notch fa-spin"></i>
        </div>
        <div class="EntityAdder-searchStatussearch-status"
          v-if="!loading && searchResult.length === 0 && keyword.length > 0 && searchMade">
          {{ "No results" | translatePhrase }}...
        </div>
        <entity-search-list class="EntityAdder-searchResult"
          v-if="!loading && keyword.length > 0" 
          :path="path" 
          :results="searchResult" 
          :disabled-ids="alreadyAdded"
          @add-item="addLinkedItem"
          ></entity-search-list>
      </div>
    </template>
  </modal-component>
</div>
</template>

<style lang="less">

.EntityAdder {

  &.disabled {
    visibility: hidden;
  }
  &.is-fillWidth {
    width: 100%;
  }
  &.is-innerAdder {
    cursor: pointer;
  }

  &-add {
    color: @gray-dark;
    cursor: pointer;
    display: inline-block;
    opacity: 1;
    transition: opacity 0.5s ease;

    &:hover {
      color: @black;
    }
  }

  &-addIcon {
    width: 16px;
  }

  &-addLabel {
    display: none;
  }

  &-typeChooser {
    text-align: center;
    padding: 5px;
    border: 2px solid #b2b2b2;
  }

  &-typeSelect {
    width: 100%;
  }

  &-controls {
    border: solid #ccc;
    border-top-width: medium;
    border-right-width: medium;
    border-bottom-width: medium;
    border-left-width: medium;
    border-width: 0 0 1px;
    background-color: darken(@neutral-color, 4%);
    line-height: 1.2;
    position: absolute;
    padding: 10px;
    width: 100%;
    z-index: @modal-z;
  }

  &-controlForm {
    align-items: center;
    display: flex;
  }

  &-searchLabel {
    font-size: 14px;
    font-size: 1.4rem;
    font-weight: 700;
    margin: 0;
  }

  &-search {
    flex: 60% 0 0;
  }

  &-searchInputContainer {
    font-size: 14px;
    font-size: 1.4rem;
    display: flex;
    border: 2px solid #949a9e;
    border-radius: .2em;
    flex: 100% 0 0;
    background: #fff;
    padding: .5em; 
  }

  &-searchInput {
    width: 100%;
    border: none;
    outline: none;
  }

  &-searchSelect {
    max-width: 50%;
    padding: .2em .5em;
    margin: 0 .3em;
    border-radius: .3em;
    border: 0;
    outline: none;
    background: #009788;
    color: #fff;
    cursor: pointer;
    font-weight: 700;
  }

  &-info {
    display: inline-block;
    margin: 15px 0 0 10px;
  }

  &-infoRange {
    display: block;
    font-size: 14px;
    font-size: 1.4rem;
  }

  &-infoText {
    background-color: #fff;
    border: 1px solid #ccc;
    border-radius: 3px;
    font-size: 12px;
    font-size: 1.2rem;
    padding: 5px;
    position: absolute;
  }

  &-create {
    display: flex;
    flex-grow: 1;
    justify-content: flex-end;
    margin: 15px 0 0 10px;
  }

  &-createBtn,
  &-createSelect {
    cursor: pointer;
    padding: 5px 10px;
    color: #444;
    border: none;
    border-radius: 2px;
    background: #ccc;
    font-weight: 700;
    font-size: 12px;
    font-size: 1.2rem;
  }

  &-searchStatus {
    font-size: 20px;
    font-size: 2rem;
    padding: 30% 10px 10px;
    text-align: center;
  }

  &-searchStatusIcon {
    font-size: 80px; 
    font-size: 8rem; 
    margin: 10px 0 0;
  }

  &-searchResult {
    padding: 85px 0 0 0;
    margin: 0 0 100px;
  }

}

</style>
