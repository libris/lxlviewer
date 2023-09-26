<script>
import { mapState, mapWritableState } from 'pinia';
import { translatePhrase } from '@/utils/filters';
import { useUserStore } from '@/stores/user';
import { useSettingsStore } from '@/stores/settings';
import { useResourcesStore } from '@/stores/resources';
import { useStatusStore } from '@/stores/status';
import { isEmpty, cloneDeep, isArray } from 'lodash-es';
import { marked } from 'marked';
import * as StringUtil from 'lxljs/string';
import PropertyMappings from '@/resources/json/propertymappings.json';
import RemoteDatabases from '@/components/search/remote-databases.vue';
import { buildQueryString } from '@/utils/http';

export default {
  name: 'search-form',
  props: {
    searchPerimeter: {
      default: 'libris',
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
      staticProps: { _limit: 20 },
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
      let html = marked.parse(markdown);
      html = this.removeTags(html);
      return html;
    },
    toggleHelp() {
      this.helpToggled = !this.helpToggled;
    },
    composeQuery() {
      return buildQueryString(this.searchPerimeter === 'libris'
        ? this.mergedParams
        : { q: this.searchPhrase, databases: this.remoteDatabases.join() });
    },
    doSearch() {
      this.helpToggled = false;
      console.log('doSearch', this.composeQuery());
      const path = `/search/${this.searchPerimeter}?${this.composeQuery()}`;
      this.$router.push(path);
    },
    clearInputs() {
      this.searchPhrase = '';
      this.focusSearchInput();
    },
    resetSearchParam() {
      this.activeSearchParam = PropertyMappings.find(mapping => mapping.searchProps.includes('q'));
    },
    setSearch() {
      let match = PropertyMappings.filter((prop) => {
        const keys = Object.keys(prop.mappings);
        return keys.every(key => this.$route.query.hasOwnProperty(key));
      });
      if (match.length > 1) {
        // multiple matching parameters...
        const filteredMatch = match
          // try separate ISSN from ISBN
          .filter(prop => prop.mappings['identifiedBy.@type'] === this.$route.query['identifiedBy.@type'])
          // remove 'q'
          .filter(prop => !prop.mappings.hasOwnProperty('q'));
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
      if (this.$route.params.perimeter === 'remote') {
        return this.activeSearchType; // Don't change while remote searching
      }
      const performedQuery = cloneDeep(this.$route.query);
      let type;
      if (isEmpty(performedQuery)) {
        type = this.user.settings.searchType || 'Instance';
      } else {
        type = performedQuery['@type'] || '*';
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
      this.user = user;
    },
    setPrefSearchParam() {
      const user = this.user;
      user.settings.searchParam = this.activeSearchParam;
      this.user = user;
    },
    setActiveSelectValues() {
      this.activeSearchParam = this.setSearch();
      this.activeSearchType = this.setType();
    },
  },
  computed: {
    ...mapState(useResourcesStore, ['i18n', 'helpDocs']),
    ...mapState(useStatusStore, ['keyActions', 'remoteDatabases']),
    ...mapState(useSettingsStore, ['settings']),
    ...mapWritableState(useUserStore, ['user']),
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
      return PropertyMappings.filter(mapping => mapping.types.indexOf(this.activeSearchType) > -1);
    },
    helpContainerBoundaryStyles() {
      const $icon = this.$refs.helpIcon;
      const styles = { top: `${$icon.clientHeight + 12}px` };
      return styles;
    },
    searchHelpTooltip() {
      return StringUtil.getUiPhraseByLang('Show search help', this.user.settings.language, this.i18n);
    },
    searchHelpDocs() {
      if (this.docs && this.docs.hasOwnProperty('search')) {
        return this.transformMarkdownToHTML(this.docs.search.content);
      }
      return StringUtil.getUiPhraseByLang('Something went wrong', this.user.settings.language, this.i18n);
    },
    docs() {
      if (this.helpDocs != null) {
        const json = this.helpDocs;
        return json;
      }
      return null;
    },
    dataSetFilters() {
      return this.settings.dataSetFilters.libris;
    },
    hasInput() {
      return this.searchPhrase.length > 0;
    },
    inputPlaceholder() {
      return this.searchPerimeter === 'remote' ? 'ISBN eller valfria sökord' : 'Search';
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
      return this.activeSearchType && this.activeSearchType.length > 0 ? { '@type': this.activeSearchType } : { '@type': null };
    },
    prefSort() {
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
  },
  components: {
    'remote-databases': RemoteDatabases,
  },
  watch: {
    'keyActions'(actions) {
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
    searchPerimeter(newVal, oldVal) {
      if (newVal !== oldVal) {
        this.$nextTick(() => {
          this.helpToggled = false;
          this.focusSearchInput();
        });
      }
    },
    '$route.name'(val, oldValue) {
      if (val === 'Search' && oldValue !== 'Search') {
        this.focusSearchInput();
      }
    },
    '$route.params.perimeter'(value) {
      if (value === 'remote') {
        if (this.remoteDatabases.length > 0) {
          if (this.composedSearchParam.q !== '' && this.composedSearchParam.q !== '*') {
            this.doSearch();
          }
        }
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

      <div class="SearchForm-formGroup SearchForm-selectGroup d-flex d-sm-none">
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
              {{translatePhrase(prop.key)}}
            </option>
          </select>
        </div>
      </div>

      <div ref="formGroup" class="SearchForm-formGroup" :class="{ 'is-focused': searchIsFocused }">
        <div class="SearchForm-selectWrapper SearchForm-typeSelectWrapper d-none d-sm-flex" v-if="searchPerimeter === 'libris'">
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
              {{translatePhrase(filter.label)}}
            </option>
          </select>
        </div>
        <input type="text"
          @focus="searchGroupFocus.input = true"
          @blur="searchGroupFocus.input = false"
          class="SearchForm-input customInput"
          id="q"
          v-model="searchPhrase"
          aria-labelledby="searchlabel"
          :placeholder="translatePhrase(inputPlaceholder)"
          ref="searchFormInput">
        <span class="SearchForm-clear icon icon--md"
          @focus="searchGroupFocus.clear = true"
          @blur="searchGroupFocus.clear = false"
          :class="{ 'in-remote': searchPerimeter === 'remote' }" tabindex="0" v-show="hasInput" @keyup.enter="clearInputs()" @click="clearInputs()">
          <font-awesome-icon :icon="['fas', 'xmark']" />
        </span>
        <div class="SearchForm-selectWrapper SearchForm-paramSelectWrapper d-none d-sm-flex" v-if="searchPerimeter === 'libris'">
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
              {{translatePhrase(prop.key)}}
            </option>
          </select>
        </div>

        <button
          class="SearchForm-submit btn btn-primary icon--white icon--md"
          :aria-label="translatePhrase('Search')"
          @click.prevent="doSearch"
          @focus="searchGroupFocus.submit = true"
          @blur="searchGroupFocus.submit = false"
          :class="{'disabled': searchPerimeter === 'remote' && remoteDatabases.length === 0}"
          :disabled="searchPerimeter === 'remote' && remoteDatabases.length === 0"
        >
          <font-awesome-icon :icon="['fa', 'search']" />
        </button>
      </div>

      <remote-databases
        v-if="searchPerimeter === 'remote'"
        :remoteSearch="searchPhrase"
        @panelClosed="focusSearchInput"
        ref="dbComponent"
      />
    </form>

    <div class="SearchForm-help">
      <div class="SearchForm-helpBox dropdown" v-if="searchPerimeter === 'libris'">
        <span class="SearchForm-helpIcon">
          <font-awesome-icon v-tooltip="searchHelpTooltip" :icon="['fa', 'question-circle']" class="icon icon--md" tabindex="0" aria-haspopup="true"
            ref="helpIcon"
            @mouseover="helpHover = true"
            @mouseleave="helpHover = false"
            @click="toggleHelp"
            @keyup.enter="toggleHelp"></font-awesome-icon>
        </span>
        <div class="SearchForm-helpContainer" :style="helpContainerBoundaryStyles" v-if="helpToggled">
          <strong class="SearchForm-helpTitle">Operatorer för frågespråk</strong>
          <font-awesome-icon v-if="helpToggled" :icon="['fas', 'xmark']" class="SearchForm-closeHelp" @click="toggleHelp"></font-awesome-icon>
          <div class="SearchForm-helpContent" v-html="searchHelpDocs"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">

.SearchForm {
  margin-top: 0vh;
  transition: 0.3s ease margin-top;
  display: flex;
  flex-direction: row;
  align-items: center;
  flex-wrap: wrap;

  // @media all and (min-width: @screen-sm) {
  //   flex-wrap: unset;
  // }

  @include media-breakpoint-up(sm) {
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
    border-radius: $form-radius;
    background-color: $grey-lightest;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0), 0 1px 2px rgba(0, 0, 0, 0);
    transition: box-shadow 0.25s ease;
    &.is-focused {
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
    }
    > * {
      display: flex;
      background-color: $grey-lightest;
      border-radius: 0;
      &:first-child {
        overflow: hidden;
        border-left: none;
        border-radius: $form-radius 0 0 $form-radius;
      }
      &:last-child {
        margin-left: 0;
        overflow: hidden;
        border-radius: 0 $form-radius $form-radius 0;
      }
    }
  }
  &-form {
    order: 1;
    flex-grow: 1;
    flex-basis: 80%;
    // @media all and (min-width: @screen-sm) {
    //   flex-basis: unset;
    // }

    @include media-breakpoint-up(sm) {
      flex-basis: unset;
    }
  }

  &-help {
    width: 2em;
    display: none;

    // @media all and (min-width: @screen-sm) {
    //   order: 2;
    //   display: block;
    // }

    @include media-breakpoint-up(sm) {
      order: 2;
      display: block;
    }
  }

  &-helpContainer {
    position: absolute;
    z-index: $popover-z;
    right: 0px;
    background-color: $neutral-color;
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
    color: $grey;
    &:hover {
      color: $black;
    }
  }

  &-helpIcon {
    float: right;
    clear: right;
    display: flex;

    & > svg {
      vertical-align: bottom;
    }

    &:focus {
      outline: auto 5px;
    }
  }

  &-selectWrapper {
    // @media (min-width: @screen-sm) {
    //   flex-basis: 30%;
    // }
    border: solid $grey-lighter;
    border-width: 0px 1px 0px 1px;

    @include media-breakpoint-up(sm) {
      flex-basis: 30%;
    }
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
    color: $black;
    transition: background-color 0.2s ease;
    &:focus {
      background-color: $white;
      border-radius: 0;
      @media all and (-ms-high-contrast: none), (-ms-high-contrast: active) {
        /* IE10+ CSS styles go here */
        border: solid $grey-lighter;
        border-width: 1px 0px 0px 0px;
      }
    }
  }

  &-clear {
    order: 3;
    position: absolute;
    right: 2.5em;

    // @media (min-width: $screen-sm) {
    //   right: 28%;
    //   &.in-remote {
    //     right: 4.5em;
    //   }
    // }

    @include media-breakpoint-up(sm) {
      right: 28%;
      &.in-remote {
        right: 4.5em;
      }
    }

    // @media (min-width: @screen-md) {
    //   right: 28.5%;
    // }

    @include media-breakpoint-up(md) {
      right: 28.5%;
    }

    // @media (min-width: @screen-lg) {
    //   right: 27%;
    // }

    @include media-breakpoint-up(lg) {
      right: 27%;
    }

    height: 2em;
    background-color: transparent;
    display: flex;
    align-items: center;
  }

  &-submit {
    display: flex;
    align-items: center;
    justify-content: center;
    order: 5;
    min-width: 2.4em;
    box-shadow: none;

    @include media-breakpoint-up(sm) {
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
