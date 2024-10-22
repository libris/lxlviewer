<script>
import { isEmpty, cloneDeep, isArray } from 'lodash-es';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { mapGetters } from 'vuex';
import * as StringUtil from 'lxljs/string';
import PropertyMappings from '@/resources/json/propertymappings.json';
import { buildQueryString } from '@/utils/http';
import { translatePhrase } from '@/utils/filters';
import RemoteDatabases from '@/components/search/remote-databases.vue';

export default {
  name: 'search-form',
  props: {
    searchPerimeter: {
      default: 'libris',
      type: String,
    },
    searchTool: {
      default: '',
      type: String,
    },
  },
  data() {
    return {
      searchGroupFocus: {
        typeSelect: false,
        input: false,
        paramSelect: false,
        clear: false,
        submit: false,
      },
      helpToggled: false,
      vocabUrl: 'https://id.kb.se/vocab/',
      staticProps: { _limit: 20, _spell: true },
      searchPhrase: '',
      searchParams: PropertyMappings,
      activeSearchParam: null,
      activeSearchType: null,
    };
  },
  methods: {
    translatePhrase,
    focusSearchInput() {
      this.$refs.searchFormInput.focus();
    },
    removeTags(html) {
      let regexHtml = html.replace(/<h1.*>.*?<\/h1>/ig, '').replace(/<h2.*>.*?<\/h2>/ig, '');
      regexHtml = regexHtml.replace(/(<\/?(?:code|br|p)[^>]*>)|<[^>]+>/ig, '$1');
      return regexHtml;
    },
    transformMarkdownToHTML(markdown) {
      let html = DOMPurify.sanitize(marked.parse(markdown));
      html = this.removeTags(html);
      return html;
    },
    toggleHelp() {
      this.helpToggled = !this.helpToggled;
    },
    composeQuery() {
      return buildQueryString(this.searchPerimeter === 'libris'
        ? this.mergedParams
        : { q: this.searchPhrase, databases: this.status.remoteDatabases.join() });
    },
    doSearch() {
      this.helpToggled = false;
      let path = '';
      if (this.searchPerimeter === 'libris' || this.searchPerimeter === 'remote') {
        path = `/search/${this.searchPerimeter}?${this.composeQuery()}`;
      } else if (this.searchTool === 'changes') {
        // Keep facets
        if (!isEmpty(this.$route.query)) {
          const queryObj = cloneDeep(this.$route.query);
          queryObj.q = this.searchPhrase === '' ? '*' : this.searchPhrase;
          path = `${this.$route.path}?${buildQueryString(queryObj)}`;
        } else {
          path = `${this.$route.path}?${buildQueryString(this.mergedParams)}`;
        }
      }
      this.$router.push(path);
    },
    clearInputs() {
      this.searchPhrase = '';
      this.focusSearchInput();
    },
    resetSearchParam() {
      this.activeSearchParam = PropertyMappings.find((mapping) => mapping.searchProps.includes('q'));
    },
    setSearch() {
      let match = PropertyMappings.filter((prop) => {
        const keys = Object.keys(prop.mappings);
        return keys.every((key) => this.$route.query.hasOwnProperty(key));
      });
      if (match.length > 1) {
        // multiple matching parameters...
        const filteredMatch = match
          // try separate ISSN from ISBN
          .filter((prop) => prop.mappings['identifiedBy.@type'] === this.$route.query['identifiedBy.@type'])
          // remove 'q'
          .filter((prop) => !prop.mappings.hasOwnProperty('q'));
        match = filteredMatch;
      }
      if (match.length > 0) {
        const matchObj = match[0];
        this.$nextTick(() => {
          this.searchPhrase = this.$route.query[matchObj.searchProps[0]];
        });
        return matchObj;
      }
      // no match...
      if (this.user && this.user.settings.searchParam) {
        // return saved preference
        const userPref = Object.assign({}, this.user.settings.searchParam);
        return userPref;
      }
      // return fallback value
      return PropertyMappings[0];
    },
    setType() {
      if (this.$route.params.perimeter === 'remote' || (this.$route === 'changes' && this.$route.params.perimeter !== 'libris')) {
        return this.activeSearchType; // Don't change while remote searching, or in change view
      }
      const performedQuery = cloneDeep(this.$route.query);
      let type;
      if (isEmpty(performedQuery)) {
        type = this.user.settings.searchType || 'Instance';
      } else {
        if (!this.isChangeView) {
          type = performedQuery['@type'] || '*';
        }
      }
      if (isArray(type)) {
        for (let i = 0; i < type.length; i++) {
          for (let x = 0; x < this.dataSetFilters.length; x++) {
            if (type[i] === this.dataSetFilters[x].value) {
              return type[i];
            }
          }
        }
      }
      return type;
    },
    setPrefSearchType() {
      const user = this.user;
      user.settings.searchType = this.activeSearchType;
      this.$store.dispatch('setUser', user);
    },
    setPrefSearchParam() {
      const user = this.user;
      user.settings.searchParam = this.activeSearchParam;
      this.$store.dispatch('setUser', user);
    },
    setActiveSelectValues() {
      this.activeSearchParam = this.setSearch();
      this.activeSearchType = this.setType();
    },
  },
  computed: {
    searchIsFocused() {
      for (const element in this.searchGroupFocus) {
        if (this.searchGroupFocus[element] === true) {
          return true;
        }
      }
      return false;
    },
    availableSearchParams() {
      if (this.activeSearchType === '*') {
        return PropertyMappings;
      }
      return PropertyMappings.filter((mapping) => mapping.types.indexOf(this.activeSearchType) > -1);
    },
    helpContainerBoundaryStyles() {
      const $icon = this.$refs.helpIcon;
      const styles = { top: `${$icon.clientHeight + 12}px` };
      return styles;
    },
    searchHelpTooltip() {
      return StringUtil.getUiPhraseByLang('Show search help', this.user.settings.language, this.resources.i18n);
    },
    searchHelpDocs() {
      if (this.docs && this.docs.hasOwnProperty('search')) {
        return this.transformMarkdownToHTML(this.docs.search.content);
      }
      return StringUtil.getUiPhraseByLang('Something went wrong', this.user.settings.language, this.resources.i18n);
    },
    docs() {
      if (this.resources.helpDocs != null) {
        const json = this.resources.helpDocs;
        return json;
      }
      return null;
    },
    ...mapGetters([
      'resources',
      'settings',
      'status',
      'user',
    ]),
    dataSetFilters() {
      if (this.user.settings.activeSigel === 'SEK') {
        const extraFilter = { value: 'BulkChange', label: 'Bulk change' };
        return [...this.settings.dataSetFilters.libris, extraFilter];
      } else {
        return this.settings.dataSetFilters.libris;
      }
    },
    hasInput() {
      return this.searchPhrase.length > 0;
    },
    inputPlaceholder() {
      if (this.searchPerimeter === 'remote') {
        return 'ISBN eller valfria sökord';
      }
      if (this.searchTool === 'changes') {
        return 'Search among changes';
      }
      return 'Search';
    },
    composedSearchParam() { // pair current search param with searchphrase
      let composed = {};
      if (this.activeSearchParam !== null) {
        composed = Object.assign({}, this.activeSearchParam.mappings || {});
        const phrase = this.searchPhrase.length > 0 ? this.searchPhrase : '*';
        this.activeSearchParam.searchProps.forEach((param) => {
          composed[param] = phrase;
        });
      }
      return composed;
    },
    composedTypes() {
      let type = null;
      if (this.activeSearchType && this.activeSearchType.length > 0) {
        if (this.searchPerimeter === 'libris') {
          type = this.activeSearchType;
        } else if (this.searchTool === 'changes') {
          type = 'AdministrativeNotice';
        }
      }
      return { '@type': type };
    },
    prefSort() {
      if (
        this.$route.query?._sort
        && this.settings.sortOptions[this.activeSearchType]
          ?.find((sortOption) => this.$route.query._sort.includes(sortOption.query))
          // use includes instead of strict equality check to allow localized _sortKeyByLang (e.g. _sortKeyByLang.sv)
      ) {
        return { _sort: this.$route.query._sort };
      }
      if (this.user && this.user.settings.sort) {
        const availableSorts = this.settings.sortOptions[this.user.settings.searchType];

        if (availableSorts) {
          for (let i = 0; i < availableSorts.length; i++) {
            if (availableSorts[i].query === this.user.settings.sort) {
              return { _sort: this.user.settings.sort };
            }
          }
        }
      }
      return { _sort: '' };
    },
    mergedParams() {
      return Object.assign(
        this.composedSearchParam,
        this.staticProps,
        this.composedTypes,
        this.prefSort,
      );
    },
    isChangeView() {
      return this.searchTool === 'changes' || this.$route.path === '/directory-care/changes';
    },
  },
  components: {
    'remote-databases': RemoteDatabases,
  },
  watch: {
    'status.keyActions'(actions) {
      const lastAction = actions.slice(-1).join();
      if (lastAction === 'focus-main-search') {
        this.focusSearchInput();
      }
    },
    activeSearchType(val, oldVal) {
      if (val !== oldVal && oldVal) {
        this.setPrefSearchType();
        this.resetSearchParam();
      }
    },
    searchTool(newVal, oldVal) {
      if (newVal !== oldVal && newVal === 'changes') {
        this.clearInputs();
        this.resetSearchParam();
        this.doSearch();
      }
    },
    searchPerimeter(newVal, oldVal) {
      if (newVal !== oldVal) {
        this.$nextTick(() => {
          this.helpToggled = false;
          this.focusSearchInput();
          if (newVal === 'remote') {
            if (this.status.remoteDatabases.length > 0) {
              if (this.composedSearchParam.q !== '' && this.composedSearchParam.q !== '*') {
                this.doSearch();
              }
            }
          }
        });
      }
    },
    '$route.name'(val, oldValue) {
      if (val === 'Search' && oldValue !== 'Search') {
        this.focusSearchInput();
      }
    },
    '$route.params'() {
      this.setActiveSelectValues();
    },
  },
  mounted() {
    this.$nextTick(() => {
      this.focusSearchInput();
      this.$router.isReady().then(() => {
        this.setActiveSelectValues();
      });
    });
  },
};
</script>

