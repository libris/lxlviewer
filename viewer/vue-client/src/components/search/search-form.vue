<script>
import { isEmpty, cloneDeep } from 'lodash-es';
import PropertyMappings from '@/resources/json/propertymappings.json';
import * as StringUtil from '@/utils/string';
import RemoteDatabases from '@/components/search/remote-databases';
import TabMenu from '@/components/shared/tab-menu';
import SwitchToggle from '@/components/shared/switch-toggle';
import marked from 'marked';
import { mapGetters } from 'vuex';

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
    focusSearchInput() {
      this.$refs.searchFormInput.focus();
    },
    removeTags(html) {
      let regexHtml = html.replace(/<h1.*>.*?<\/h1>/ig, '').replace(/<h2.*>.*?<\/h2>/ig, '');
      regexHtml = regexHtml.replace(/(<\/?(?:code|br|p)[^>]*>)|<[^>]+>/ig, '$1');
      return regexHtml;
    },
    transformMarkdownToHTML(markdown) {
      let html = marked(markdown);
      html = this.removeTags(html);
      return html;
    },
    toggleHelp() {
      this.helpToggled = !this.helpToggled;
    },
    composeQuery() {
      let query = '';
      if (this.searchPerimeter === 'libris') {
        const queryArr = [];
        Object.keys(this.mergedParams).forEach((param) => {
          if (Array.isArray(this.mergedParams[param])) {
            this.mergedParams[param].forEach((el) => {
              queryArr.push(`${param}=${el}`);
            });
          } else queryArr.push(`${param}=${this.mergedParams[param]}`);
        });
        query = queryArr.join('&');
      } else {
        const databases = this.status.remoteDatabases.join();
        query = `q=${this.searchPhrase}&databases=${databases}`;
      }
      return encodeURI(query);
    },
    doSearch() {
      this.helpToggled = false;
      this.$router.push({ path: `/search/${this.searchPerimeter}?${this.composeQuery()}` });
        
      if (this.searchPerimeter === 'remote') {
        this.$refs.dbComponent.showList = false;
      }
    },
    clearInputs() {
      this.searchPhrase = '';
      this.focusSearchInput();
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
          this.searchPhrase = this.$route.query[matchObj.searchProp];
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
      const performedQuery = cloneDeep(this.$route.query);
      if (isEmpty(performedQuery)) {
        return 'Instance'; // initial value
      }
      if (!performedQuery.hasOwnProperty('@type')) {
        return ''; // explicitly no types
      }
      if (typeof performedQuery['@type'] === 'string') { 
        return performedQuery['@type']; // put a single @type into an array
      }
      return performedQuery['@type'];
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
  },
  computed: {
    helpContainerBoundaryStyles() {
      const $icon = this.$refs.helpIcon;
      const $formGroup = this.$refs.formGroup;
      const styles = { top: `${$icon.clientHeight + 12}px` };
      return styles;
    },
    searchHelpTooltip() {
      return StringUtil.getUiPhraseByLang('Show search help', this.user.settings.language);
    },
    searchHelpDocs() {
      if (this.docs && this.docs.hasOwnProperty('search-01-queries')) {
        return this.transformMarkdownToHTML(this.docs['search-01-queries'].content);
      }
      return StringUtil.getUiPhraseByLang('Something went wrong', this.settings.language);
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
      return this.settings.dataSetFilters.libris;
    },
    hasInput() {
      return this.searchPhrase.length > 0;
    },
    inputPlaceholder() {
      return this.searchPerimeter === 'remote' ? 'ISBN eller valfria sökord' : 'Search';
    },
    composedSearchParam() { // pair current search param with searchphrase
      const composed = Object.assign({}, this.activeSearchParam.mappings);
      composed[this.activeSearchParam.searchProp] = this.searchPhrase.length > 0 ? this.searchPhrase : '*';
      return composed;
    },
    composedTypes() {
      return this.activeSearchType.length > 0 ? { '@type': this.activeSearchType } : {};
    },
    prefSort() {
      if (this.user && this.user.settings.sort) {
        return { _sort: this.user.settings.sort };
      } return false;
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
    'tab-menu': TabMenu,
    'switch-toggle': SwitchToggle,
  },
  watch: {
    searchPerimeter(newVal, oldVal) {
      if (newVal !== oldVal) {
        this.$nextTick(() => {
          this.helpToggled = false;
          this.focusSearchInput();
        });
      }
    },
    '$route.fullPath'() {
      if (this.activeSearchParam === null) {
        this.activeSearchParam = this.setSearch();
      }
      if (this.activeSearchType === null) {
        this.activeSearchType = this.setType();
      }
    },
  },
  mounted() {
    this.$nextTick(() => {
      this.focusSearchInput();
      if (this.activeSearchParam === null) {
        this.activeSearchParam = this.setSearch();
      }
      if (this.activeSearchType === null) {
        this.activeSearchType = this.setType();
      }
    });
  },
};
</script>

