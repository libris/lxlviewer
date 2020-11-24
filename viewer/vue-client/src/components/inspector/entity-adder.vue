<script>
/*
  Controls add new entity button and add entity modal with it's content
*/
import { cloneDeep, isArray, get } from 'lodash-es';
import VueSimpleSpinner from 'vue-simple-spinner';
import * as VocabUtil from '@/utils/vocab';
import * as DisplayUtil from '@/utils/display';
import * as StringUtil from '@/utils/string';
import PanelSearchList from '../search/panel-search-list.vue';
import Sort from '@/components/search/sort';
import PanelComponent from '@/components/shared/panel-component.vue';
import ModalPagination from '@/components/inspector/modal-pagination.vue';
import FilterSelect from '@/components/shared/filter-select.vue';
import TypeSelect from '@/components/inspector/type-select.vue';
import ParamSelect from '@/components/inspector/param-select.vue';
import LensMixin from '@/components/mixins/lens-mixin.vue';
import { buildQueryString } from '@/utils/http';

export default {
  mixins: [LensMixin],
  data() {
    return {
      searchResult: [],
      keyword: '',
      loading: false,
      debounceTimer: 500,
      rangeInfo: false,
      addEmbedded: false,
      searchMade: false,
      currentSearchTypes: [],
      currentSearchParam: null,
      reset: 0,
      active: false,
      currentPage: 0,
      maxResults: 20,
      sort: '',
      isCompact: false,
    };
  },
  props: {
    fieldKey: {
      type: String,
      default: '',
    },
    allowLocal: {
      type: Boolean,
      default: true,
    },
    allSearchTypes: {
      type: Array,
      default: () => [],
    },
    allValuesFrom: {
      type: Array,
      default: () => [],
    },
    someValuesFrom: {
      type: Array,
      default: () => [],
    },
    range: {
      type: Array,
      default: () => [],
    },
    rangeFull: {
      type: Array,
      default: () => [],
    },
    propertyTypes: {
      type: Array,
      default: () => [],
    },
    compositional: null,
    showActionButtons: {
      type: Boolean,
      default: false,
    },
    isPlaceholder: {
      type: Boolean,
      default: false,
    },
    isChip: {
      type: Boolean,
      default: false,
    },
    path: {
      type: String,
      default: '',
    },
    alreadyAdded: {
      type: Array,
      default: () => [],
    },
    valueList: {
      type: Array,
      default: () => [],
    },
    possibleValues: [],
    hasRescriction: {
      type: Boolean,
      default: false,
    },
    entityType: {
      type: String,
      default: '',
    },
  },
  components: {
    'panel-component': PanelComponent,
    'panel-search-list': PanelSearchList,
    'modal-pagination': ModalPagination,
    'filter-select': FilterSelect,
    'type-select': TypeSelect,
    'param-select': ParamSelect,
    'vue-simple-spinner': VueSimpleSpinner,
    sort: Sort,
  },
  watch: {
    'inspector.event'(val) {
      if (val.name === 'modal-control') {
        switch (val.value) {
          case 'close-entity-adder':
            this.hide();
            break;
          default:
        }
      } else if (val.name === 'form-control') {
        switch (val.value) {
          case 'close-modals':
            this.hide();
            break;
          case 'focus-changed':
            this.hide();
            break;
          default:
        }
      }
    },
    valueList(newVal) {
      if (newVal.length === 0 && this.onlyEmbedded && this.rangeFull.length > 1) {
        this.addEmbedded = true;
      } else {
        this.addEmbedded = false;
      }
    },
    keyword(value) {
      this.handleChange(value);
    },
    active(value) {
      if (!value) {
        this.$refs.adderFocusElement.focus();
      }
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
    filterPlaceHolder() {
      return 'All types';
    },
    selectOptions() {
      const classTree = this.getClassTree;
      const options = [];

      for (let i = 0; i < classTree.length; i++) {
        const term = {};
        term.depth = classTree[i].depth;
        term.abstract = classTree[i].abstract;
        term.label = this.getLabelWithTreeDepth(classTree[i]);
        term.value = classTree[i].id;
        term.key = `${classTree[i].id}-${i}`;
        options.push(term);
      }
      return options;
    },
    priorityOptions() {
      const list = this.allValuesFrom.length > 1 ? this.allValuesFrom : this.someValuesFrom;
      return list;
    },
    computedTitle() {
      const modalStr = StringUtil.getUiPhraseByLang('Add entity', this.user.settings.language);
      const addLabelStr = StringUtil.getLabelByLang(this.addLabel, this.user.settings.language, this.resources.vocab, this.resources.context);
      return `${modalStr} | ${addLabelStr}`;
    },
    getClassTree() {
      let treeSource = this.range;
      if (this.allValuesFrom.length > 0) {
        treeSource = this.allValuesFrom;
      }
      const tree = treeSource.map(type => VocabUtil.getTree(
        type,
        this.resources.vocab,
        this.resources.context,
      ));
      return VocabUtil.flattenTree(
        tree,
        this.resources.vocab,
        this.resources.context,
        this.user.settings.language,
      );
    },
    tooltipText() {
      const addText = StringUtil.getUiPhraseByLang('Add', this.user.settings.language);
      const label = StringUtil.getLabelByLang(
        this.addLabel,
        this.user.settings.language,
        this.resources.vocab,
        this.resources.context,
      );

      return `${addText} ${label.toLowerCase()}`;
    },
    hasSingleRange() {
      return this.rangeFull.length === 1;
    },
    isVocabField() {
      return VocabUtil.getContextValue(this.fieldKey, '@type', this.resources.context) === '@vocab';
    },
    addLabel() {
      if (this.isLiteral) {
        return this.fieldKey;
      }
      if (this.rangeFull.length === 1) {
        return this.rangeFull[0];
      }
      if (this.rangeFull.length > 1) {
        return StringUtil.getUiPhraseByLang('entity', this.user.settings.language);
      }
      return this.fieldKey;
    },
    onlyEmbedded() {
      if (this.compositional === true) {
        return true;
      }
      const range = this.rangeFull;
      for (const classId of range) {
        if (!VocabUtil.isEmbedded(
          classId,
          this.resources.vocab,
          this.settings,
          this.resources.context,
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
      if (this.rangeFull.length > 0) {
        for (const rangeElement of this.rangeFull) {
          if (rangeElement.indexOf('Literal') > -1) {
            return true;
          }
        }
      }
      return false;
    },
  },
  mounted() {
    this.addEmbedded = (this.valueList.length === 0 && this.onlyEmbedded && this.rangeFull.length > 1);
  },
  methods: {
    actionHighlight(active, event) {
      if (active) {
        let item = event.target;
        while ((item = item.parentElement) && !item.classList.contains('js-field'));
        item.classList.add('is-marked');
      } else {
        let item = event.target;
        while ((item = item.parentElement) && !item.classList.contains('js-field'));
        item.classList.remove('is-marked');
      }
    },
    getLabelWithTreeDepth(term) {
      return DisplayUtil.getLabelWithTreeDepth(
        term,
        this.settings,
        this.resources.vocab,
        this.resources.context,
      );
    },
    setFilter($event) {
      let valuesArray = [];
      let values;

      if ($event.value !== null && typeof $event.value === 'object') {
        values = Object.assign({}, { value: $event.value });
        valuesArray = Object.values(values.value);
      } else {
        valuesArray.push($event.value);
      }

      this.currentSearchTypes = valuesArray;

      if (this.keyword) {
        this.search();
      }
    },
    setParam($event) {
      this.currentSearchParam = $event;
      if (this.keyword) {
        this.search();
      }
    },
    handleChange(value) {
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
    dismissTypeChooser() {
      if (this.valueList.length > 0) {
        this.addEmbedded = false;
      }
    },
    add(event) {
      this.actionHighlight(false, event);
      if (this.isEnumeration) {
        this.addItem({ '@id': '' });
      } else if (this.isVocabField) {
        this.addItem('');
      } else if (this.canRecieveObjects) {
        const range = this.rangeFull;
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
        value: 'close-modals',
      })
        .then(() => {
          this.$nextTick(() => {
            this.active = true;
            this.$nextTick(() => {
              this.resetSearch();
              this.search();
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
    },
    resetSearch() {
      this.keyword = '';
      this.searchMade = false;
      this.currentSearchTypes = this.allSearchTypes;
      this.searchResult = [];
      // TODO: other way force param-select to set select value?
      this.reset += 1;
    },
    addLinkedItem(obj) {
      let currentValue = cloneDeep(get(this.inspector.data, this.path));
      if (!isArray(currentValue)) {
        // Converting value to array if it isn't already
        if (currentValue !== null) {
          currentValue = [currentValue];
        } else {
          currentValue = [];
        }
      }
      const linkObj = { '@id': obj['@id'] };
      currentValue.push(linkObj);
      this.$store.dispatch('addToQuoted', obj);
      this.$store.dispatch('setInspectorStatusValue', {
        property: 'lastAdded',
        value: `${this.path}.{"@id":"${obj['@id']}"}`,
      });
      this.$store.dispatch('updateInspectorData', {
        changeList: [
          {
            path: `${this.path}`,
            value: currentValue,
          },
        ],
        addToHistory: true,
      });
      // this.hide();
    },
    addItem(obj) {
      let currentValue = cloneDeep(get(this.inspector.data, this.path));
      if (currentValue === null) {
        currentValue = obj;
      } else if (!isArray(currentValue)) {
        currentValue = [currentValue];
        currentValue.push(obj);
      } else if (typeof obj.length !== 'undefined' && isArray(obj)) {
        obj.forEach((subObj) => {
          currentValue.push(subObj);
        });
      } else {
        currentValue.push(obj);
      }
      let index = '';
      if (currentValue.length) {
        index = `[${currentValue.length - 1}]`;
      }
      this.$store.dispatch('setInspectorStatusValue', {
        property: 'lastAdded',
        value: `${this.path}${index}`,
      });
      this.$store.dispatch('updateInspectorData', {
        changeList: [
          {
            path: `${this.path}`,
            value: currentValue,
          },
        ],
        addToHistory: true,
      });
    },
    addSibling(obj) {
      const linkObj = { '@id': `${this.inspector.data.record['@id']}#work` };
      const workObj = obj;
      workObj['@id'] = linkObj['@id'];

      this.$store.dispatch('setInspectorStatusValue', {
        property: 'lastAdded',
        value: 'work',
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
          },
        ],
        addToHistory: true,
      });
    },
    addEmpty(typeId) {
      this.hide();
      const templates = require('@/resources/json/structuredValueTemplates.json');
      const shortenedType = StringUtil.getCompactUri(typeId, this.resources.context);
      let obj = { '@type': shortenedType };
      if (templates.hasOwnProperty(shortenedType)) {
        obj = cloneDeep(templates[shortenedType]);
      }
      // If this is a holding, add the heldBy property
      if (obj['@type'] === 'Item') {
        obj.heldBy = {
          '@id': this.user.getActiveLibraryUri(),
        };
      }
      this.addItem(obj);
    },
    addType(typeId) {
      const shortenedType = StringUtil.convertToPrefix(typeId, this.resources.context);
      this.addEmpty(shortenedType);
      this.dismissTypeChooser();
    },
    loadResults(result) {
      this.searchResult = result.items;
      this.totalItems = result.totalItems;
      this.loading = false;
    },
    go(n) {
      this.fetch(n);
    },
    fetch(pageNumber) {
      const self = this;
      self.currentPage = pageNumber;
      self.loading = true;
      this.getItems(this.keyword).then((result) => {
        self.loadResults(result);
      }, () => {
        self.loading = false;
      });
    },
    search() {
      const self = this;
      this.loading = true;
      this.typeArray = [].concat(this.currentSearchTypes);
      self.searchResult = [];
      self.searchMade = true;
      this.fetch(0);
    },
    getSearchPhrase(keyword) {
      let q = '';
      if (keyword === '') {
        q = '*';
      } else if (keyword.match(/[|~*+"]/) || keyword.match(/^-| -/)) {
        // User is using operators, accept their keyword as-is
        q = keyword;
      } else {
        // Add wildcard if user is not using operators
        q = `${keyword} | ${keyword}*`;
      }
      return q;
    },
    getSearchParams(searchPhrase) {
      if (this.currentSearchParam == null) {
        return { q: searchPhrase };
      }

      const params = Object.assign({}, this.currentSearchParam.mappings || {});
      this.currentSearchParam.searchProps.forEach((param) => { params[param] = searchPhrase; });
      return params;
    },
    getItems(keyword) {
      let params = this.getSearchParams(this.getSearchPhrase(keyword));
      params = Object.assign(params, {
        _limit: this.maxResults,
        _offset: this.currentPage * this.maxResults,
        _sort: this.sort,
      });

      if (typeof this.typeArray !== 'undefined' && this.typeArray.length > 0) {
        params['@type'] = this.typeArray;
      }

      const searchUrl = `${this.settings.apiPath}/find.jsonld?${buildQueryString(params)}`;
      return new Promise((resolve, reject) => {
        fetch(searchUrl).then((response) => {
          resolve(response.json());
        }, (error) => {
          reject('Error searching...', error);
        });
      });
    },
    setSort($event) {
      this.sort = $event;
      if (this.keyword) {
        this.search();
      }
    },
  },
};
</script>

<template>
  <div class="EntityAdder" :class="{'is-innerAdder': isPlaceholder, 'is-fillWidth': addEmbedded}">
    <!-- Adds another empty field of the same type -->
    <div class="EntityAdder-add"
      v-if="isPlaceholder">
        <i class="fa fa-plus-circle fa-fw icon icon--sm"
          v-if="!addEmbedded"
          tabindex="0"
          role="button"
          :aria-label="tooltipText | translatePhrase"
          ref="adderFocusElement"
          v-tooltip.left="tooltipText"
          @click="add($event)"
          @keyup.enter="add($event)"
          @mouseenter="actionHighlight(true, $event)"
          @mouseleave="actionHighlight(false, $event)"
          @focus="actionHighlight(true, $event)"
          @blur="actionHighlight(false, $event)">
        </i>
        <i class="fa fa-plus-circle fa-fw icon icon--sm is-disabled"
          v-else-if="addEmbedded"
          tabindex="-1"
          aria-hidden="true">
        </i>
    </div>

    <!-- Add entity within field -->
    <div class="EntityAdder-add action-button" v-if="!isPlaceholder">
      <i
        class="fa fa-fw fa-plus-circle icon icon--sm"
        v-if="!addEmbedded"
        tabindex="0"
        role="button"
        ref="adderFocusElement"
        :aria-label="tooltipText | translatePhrase"
        v-on:click="add($event)"
        @keyup.enter="add($event)"
        v-tooltip.top="tooltipText"
        @mouseenter="actionHighlight(true, $event)"
        @mouseleave="actionHighlight(false, $event)"
        @focus="actionHighlight(true, $event)"
        @blur="actionHighlight(false, $event)">
      </i>
      <i
        class="fa fa-plus-circle fa-fw icon icon--sm is-disabled"
        v-else-if="addEmbedded"
        tabindex="-1">
      </i>
      <span class="EntityAdder-addLabel label-text">{{ addLabel | labelByLang | capitalize }}</span>
    </div>
    <portal :to="`typeSelect-${path}`">
      <type-select
        v-if="addEmbedded"
        :classTree="getClassTree"
        :options="selectOptions"
        :removeable="valueList.length > 0"
        @selected="addType($event)"
        @dismiss="dismissTypeChooser()" />
    </portal>
    <portal to="sidebar" v-if="active">
      <panel-component class="EntityAdder-panel EntityAdderPanel"
        v-if="active"
        :title="computedTitle"
        @close="hide">
        <template slot="panel-header-info">
          <div
            class="PanelComponent-headerInfo"
            v-if="rangeFull.length > 0"
            @mouseleave="rangeInfo = false">
            <i class="fa fa-info-circle icon icon--md" @mouseenter="rangeInfo = true"></i>
            <div class="PanelComponent-headerInfoBox" v-show="rangeInfo">
              <p class="header">
                {{ "Allowed types" | translatePhrase }}:
              </p>
              <span v-for="(range, index) in rangeFull" :key="index">
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
                <label for="entityKeywordInput" class="EntityAdder-searchLabel sr-only">{{ "Search" | translatePhrase }}</label>
                <div class="EntityAdder-filterSearchContainer">
                  <div class="EntityAdder-filterSearchContainerItem">
                    <filter-select class="EntityAdder-filterSearchInput FilterSelect--openDown"
                      :class-name="'js-filterSelect'"
                      :label="'Show' | translatePhrase"
                      :custom-placeholder="filterPlaceHolder"
                      :options="{ tree: selectOptions, priority: priorityOptions }"
                      :options-all="allSearchTypes"
                      :options-all-suggested="someValuesFrom"
                      :is-filter="true"
                      :styleVariant="'material'"
                      v-on:filter-selected="setFilter($event)"></filter-select>
                  </div>
                  <div class="EntityAdder-filterSearchContainerItem">
                    <sort
                      :recordTypes="currentSearchTypes"
                      :commonSortFallback="true"
                      :currentSort="''"
                      :styleVariant="'material'"
                      @change="setSort($event)" />
                  </div>
                </div>
                <div class="EntityAdder-searchInputContainer">
                  <input class="EntityAdder-searchInput entity-search-keyword-input customInput"
                         id="entityKeywordInput"
                         name="entityKeywordInput"
                         v-model="keyword"
                         ref="input"
                         :aria-label="'Sök' | translatePhrase"
                         :placeholder="'Sök' | translatePhrase"
                         autofocus />
                  <param-select class="EntityAdder-paramSelect"
                                :types="currentSearchTypes"
                                :reset="reset"
                                :contextName="'EntityAdder'"
                                v-on:param-selected="setParam($event)"></param-select>
                </div>
              </div>
            </div>
          </div>
        </template>
        <template slot="panel-body">
          <panel-search-list class="EntityAdder-searchResult"
            v-if="!loading && searchMade"
            :path="path"
            :results="searchResult"
            :disabled-ids="alreadyAdded"
            :is-compact="isCompact"
            icon="plus"
            text="Add"
            :has-action="true"
            @use-item="addLinkedItem">
          </panel-search-list>
          <div class="PanelComponent-searchStatus" v-if="!loading && !searchMade" >
            {{ "Start writing to begin search" | translatePhrase }}...
          </div>
          <div v-if="loading" class="PanelComponent-searchStatus">
            <vue-simple-spinner size="large" :message="'Searching' | translatePhrase"></vue-simple-spinner>
          </div>
          <div class="PanelComponent-searchStatus"
            v-if="!loading && searchResult.length === 0 && searchMade">
            {{ "No results" | translatePhrase }}
          </div>
        <!-- </div> -->
        </template>
        <template slot="panel-footer">

          <div class="EntityAdder-resultControls" v-if="!loading && searchResult.length > 0">
            <modal-pagination
              @go="go"
              :total-items="totalItems"
              :max-per-page="maxResults"
              :current-page="currentPage"
            >
            </modal-pagination>
            <div class="EntityAdder-listTypes">
              <i class="fa fa-th-list icon icon--sm"
                role="button"
                @click="isCompact = false"
                @keyup.enter="isCompact = false"
                :class="{'icon--primary' : !isCompact}"
                :title="'Detailed view' | translatePhrase"
                tabindex="0"></i>
              <i class="fa fa-list icon icon--sm"
                role="button"
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
              v-on:click="addEmpty(rangeFull[0])">{{ "Create local entity" | translatePhrase }}
            </button>
            <filter-select
              v-if="!hasSingleRange"
              :input-id="'createselectInput'"
              :class-name="'js-createSelect'"
              :options="{ tree: selectOptions, priority: priorityOptions }"
              :options-all="allSearchTypes"
              :options-all-suggested="someValuesFrom"
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
    padding: 5px 10px 0 10px;
  }

  &-listTypes {
    display: flex;
    justify-content: space-between;
    height: 20px;
    height: fit-content;
    width: 45px;
  }

  &-add {
    color: @grey-dark;
    cursor: pointer;
    display: inline-block;
    opacity: 1;
    transition: opacity 0.5s ease;

    &:hover {
      color: @black;
    }
  }

  &-addLabel {
    display: none;
  }


  &-controls {
    // line-height: 1.2;
    width: 100%;
    margin: 0 0 0.5em 0;
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
  }

  &-searchInputContainer {
    display: flex;
    flex: 1;
    flex-direction: row;
    position: relative;
    margin-top: 0.5em;
    border: 1px solid @grey-lighter;
    border-radius: 0.2em;
  }

  &-searchInputContainer input {
    color: @black;
    background-color: @white;
    border: none;
    border-radius: 0;
  }

  &-paramSelect {
    border-left: 1px solid @grey-lighter;
    flex-basis: 30%;
  }

  &-filterSearchContainer {
    width: 100%;
    display: flex;
    flex-direction: column;

    @media (min-width: @screen-xs) {
      flex-direction: row;
    }
  }

  &-filterSearchContainerItem {
    width: 100%;
    margin: 0 1em 0 0;

    @media (min-width: @screen-xs) {
      width: 50%;
    }

    &:last-child {
      margin-right: 0;
    }
  }

  &-filterSearchLabel {

  }

  &-filterSearchInput {
    position: relative;
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