<template>
  <div class="SearchForm">
    <form id="searchForm" class="SearchForm-form">
      <label class="SearchForm-inputLabel sr-only" id="searchlabel" for="q">
        {{ translatePhrase("Search") }}
      </label>
      <div class="SearchForm-formGroup SearchForm-selectGroup hidden-sm hidden-md hidden-lg">
        <div class="SearchForm-selectWrapper SearchForm-typeSelectWrapper" v-if="searchPerimeter === 'libris'">
          <select
            class="SearchForm-typeSelect SearchForm-select customSelect"
            v-model="activeSearchType"
            @change="setPrefSearchType">
            <option
              v-for="filter in dataSetFilters"
              :key="filter.value"
              :value="filter.value">
              {{ translatePhrase(filter.label) }}
            </option>
          </select>
        </div>
        <div class="SearchForm-selectWrapper SearchForm-paramSelectWrapper" v-if="searchPerimeter === 'libris'">
          <select
            class="SearchForm-paramSelect SearchForm-select customSelect"
            v-model="activeSearchParam"
            @change="setPrefSearchParam">
            <option
              v-for="prop in availableSearchParams"
              :key="prop.key"
              :value="prop">
              {{ translatePhrase(prop.key) }}
            </option>
          </select>
        </div>
      </div>
      <div ref="formGroup" class="SearchForm-formGroup" :class="{ 'is-focused': searchIsFocused }">
        <div class="SearchForm-selectWrapper SearchForm-typeSelectWrapper hidden-xs" v-if="searchPerimeter === 'libris'">
          <select
            class="SearchForm-typeSelect SearchForm-select customSelect"
            v-model="activeSearchType"
            @focus="searchGroupFocus.typeSelect = true"
            @blur="searchGroupFocus.typeSelect = false"
            @change="setPrefSearchType">
            <option
              v-for="filter in dataSetFilters"
              :key="filter.value"
              :value="filter.value">
              {{ translatePhrase(filter.label) }}
            </option>
          </select>
        </div>
        <input
          type="text"
          @focus="searchGroupFocus.input = true"
          @blur="searchGroupFocus.input = false"
          class="SearchForm-input customInput"
          id="q"
          v-model="searchPhrase"
          aria-labelledby="searchlabel"
          :placeholder="translatePhrase(inputPlaceholder)"
          ref="searchFormInput">
        <span
          class="SearchForm-clear icon icon--md"
          @focus="searchGroupFocus.clear = true"
          @blur="searchGroupFocus.clear = false"
          :class="{ 'in-remote': searchPerimeter === 'remote' || searchTool === 'changes' }"
          tabindex="0"
          v-show="hasInput"
          @keyup.enter="clearInputs()"
          @click="clearInputs()">
          <i class="fa fa-fw fa-close" />
        </span>
        <div class="SearchForm-selectWrapper SearchForm-paramSelectWrapper hidden-xs" v-if="searchPerimeter === 'libris'">
          <select
            class="SearchForm-paramSelect SearchForm-select customSelect"
            v-model="activeSearchParam"
            @focus="searchGroupFocus.paramSelect = true"
            @blur="searchGroupFocus.paramSelect = false"
            @change="setPrefSearchParam">
            <option
              v-for="prop in availableSearchParams"
              :key="prop.key"
              :value="prop">
              {{ translatePhrase(prop.key) }}
            </option>
          </select>
        </div>
        <button
          class="SearchForm-submit btn btn-primary icon--white icon--md"
          :aria-label="translatePhrase('Search')"
          @click.prevent="doSearch"
          @focus="searchGroupFocus.submit = true"
          @blur="searchGroupFocus.submit = false"
          :class="{ disabled: searchPerimeter === 'remote' && status.remoteDatabases.length === 0 }"
          :disabled="searchPerimeter === 'remote' && status.remoteDatabases.length === 0">
          <i class="fa fa-search" />
        </button>
      </div>
      <remote-databases
        v-if="searchPerimeter === 'remote'"
        :remoteSearch="searchPhrase"
        @panelClosed="focusSearchInput"
        ref="dbComponent" />
    </form>
    <div class="SearchForm-help">
      <div class="SearchForm-helpBox dropdown" v-if="searchPerimeter === 'libris'">
        <span class="SearchForm-helpIcon">
          <i
            v-tooltip="searchHelpTooltip"
            class="fa fa-fw fa-question-circle icon icon--md"
            tabindex="0"
            aria-haspopup="true"
            ref="helpIcon"
            @mouseover="helpHover = true"
            @mouseleave="helpHover = false"
            @click="toggleHelp"
            @keyup.enter="toggleHelp" />
        </span>
        <div class="SearchForm-helpContainer" :style="helpContainerBoundaryStyles" v-if="helpToggled">
          <strong class="SearchForm-helpTitle">Operatorer för frågespråk</strong><i v-if="helpToggled" class="fa fa-times SearchForm-closeHelp" @click="toggleHelp" />
          <div class="SearchForm-helpContent" v-html="searchHelpDocs" />
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="less">

