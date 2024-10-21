<script>
/*
  Controls add new entity button and add entity modal with it's content
*/
import { cloneDeep, isArray, get } from 'lodash-es';
import { mapGetters } from 'vuex';
import * as VocabUtil from 'lxljs/vocab';
import * as StringUtil from 'lxljs/string';
import * as RecordUtil from '@/utils/record';
import Spinner from '@/components/shared/spinner.vue';
import PanelComponent from '@/components/shared/panel-component.vue';
import ModalPagination from '@/components/inspector/modal-pagination.vue';
import FilterSelect from '@/components/shared/filter-select.vue';
import TypeSelect from '@/components/inspector/type-select.vue';
import ParamSelect from '@/components/inspector/param-select.vue';
import LensMixin from '@/components/mixins/lens-mixin.vue';
import SideSearchMixin from '@/components/mixins/sidesearch-mixin.vue';
import templates from '@/resources/json/structuredValueTemplates.json';
import { translatePhrase, labelByLang, capitalize } from '@/utils/filters';
import Sort from '@/components/search/sort.vue';
import PanelSearchList from '../search/panel-search-list.vue';

export default {
  mixins: [LensMixin, SideSearchMixin],
  data() {
    return {
      rangeInfo: false,
      addEmbedded: false,
    };
  },
  props: {
    allowLocal: {
      type: Boolean,
      default: true,
    },
    propertyTypes: {
      type: Array,
      default: () => [],
    },
    compositional: {
      default: null,
    },
    isPlaceholder: {
      type: Boolean,
      default: false,
    },
    isChip: {
      type: Boolean,
      default: false,
    },
    isLanguage: {
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
    possibleValues: {
      default: () => [],
    },
    hasRescriction: {
      type: Boolean,
      default: false,
    },
    isLangTagger: {
      type: Boolean,
      default: false,
    },
    iconAdd: {
      type: String,
      default: 'fa-plus-circle',
    },
  },
  emits: ['langTaggerEvent', 'addEmptyLanguageItem'],
  components: {
    Spinner,
    'panel-component': PanelComponent,
    'panel-search-list': PanelSearchList,
    'modal-pagination': ModalPagination,
    'filter-select': FilterSelect,
    'type-select': TypeSelect,
    'param-select': ParamSelect,
    sort: Sort,
  },
  watch: {
    valueList(newVal) {
      if (newVal.length === 0 && this.onlyEmbedded && this.rangeFull.length > 1) {
        this.addEmbedded = true;
      } else {
        this.addEmbedded = false;
      }
    },
    active(value) {
      if (!value) {
        this.$refs.adderFocusElement.focus();
      }
    },
  },
  computed: {
    ...mapGetters([
      'resources',
    ]),
    computedTitle() {
      const modalStr = StringUtil.getUiPhraseByLang('Add entity', this.user.settings.language, this.resources.i18n);
      const addLabelStr = StringUtil.getLabelByLang(this.addLabel, this.user.settings.language, this.resources);
      return `${modalStr} | ${addLabelStr}`;
    },
    tooltipText() {
      const addText = StringUtil.getUiPhraseByLang('Add', this.user.settings.language, this.resources.i18n);
      const label = StringUtil.getLabelByLang(
        this.addLabel,
        this.user.settings.language,
        this.resources,
      );

      return `${addText} ${label.toLowerCase()}`;
    },
    hasSingleRange() {
      return this.rangeFull.length === 1;
    },
    rangeCreatable() {
      return this.rangeFull.filter((type) => !VocabUtil.isDistinct(
        type,
        this.resources.vocab,
        this.settings,
        this.resources.context,
      ));
    },
    hasSingleCreatable() {
      return this.rangeCreatable.length === 1;
    },
    hasCreateable() {
      return this.rangeCreatable.length > 0;
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
        return StringUtil.getUiPhraseByLang('entity', this.user.settings.language, this.resources.i18n);
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
    canReceiveObjects() {
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
    inBulkChangeView() {
      return this.$route.path.includes('bulkchanges');
    },
  },
  mounted() {
    this.addEmbedded = (this.valueList.length === 0 && this.onlyEmbedded && this.rangeFull.length > 1);
  },
  methods: {
    translatePhrase,
    labelByLang,
    capitalize,
    // TODO: dead code?
    getSearchParams(searchPhrase) {
      let params;
      if (this.currentSearchParam == null) {
        params = { q: searchPhrase };
      } else {
        params = Object.assign({}, this.currentSearchParam.mappings || {});
        this.currentSearchParam.searchProps.forEach((param) => { params[param] = searchPhrase; });
      }

      return params;
    },
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
      } else if (this.isLanguage) {
        this.$emit('addEmptyLanguageItem');
      } else if (this.canReceiveObjects) {
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
      if (this.fieldKey === 'shelfMark') {
        this.keyword = this.user ? this.user.settings.shelfMarkSearch : '';
      } else if (this.isLangTagger) {
        if (this.inspector.langTagSearch) {
          this.keyword = this.inspector.langTagSearch;
        } else {
          this.keyword = this.resourceLanguageLabel();
        }
      }
      this.searchMade = false;
      this.currentSearchTypes = this.allSearchTypes;
      this.searchResult = [];
      // TODO: other way force param-select to set select value?
      this.resetParamSelect += 1;
    },
    resourceLanguageLabel() {
      const getLanguage = () => {
        // TODO: detect language of resource in a better way?
        const langPath = ['mainEntity', 'instanceOf', 'language', 0, '@id'];
        const langId = get(this.inspector.data, langPath);
        if (langId) {
          let lang = (this.inspector.data.quoted || {})[langId];
          if (lang) {
            return lang;
          }
          lang = RecordUtil.recordObjectFromGraph(langId, this.inspector.data.quoted);
          if (lang) {
            return lang.mainEntity;
          }
        }
        return null;
      };
      const lang = getLanguage();
      if (lang) {
        return this.getLabel(lang);
      }
      return '';
    },
    addLinkedItem(obj) {
      if (this.isLangTagger) {
        let tag = obj.langTag; // IETF BCP 47
        if (typeof tag === 'undefined') {
          tag = obj.code;
        }
        this.$emit('langTaggerEvent', tag);
        this.hide();
        return;
      }
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

      if (!VocabUtil.propIsRepeatable(this.fieldKey, this.resources.context) && !currentValue.length) {
        currentValue = linkObj;
      } else {
        currentValue.push(linkObj);
      }
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
    addEmpty(typeId) {
      this.hide();
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
    search() {
      if (this.fieldKey === 'shelfMark' && this.user) {
        this.user.settings.shelfMarkSearch = this.keyword;
        this.$store.dispatch('setUser', this.user);
      } else if (this.isLangTagger && this.keyword !== this.resourceLanguageLabel()) {
        this.$store.dispatch('saveLangTagSearch', this.keyword);
      }
      const self = this;
      this.typeArray = [].concat(this.currentSearchTypes);
      self.searchResult = [];
      self.searchMade = true;
      this.fetch(0);
    },
    setSort($event) {
      this.sort = $event;
      this.search();
    },
  },
};
</script>

<template>
  <div class="EntityAdder" :class="{ 'is-innerAdder': isPlaceholder, 'is-fillWidth': addEmbedded }">
    <!-- Adds another empty field of the same type -->
    <div class="EntityAdder-add" v-if="isPlaceholder" v-tooltip.left="tooltipText">
      <i
        class="fa fa-fw icon icon--sm"
        :class="[this.iconAdd] "
        v-if="!addEmbedded"
        tabindex="0"
        role="button"
        :aria-label="translatePhrase(tooltipText)"
        ref="adderFocusElement"
        @click="add($event)"
        @keyup.enter="add($event)"
        @mouseenter="actionHighlight(true, $event)"
        @mouseleave="actionHighlight(false, $event)"
        @focus="actionHighlight(true, $event)"
        @blur="actionHighlight(false, $event)" />
      <i
        class="fa fa-fw icon icon--sm is-disabled"
        :class="[this.iconAdd] "
        v-else-if="addEmbedded"
        tabindex="-1"
        aria-hidden="true" />
    </div>

    <!-- Add entity within field -->
    <div class="EntityAdder-add action-button" v-if="!isPlaceholder" v-tooltip.top="tooltipText">
      <i
        class="fa fa-fw icon icon--sm"
        :class="[this.iconAdd] "
        v-if="!addEmbedded"
        tabindex="0"
        role="button"
        ref="adderFocusElement"
        :aria-label="translatePhrase(tooltipText)"
        v-on:click="add($event)"
        @keyup.enter="add($event)"
        @mouseenter="actionHighlight(true, $event)"
        @mouseleave="actionHighlight(false, $event)"
        @focus="actionHighlight(true, $event)"
        @blur="actionHighlight(false, $event)" />
      <i
        class="fa fa-fw icon icon--sm is-disabled"
        :class="[this.iconAdd] "
        v-else-if="addEmbedded"
        tabindex="-1" />
      <span class="EntityAdder-addLabel label-text">{{ capitalize(labelByLang(addLabel)) }}</span>
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
      <panel-component
        class="EntityAdder-panel EntityAdderPanel"
        v-if="active"
        :title="computedTitle"
        @close="hide">
        <template #panel-header-info>
          <div
            class="PanelComponent-headerInfo"
            v-if="rangeFull.length > 0"
            @mouseleave="rangeInfo = false">
            <i class="fa fa-info-circle icon icon--md" @mouseenter="rangeInfo = true" />
            <div class="PanelComponent-headerInfoBox" v-show="rangeInfo">
              <p class="header">
                {{ translatePhrase("Allowed types") }}:
              </p>
              <span v-for="(range, index) in rangeFull" :key="index">
                • {{ labelByLang(range) }}
              </span>
            </div>
          </div>
        </template>
        <template #panel-header-extra>
          <!-- <div class="EntityAdder-panelBody"> -->
          <div class="EntityAdder-controls">
            <div class="EntityAdder-controlForm">
              <div class="EntityAdder-search">
                <label for="entityKeywordInput" class="EntityAdder-searchLabel sr-only">{{ translatePhrase("Search") }}</label>
                <div class="EntityAdder-filterSearchContainer">
                  <div class="EntityAdder-filterSearchContainerItem">
                    <filter-select
                      class="EntityAdder-filterSearchInput FilterSelect--openDown"
                      :class-name="'js-filterSelect'"
                      :label="translatePhrase('Show')"
                      :custom-placeholder="filterPlaceHolder"
                      :options="{ tree: selectOptions, priority: priorityOptions }"
                      :options-all="allSearchTypes"
                      :options-all-suggested="someValuesFrom"
                      :is-filter="true"
                      :styleVariant="'material'"
                      v-on:filter-selected="setFilter($event)" />
                  </div>
                  <div class="EntityAdder-filterSearchContainerItem">
                    <sort
                      :recordTypes="currentSearchTypes"
                      :commonSortFallback="true"
                      :currentSort="sort"
                      :styleVariant="'material'"
                      @change="setSort($event)" />
                  </div>
                </div>
                <div class="EntityAdder-searchInputContainer">
                  <input
                    class="EntityAdder-searchInput entity-search-keyword-input customInput"
                    id="entityKeywordInput"
                    name="entityKeywordInput"
                    v-model="keyword"
                    ref="input"
                    :aria-label="translatePhrase('Sök')"
                    :placeholder="translatePhrase('Sök')"
                    autofocus />
                  <param-select
                    class="EntityAdder-paramSelect"
                    :types="currentSearchTypes"
                    :reset="resetParamSelect"
                    :userPrefKey="'EntityAdder'"
                    v-on:param-selected="setParam($event)" />
                </div>
              </div>
            </div>
          </div>
        </template>
        <template #panel-body>
          <panel-search-list
            class="EntityAdder-searchResult"
            v-if="!searchInProgress && searchMade"
            :path="path"
            :results="searchResult"
            :disabled-ids="alreadyAdded"
            :is-compact="isCompact"
            icon="plus"
            text="Add"
            :has-action="true"
            @use-item="addLinkedItem" />
          <div class="PanelComponent-searchStatus" v-if="!searchInProgress && !searchMade">
            {{ translatePhrase("Start writing to begin search") }}...
          </div>
          <div v-if="searchInProgress" class="PanelComponent-searchStatus">
            <Spinner size="2x" :message="translatePhrase('Searching')" />
          </div>
          <div
            class="PanelComponent-searchStatus"
            v-if="!searchInProgress && searchResult.length === 0 && searchMade">
            {{ translatePhrase("No results") }}
          </div>
        <!-- </div> -->
        </template>
        <template #panel-footer>

          <div class="EntityAdder-resultControls" v-if="!searchInProgress && searchResult.length > 0">
            <modal-pagination
              @go="go"
              :total-items="totalItems"
              :max-items="maxItems"
              :max-per-page="maxResults"
              :current-page="currentPage"
            />
            <div class="EntityAdder-listTypes">
              <i
                class="fa fa-th-list icon icon--sm"
                role="button"
                @click="isCompact = false"
                @keyup.enter="isCompact = false"
                :class="{ 'icon--primary': !isCompact }"
                :title="translatePhrase('Detailed view')"
                tabindex="0" />
              <i
                class="fa fa-list icon icon--sm"
                role="button"
                @click="isCompact = true"
                @keyup.enter="isCompact = true"
                :class="{ 'icon--primary': isCompact }"
                :title="translatePhrase('Compact view')"
                tabindex="0" />
            </div>
          </div>
          <div class="EntityAdder-create">
            <button
              class="EntityAdder-createBtn btn btn-primary btn--sm"
              v-if="hasSingleCreatable && allowLocal && !inBulkChangeView"
              v-on:click="addEmpty(rangeCreatable[0])">{{ translatePhrase("Create local entity") }}
            </button>
            <button
              class="EntityAdder-createBtn btn btn-primary btn--sm"
              v-if="inBulkChangeView && hasCreateable && allowLocal"
              v-on:click="addEmpty('Any')">{{ translatePhrase("Create local entity") }}
            </button>
            <filter-select
              v-if="!hasSingleCreatable && !inBulkChangeView"
              :input-id="'createselectInput'"
              :class-name="'js-createSelect'"
              :options="{ tree: selectOptions, priority: priorityOptions }"
              :options-all="rangeCreatable"
              :options-all-suggested="rangeCreatable"
              :is-filter="false"
              :custom-placeholder="'Create local entity:'"
              v-on:filter-selected="addType($event.value)" />
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
    background-color: @white;
    border: 1px solid @grey-lighter;
    border-radius: 0.2em;
  }

  &-searchInputContainer input {
    color: @black;
    background-color: @white;
    border: none;
    margin-right: 2px; // make tab-focus border look ok
    border-radius: 0;
  }

  &-searchInputContainer select {
    border-radius: 0;
  }

  &-paramSelect {
    border-left: 1px solid @grey-lighter;
    flex-basis: 33%;
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