<template>
  <div class="SearchForm">
    <form id="searchForm" class="SearchForm-form">
      <label class="SearchForm-inputLabel hidden" id="searchlabel" for="q" aria-hidden="false">
        {{"Search" | translatePhrase}}
      </label>
      <div ref="formGroup" class="SearchForm-formGroup">
        <div class="SearchForm-selectWrapper" v-if="searchPerimeter === 'libris'">
          <select
            class="SearchForm-typeSelect SearchForm-select customSelect"
            v-model="activeSearchType"
            @change="setPrefSearchType">
            <option 
              v-for="filter in dataSetFilters" 
              :key="filter.value"
              :value="filter.value">
              {{filter.label | translatePhrase}}
            </option>
          </select>
        </div>
        <input type="text"
          class="SearchForm-input customInput"
          v-model="searchPhrase"
          aria-labelledby="searchlabel"
          :placeholder="inputPlaceholder | translatePhrase"
          ref="searchFormInput">
        <span class="SearchForm-clear icon icon--md" v-show="hasInput" @click="clearInputs()">
          <i class="fa fa-fw fa-close"></i>
        </span>
        <div class="SearchForm-selectWrapper" v-if="searchPerimeter === 'libris'">
          <select
            class="SearchForm-paramSelect SearchForm-select customSelect"
            v-model="activeSearchParam"
            @change="setPrefSearchParam">
            <option 
              v-for="prop in searchParams"
              :key="prop.key"
              :value="prop">
              {{prop.key | translatePhrase}}
            </option>
          </select>
        </div>
        <button 
          class="SearchForm-submit btn btn-primary icon icon--white icon--md" 
          :aria-label="'Search' | translatePhrase"
          @click.prevent="doSearch"
          :class="{'disabled': searchPerimeter === 'remote' && status.remoteDatabases.length === 0}"
          :disabled="searchPerimeter === 'remote' && status.remoteDatabases.length === 0" >
          <i class="fa fa-search"></i>
        </button>
      </div>
      <remote-databases 
        v-if="searchPerimeter === 'remote'" 
        :remoteSearch="searchPhrase"
        @panelClosed="focusSearchInput"
        ref="dbComponent"></remote-databases>
    </form>
    <div class="SearchForm-perimeterControl"> 
      <switch-toggle :link="true" :options="[
        { 'id': 'libris', 'text': 'Libris', link: '/search/libris'},
        { 'id': 'remote', 'text': 'Other sources', link: '/search/remote' },
      ]" :active="searchPerimeter" />
    </div>
    <div class="SearchForm-help">
      <div class="SearchForm-helpBox dropdown" v-if="searchPerimeter === 'libris'">
        <span class="SearchForm-helpIcon icon icon--md">
          <i v-tooltip="searchHelpTooltip" class="fa fa-fw fa-question-circle" tabindex="0" aria-haspopup="true"
            ref="helpIcon"
            @mouseover="helpHover = true"
            @mouseleave="helpHover = false"
            @click="toggleHelp"
            @keyup.enter="toggleHelp"></i>
        </span>
        <div class="SearchForm-helpContainer" :style="helpContainerBoundaryStyles" v-if="helpToggled"> 
          <strong class="SearchForm-helpTitle">Operatorer för frågespråk</strong><i v-if="helpToggled" class="fa fa-times SearchForm-closeHelp" @click="toggleHelp"></i>
          <div class="SearchForm-helpContent" v-html="searchHelpDocs"></div>
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

  &-formGroup {
    width: 100%;
    display: flex;
    position: relative;
    border-radius: @form-radius;
    background-color: @grey-lightest;
    > * {
      display: flex;
      background-color: @grey-lightest;
      border-radius: 0;
      margin-left: 0.05em;
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
    order: 3;
    flex-grow: 1;
    flex-basis: 80%;
    @media all and (min-width: @screen-sm) {
      order: 1;
      flex-basis: unset;
    }
  }

  &-perimeterControl {
    order: 1;
    @media all and (min-width: @screen-sm) {
      order: 2;
    }
  }

  &-help {
    width: 2em;
    order: 2;
    @media all and (min-width: @screen-sm) {
      order: 3;
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

  &-formGroup {
    width: 100%;
    display: flex;
  }

  &-selectWrapper {
    flex: 1 0 auto;
    border: solid @grey-lighter;
    border-width: 0px 1px 0px 1px;
  }

  &-select {
    
  }

  &-input {
    min-width: 100px;
    width: 100%;
    color: @black;
  }

  &-inputLabel {
    display: block;
    text-transform: uppercase;
  }

  &-clear {
    height: 42px;
    display: flex;
    align-items: center;
  }

  &-submit {
    min-width: 2.4em;
    box-shadow: none;

    @media (min-width: @screen-sm) {
      min-width: 84px;
    }
  }

  &-typeLabel {
    padding-right: 10px;
    font-weight: normal;
    position: relative;
  }
}
</style>