.SearchForm {
  margin-top: 0vh;
  transition: 0.3s ease margin-top;
  display: flex;
  flex-direction: row;
  align-items: center;
  flex-wrap: wrap;
  @media all and (min-width: @screen-sm) {
    flex-wrap: unset;
  }
  &-selectGroup {
    margin-bottom: 0.5em;
    > * {
      flex-basis: 50%;
    }
  }
  &-formGroup {
    width: 100%;
    display: flex;
    position: relative;
    border-radius: @form-radius;
    background-color: @grey-lightest;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0), 0 1px 2px rgba(0, 0, 0, 0);
    transition: box-shadow 0.25s ease;
    &.is-focused {
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
    }
    > * {
      display: flex;
      background-color: @grey-lightest;
      border-radius: 0;
      &:first-child {
        overflow: hidden;
        border-left: none;
        border-radius: @form-radius 0 0 @form-radius;
      }
      &:last-child {
        margin-left: 0;
        overflow: hidden;
        border-radius: 0 @form-radius @form-radius 0;
      }
    }
  }
  &-form {
    order: 1;
    flex-grow: 1;
    flex-basis: 80%;
    @media all and (min-width: @screen-sm) {
      flex-basis: unset;
    }
  }

  &-help {
    width: 2em;
    display: none;
    @media all and (min-width: @screen-sm) {
      order: 2;
      display: block;
    }
  }

  &-helpContainer {
    position: absolute;
    z-index: @popover-z;
    right: 0px;
    background-color: @neutral-color;
    padding: 1em;
    width: 30vw;
    @media all and (max-width: 1300px) {
      width: 40vw;
    }
    @media all and (max-width: 1100px) {
      width: 50vw;
    }
    @media all and (max-width: 800px) {
      width: 60vw;
    }
    max-height: 50vh;
    overflow-y: scroll;
    border-radius: 0.25em;
    border: 1px solid;
    border-color: #ccc #ccc #aaa #ccc;
    box-shadow: 0px 5px 10px 0px rgba(0, 0, 0, 0.25);
  }
  &-closeHelp {
    float: right;
    cursor: pointer;
    color: @grey;
    &:hover {
      color: @black;
    }
  }

  &-helpIcon {
    float: right;
    clear: right;
    display: flex;

    & > i {
      vertical-align: bottom;
    }

    &:focus {
      outline: auto 5px;
    }
  }

  &-selectWrapper {
    @media (min-width: @screen-sm) {
      flex-basis: 32%;
    }
    border: solid @grey-lighter;
    border-width: 0px 1px 0px 1px;
  }
  &-typeSelectWrapper {
    order: 1;
  }
  &-paramSelectWrapper {
    order: 4;
  }

  &-input {
    order: 2;
    min-width: 100px;
    width: 100%;
    color: @black;
    transition: background-color 0.2s ease;
    &:focus {
      background-color: @white;
      border-radius: 0;
      @media all and (-ms-high-contrast: none), (-ms-high-contrast: active) {
        /* IE10+ CSS styles go here */
        border: solid @grey-lighter;
        border-width: 1px 0px 0px 0px;
      }
    }
  }

  &-clear {
    order: 3;
    position: absolute;
    right: 2.5em;
    @media (min-width: @screen-sm) {
      right: 28%;
      &.in-remote {
        right: 4.5em;
      }
    }
    @media (min-width: @screen-md) {
      right: 29.5%;
    }
    @media (min-width: @screen-lg) {
      right: 28%;
    }
    height: 2em;
    background-color: transparent;
    display: flex;
    align-items: center;
  }

  &-submit {
    order: 5;
    min-width: 2.4em;
    box-shadow: none;

    @media (min-width: @screen-sm) {
      min-width: 84px;
    }

    .is-focused & {
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
    }
  }

  &-inputLabel {
    display: block;
    text-transform: uppercase;
  }

  &-typeLabel {
    padding-right: 10px;
    font-weight: normal;
    position: relative;
  }
}
</style>
