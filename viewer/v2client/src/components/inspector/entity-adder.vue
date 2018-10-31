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
import PanelSearchList from '../search/panel-search-list';
import PanelComponent from '@/components/shared/panel-component.vue';
import ModalPagination from '@/components/inspector/modal-pagination';
import FilterSelect from '@/components/shared/filter-select.vue';
import LensMixin from '../mixins/lens-mixin';
import { mixin as clickaway } from 'vue-clickaway';
import VueSimpleSpinner from 'vue-simple-spinner';

export default {
  mixins: [clickaway, LensMixin],
  data() {
    return {
      searchResult: [],
      keyword: '',
      loading: false,
      debounceTimer: 500,
      showToolTip: false,
      rangeInfo: false,
      selectedType: '',
      addEmbedded: false,
      searchMade: false,
      currentSearchTypes: [],
      active: false,
      currentPage: 0,
      numberOfPages: 0,
      maxResults: 20,
      isCompact: false,
    };
  },
  props: {
    fieldKey: '',
    allowLocal: true,
    propertyTypes: {
      type: Array,
      default: () => [],
    },
    compositional: null,
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
    'panel-component': PanelComponent,
    'tooltip-component': ToolTipComponent,
    'panel-search-list': PanelSearchList,
    'modal-pagination': ModalPagination,
    'filter-select': FilterSelect,
    'vue-simple-spinner': VueSimpleSpinner,
  },
  watch: {
    'inspector.event'(val, oldVal) {
      if (val.name === 'modal-control') {
        switch(val.value) {
          case 'close-entity-adder':
            this.hide();
            return true;
            break;
          default:
            return;
        }
      }
      if (val.name === 'form-control') {
        switch(val.value) {
          case 'close-modals':
            this.hide();
            return true;
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
    }
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
    selectOptions() {
      const classTree = this.getClassTree;
      let options = [];

      for (let i = 0; i < classTree.length; i++) {
        let term = {};

        term.label = this.getFormattedSelectOption(classTree[i]);
        term.value = classTree[i].id;
        term.key = `${classTree[i].id}-${i}`;

        options.push(term);
      }
      return options;
    },
    computedTitle() {
      const modalStr = StringUtil.getUiPhraseByLang('Add entity', this.user.settings.language);
      const addLabelStr = StringUtil.getLabelByLang(this.addLabel, this.user.settings.language, this.resources.vocab, this.resources.context);
      return `${modalStr} | ${addLabelStr}`;
    },
    getClassTree() {
      const tree = this.getRange.map(type => {
        return VocabUtil.getTree(
          type, 
          this.resources.vocab, 
          this.resources.context
        );
      });
      return VocabUtil.flattenTree(
        tree, 
        this.resources.vocab, 
        this.resources.context, 
        this.settings.language
      );
    },
    tooltipText() {
      const addText = StringUtil.getUiPhraseByLang('Add', this.settings.language);
      const label = StringUtil.getLabelByLang(
        this.addLabel, 
        this.settings.language, 
        this.resources.vocab, 
        this.resources.context).toLowerCase();

      return addText+' '+label;
    },
    hasSingleRange() {
      return this.getFullRange.length === 1;
    },
    isVocabField() {
      return VocabUtil.getContextValue(this.fieldKey, '@type', this.resources.context) === '@vocab';
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
        this.resources.context)
        .map(item => StringUtil.getCompactUri(item, this.resources.context));
      return fetchedRange;
    },
    getFullRange() {
      const fetchedRange = VocabUtil.getFullRange(
        this.entityType, 
        this.fieldKey, 
        this.resources.vocab, 
        this.resources.context, 
        this.resources.vocabClasses
      ).map(item => StringUtil.getCompactUri(item, this.resources.context));;
      return fetchedRange;
    },
    allSearchTypes() {
      const types = this.getFullRange;
      const typeArray = [];
      for (const type of types) {
        typeArray.push(StringUtil.getCompactUri(type, this.resources.context));
      }
      return typeArray;
    },
    onlyEmbedded() {
      if (this.compositional === true) {
        return true;
      }
      const range = this.getFullRange;
      for (const classId of range) {
        if (!VocabUtil.isEmbedded(
          classId,
          this.resources.vocab, 
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
  mounted() {
    this.addEmbedded = (this.valueList.length === 0 && this.onlyEmbedded && this.getFullRange.length > 1);

  },
  methods: {
    actionHighlight(active, event) {
      if(active) {
        let item = event.target;
        while ((item = item.parentElement) && !item.classList.contains('js-field'));
          item.classList.add('is-marked');
      } else {
        let item = event.target;
        while ((item = item.parentElement) && !item.classList.contains('js-field'));
          item.classList.remove('is-marked');
      }
    },
    getFormattedSelectOption(term) {
      return DisplayUtil.getFormattedSelectOption(
        term, 
        this.settings, 
        this.resources.vocab, 
        this.resources.context
      );
    },
    setFilter($event, keyword) {
      let valuesArray = [];
      let values;

      if ($event['value'] !== null && typeof $event['value'] === 'object') {
        values = Object.assign({}, { ['value'] : $event['value']});
        valuesArray = Object.values(values.value)
      } else {
        valuesArray.push($event['value']);
      }
      
      this.currentSearchTypes = valuesArray;
      this.handleChange(keyword);
    },
    handleChange(value) {
      this.setSearching();
      this.searchMade = false;
      if (value) {
        setTimeout(() => {
          if (this.keyword === value) {
            this.search();
          }
        }, this.debounceTimer);
      } else {
        this.searchResult = [];
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
    add(event) {
      this.actionHighlight(false, event);
      if (this.isEnumeration) {
        this.addItem({'@id': ''});
      } else if (this.isVocabField) {
        this.addItem('');
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
      this.$store.dispatch('pushInspectorEvent', { 
        name: 'form-control', 
        value: 'close-modals'
      })
      .then(() => {
        this.$nextTick(() => {
          this.active = true;
          this.$nextTick(() => {
            this.resetSearch();
            // this.$store.dispatch('setStatusValue', { 
            //   property: 'keybindState', 
            //   value: 'entity-adder' 
            // });
            if (this.$refs.input) {
              this.$refs.input.focus();
            }
          });
        });
      });
    },
    hide() {
      if (!this.active) return;
      this.active = false;
      // this.$store.dispatch('setStatusValue', { 
      //   property: 'keybindState', 
      //   value: 'overview' 
      // });
    },
    resetSearch() {
      this.keyword = '';
      this.currentSearchTypes = this.getRange;
      this.searchResult = [];
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
      this.$store.dispatch('setInspectorStatusValue', { 
        property: 'lastAdded', 
        value: `${this.path}.{"@id":"${obj['@id']}"}` 
      });
      this.$store.dispatch('updateInspectorData', {
        changeList: [
          {
            path: `${this.path}`,
            value: currentValue,
          }
        ],
        addToHistory: true,
      });
      // this.hide();
    },
    addItem(obj) {
      let currentValue = _.cloneDeep(_.get(this.inspector.data, this.path));
      if (currentValue === null) {
        currentValue = obj;
      } else if (!_.isArray(currentValue)) {
        currentValue = [currentValue];
        currentValue.push(obj);
      } else {
        if(typeof obj.length !== "undefined" && _.isArray(obj) ) {
          obj.forEach(function(subObj) {
            currentValue.push(subObj);
          });
        } else {
          currentValue.push(obj);
        }
      }
      this.$store.dispatch('setInspectorStatusValue', { 
        property: 'lastAdded', 
        value: `${this.path}[${currentValue.length -1}]`
      });
      this.$store.dispatch('updateInspectorData', {
        changeList: [
          {
            path: `${this.path}`,
            value: currentValue,
          }
        ],
        addToHistory: true,
      });
    },
    addSibling(obj) {
      const linkObj = { '@id': `${this.inspector.data.record['@id']}#work` };
      const workObj = obj;
      const workType = workObj['@type'];
      workObj['@id'] = linkObj['@id'];

      this.$store.dispatch('setInspectorStatusValue', { 
        property: 'lastAdded', 
        value: 'work'
      });

      this.$store.dispatch('updateInspectorData', {
        changeList: [
          {
            path: `${this.path}`,
            value: linkObj,
          },
          {
            path: 'work',
            value: workObj,
          }
        ],
        addToHistory: true,
      });
    },
    addEmpty(typeId) {
      this.hide();
      const shortenedType = StringUtil.getCompactUri(typeId, this.resources.context);
      let obj = {'@type': shortenedType};
      if (StructuredValueTemplates.hasOwnProperty(shortenedType)) {
        obj = _.cloneDeep(StructuredValueTemplates[shortenedType]);
      }
      // If this is a holding, add the heldBy property
      if (obj['@type'] === 'Item') {
        obj['heldBy'] = {
          '@id': `https://libris.kb.se/library/${this.user.settings.activeSigel}`
        };
      }

      if (this.fieldKey === 'instanceOf') {
        this.addSibling(obj);
      } else {
        this.addItem(obj);
      }
    },
    addType(typeId) {
      const shortenedType = StringUtil.convertToPrefix(typeId, this.resources.context);
      this.addEmpty(shortenedType);
      this.dismissTypeChooser();
    },
    loadResults(result) {
      this.searchResult = result.items;
      this.numberOfPages = Math.floor(result.totalItems/this.maxResults);
      this.loading = false;
    },
    go(n) {
      if (n >= 0 && n <= this.numberOfPages && n !== this.currentPage) {
        this.fetch(n);
      }
    },
    fetch(pageNumber) {
      const self = this;
      const totalItems = self.searchResult.length;
      self.currentPage = pageNumber;
      self.loading = true;
     // console.log('fetching page', this.currentPage);
      this.getItems(this.keyword).then((result) => {
        self.loadResults(result);
      }, (error) => {
        self.loading = false;
      });
    },
    search() {
      const self = this;
      this.typeArray = [].concat(this.currentSearchTypes);
      self.searchResult = [];
      self.searchMade = true;
      this.fetch(0);
    },
    getItems(keyword) {
      // TODO: Support asking for more items
      const typeArray = this.typeArray;
      const searchKey = keyword !== '*' ? `${keyword}*` : keyword;
      let searchUrl = `${this.settings.apiPath}/find.json?q=${searchKey}`;
      if (typeof typeArray !== 'undefined' && typeArray.length > 0) {
        for (const type of typeArray) {
          searchUrl += `&@type=${type}`;
        }
      }
      const offset = this.currentPage * this.maxResults;
      searchUrl += `&_limit=${this.maxResults}&_offset=${offset}`;
      searchUrl = encodeURI(searchUrl);
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
    <!-- Adds another empty field of the same type -->
    <div class="EntityAdder-add"
      v-if="isPlaceholder && !addEmbedded">
        <i 
          class="fa fa-plus-circle icon icon--sm" 
          tabindex="0"
          aria-hidden="true"
          ref="adderFocusElement"
          @click="add($event)" 
          @keyup.enter="add($event)"
          @mouseenter="showToolTip = true, actionHighlight(true, $event)" 
          @mouseleave="showToolTip = false, actionHighlight(false, $event)"
          @focus="showToolTip = true, actionHighlight(true, $event)"
          @blur="showToolTip = false, actionHighlight(false, $event)">
          <tooltip-component 
            :show-tooltip="showToolTip" 
            :tooltip-text="tooltipText"></tooltip-component>
        </i>
    </div>      

    <!-- Add entity within field -->
    <div class="EntityAdder-add action-button" v-if="!isPlaceholder && !addEmbedded">
      <i 
        class="EntityAdder-addIcon fa fa-plus-circle icon icon--sm" 
        tabindex="0"
        ref="adderFocusElement"
        v-on:click="add($event)" 
        @keyup.enter="add($event)"
        @mouseenter="showToolTip = true, actionHighlight(true, $event)" 
        @mouseleave="showToolTip = false, actionHighlight(false, $event)"
        @focus="showToolTip = true, actionHighlight(true, $event)"
        @blur="showToolTip = false, actionHighlight(false, $event)">
        <tooltip-component 
          :show-tooltip="showToolTip" 
          :tooltip-text="tooltipText"></tooltip-component>
      </i>
      <span class="EntityAdder-addLabel label-text">{{ addLabel | labelByLang | capitalize }}</span>
    </div>
    <portal :to="`typeSelect-${path}`">
      <div class="EntityAdder-typeChooser" 
        v-if="addEmbedded">
        <select class="EntityAdder-typeSelect customSelect" 
          v-model="selectedType" 
          ref="adderTypeSelect"
          @change="addType(selectedType, true)">
          <option disabled value="">{{"Choose type" | translatePhrase}}</option>
          <option v-for="(term, index) in getClassTree"  
            v-html="getFormattedSelectOption(term, settings, resources.vocab, resources.context)"
            :disabled="term.abstract" 
            :key="`${term.id}-${index}`" 
            :value="term.id"></option>
        </select>
      </div>
    </portal>
    <portal to="sidebar" v-if="active">
      <panel-component class="EntityAdder-panel EntityAdderPanel" 
        v-if="active"
        :title="computedTitle"
        @close="hide">
        <template slot="panel-header-info">
          <div 
            class="PanelComponent-headerInfo" 
            v-if="getFullRange.length > 0" 
            @mouseleave="rangeInfo = false">
            <i class="fa fa-info-circle icon icon--md" @mouseenter="rangeInfo = true"></i>
            <div class="PanelComponent-headerInfoBox" v-show="rangeInfo">
              <p class="header">
                {{ "Allowed types" | translatePhrase }}:
              </p>
              <span v-for="(range, index) in getFullRange" :key="index">
                • {{range | labelByLang}}
              </span>
            </div>
          </div>
        </template>
        <template slot="panel-header-extra">
          <!-- <div class="EntityAdder-panelBody"> -->
          <div class="EntityAdder-controls">
            <div class="EntityAdder-controlForm">
              <div class="EntityAdder-search">
                <label for="entityKeywordInput" class="EntityAdder-searchLabel">{{ "Search" | translatePhrase }}</label>
                <div class="EntityAdder-searchInputContainer panel">
                  <input class="EntityAdder-searchInput entity-search-keyword-input customInput form-control"
                    name="entityKeywordInput"
                    v-model="keyword"
                    ref="input"
                    placeholder="Sök"
                    autofocus />
                    <filter-select class="EntityAdder-filterSearchInput FilterSelect--insideInput"
                      :class-name="'js-filterSelect'"
                      :custom-placeholder="'All types:'"
                      :options="selectOptions"
                      :options-all="getRange"
                      :is-filter="true"
                      :options-selected="''"
                      v-on:filter-selected="setFilter($event, keyword)"></filter-select>
                </div>
              </div>
            </div>
            
          </div>
        </template>
        <template slot="panel-body">
          <panel-search-list class="EntityAdder-searchResult"
            v-if="!loading && keyword.length > 0" 
            :path="path" 
            :results="searchResult" 
            :disabled-ids="alreadyAdded"
            :is-compact="isCompact"
            icon="plus"
            text="Add"
            :has-action="true"
            @use-item="addLinkedItem">
          </panel-search-list>
          <div class="PanelComponent-searchStatus" v-if="!loading && keyword.length === 0" >
            {{ "Start writing to begin search" | translatePhrase }}...
          </div>
          <div v-if="loading" class="PanelComponent-searchStatus">
            <vue-simple-spinner size="large" :message="'Searching' | translatePhrase"></vue-simple-spinner>
          </div>
          <div class="PanelComponent-searchStatus"
            v-if="!loading && searchResult.length === 0 && keyword.length > 0 && searchMade">
            {{ "No results" | translatePhrase }}
          </div>
        <!-- </div> -->
        </template>
        <template slot="panel-footer">
          
          <div class="EntityAdder-resultControls" v-if="!loading && searchResult.length > 0">
            <modal-pagination
              @go="go" 
              :numberOfPages="numberOfPages" 
              :currentPage="currentPage">
            </modal-pagination>
            <div class="EntityAdder-listTypes">
              <i class="fa fa-th-list icon icon--sm"
                @click="isCompact = false"
                @keyup.enter="isCompact = false"
                :class="{'icon--primary' : !isCompact}"
                :title="'Detailed view' | translatePhrase"
                tabindex="0"></i>
              <i class="fa fa-list icon icon--sm"
                @click="isCompact = true"
                @keyup.enter="isCompact = true"
                :class="{'icon--primary' : isCompact}"
                :title="'Compact view' | translatePhrase"
                tabindex="0"></i>
            </div>
          </div>
          <div class="EntityAdder-create">
            <button class="EntityAdder-createBtn btn btn-primary btn--sm"
              v-if="hasSingleRange" 
              v-on:click="addEmpty(getFullRange[0])">{{ "Create local entity" | translatePhrase }}
            </button>
            <filter-select
              v-if="!hasSingleRange" 
              :class-name="'js-createSelect'"
              :options="selectOptions"
              :options-all="getRange"
              :is-filter="false"
              :custom-placeholder="'Create local entity:'"
              v-on:filter-selected="addType($event.value)"></filter-select>
          </div>
        </template>
      </panel-component>
    </portal>
  </div>
</template>

<style lang="less">

.EntityAdder {
  &-panelBody {
    margin-bottom: 100px;
  }
  &.is-innerAdder {
    cursor: pointer;
  }

  &-resultControls {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    padding: 0 10px;
  }

  &-listTypes {
    display: flex;
    justify-content: space-between;
    height: 20px;
    height: fit-content;
    width: 45px;
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
    // text-align: center;
  }

  &-typeSelect {
    max-width: 150px;
  }

  &-controls {
    line-height: 1.2;
    width: 100%;
    margin: 0 0 10px 0;
  }

  &-controlForm {
    align-items: center;
    display: flex;
    flex-direction: column;
  }

  &-searchLabel {
    margin: 8px 10px 0 0;
    position: absolute;
  }

  &-search {
    width: 100%;
    display: flex;
  }

  &-searchInputContainer {
    flex: 1;
    position: relative;
    margin-bottom: 0;
  }

  &-filterSearchInput {
    margin-left: 5px;
    position: absolute;
    left: auto;
    right: 5px;
    width: 50%;
    top: 6px;
  }

  &-searchInput {
  }

  &-searchSelect {
    position: absolute;
    right: 0;
    margin: 6px 25px;
    max-width: 200px;
  }

  &-create {
    width: 100%;
    display: flex;
    justify-content: flex-end;
    padding: 10px 15px;
  }

  &-createBtn {
  }

  &-createSelect {
    display: block;
  }

  &-searchStatusIcon {
    font-size: 80px; 
    font-size: 8rem; 
    margin: 10px 0 0;
  }

  &-searchResult {
    padding: 0 0 0 0;
  }

}
.PanelSearchResult {
  &-fetchMore {
    text-align: center;
  }
}

</style>
