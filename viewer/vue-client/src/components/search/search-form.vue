<script>
import { isEmpty, cloneDeep } from 'lodash-es';
import PropertyMappings from '@/resources/json/propertymappings.json';
import * as StringUtil from '@/utils/string';
import RemoteDatabases from '@/components/search/remote-databases';
import TabMenu from '@/components/shared/tab-menu';
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
      vocabUrl: 'https://id.kb.se/vocab/',
      staticProps: { _limit: 20 },
      searchPhrase: '',
      searchParams: PropertyMappings,
      activeSearchParam: this.getIncomingSearch(),
      activeTypes: this.getIncomingTypes(),
    };
  },
  methods: {
    focusSearchInput() {
      this.$refs.searchBarInput.focus();
    },
    switchPerimeter(id) {
      this.$router.push({ path: `/search/${id}` });
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
    showHelp() {
      const helpText = document.querySelector('.js-searchHelpText');
      helpText.parentElement.classList.add(this.activeClass);
    },
    hideHelp() {
      const helpText = document.querySelector('.js-searchHelpText');
      if (helpText.parentElement.classList.contains(this.activeClass)) {
        helpText.parentElement.classList.remove(this.activeClass);
      } 
    },
    toggleHelp() {
      const helpText = document.querySelector('.js-searchHelpText');
      helpText.parentElement.classList.toggle(this.activeClass);
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
      this.$router.push({ path: `/search/${this.searchPerimeter}?${this.composeQuery()}` });
        
      if (this.searchPerimeter === 'remote') {
        this.$refs.dbComponent.showList = false;
      }
    },
    clearInputs() {
      this.searchPhrase = '';
      this.focusSearchInput();
    },
    getIncomingSearch() {
      let match = PropertyMappings
        .filter(prop => Object.keys(prop.mappings)
          .every(key => this.$route.query.hasOwnProperty(key)));

      if (match.length > 1) { // multiple sets of matching parameters
        const newMatch = match
          .filter(prop => prop.mappings['identifiedBy.@type'] === this.$route.query['identifiedBy.@type']);
        match = newMatch;
      }
      if (match.length > 0) {
        const matchObj = match[0];
        this.$nextTick(() => {
          this.searchPhrase = this.$route.query[matchObj.searchProp];
        });
        return matchObj;
      }
      return PropertyMappings[0];
    },
    getIncomingTypes() {
      const performedQuery = cloneDeep(this.$route.query);
      if (isEmpty(performedQuery)) {
        return ['Instance'];
      }
      if (!performedQuery.hasOwnProperty('@type')) {
        return [];
      }
      if (typeof performedQuery['@type'] === 'string') { // put a single @type into an array
        return [performedQuery['@type']];
      }
      return performedQuery['@type'];
    },
  },
  computed: {
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
    ]),
    dataSetFilters() {
      return this.settings.dataSetFilters.libris.map(term => ({
        '@id': StringUtil.getCompactUri(term, this.resources.context),
        label: StringUtil.getLabelByLang(term, this.settings.language, this.resources.vocab, this.resources.context) || term,
      }));
    },
    hasInput() {
      return this.searchPhrase.length > 0;
    },
    inputPlaceholder() {
      return this.searchPerimeter === 'remote' ? 'ISBN eller valfria sökord' : 'Search';
    },
    composedSearchParam() {
      const composed = this.activeSearchParam.mappings;
      composed[this.activeSearchParam.searchProp] = this.searchPhrase.length > 0 ? this.searchPhrase : '*';
      return composed;
    },
    composedTypes() {
      return this.activeTypes.length > 0 ? { '@type': this.activeTypes } : {};
    },
    mergedParams() {
      return Object.assign(
        this.composedSearchParam,
        this.staticProps,
        this.composedTypes,
      );
    },
  },
  components: {
    'remote-databases': RemoteDatabases,
    'tab-menu': TabMenu,
  },
  watch: {
    searchPerimeter(newVal, oldVal) {
      if (newVal !== oldVal) {
        this.$nextTick(() => {
          this.focusSearchInput();
        });
      }
    },
  },
  mounted() {
    this.$nextTick(() => {
      this.focusSearchInput();
    });
  },
};
</script>

<template>
  <div class="SearchBar">
    <div class="SearchBar-topControl">
      <tab-menu @go="switchPerimeter" :tabs="[
        { 'id': 'libris', 'text': 'Libris' },
        { 'id': 'remote', 'text': 'Other sources' },
      ]" :active="searchPerimeter"></tab-menu>
      <div  v-if="searchPerimeter === 'libris'"  class="SearchBar-help" @mouseleave="hideHelp()">
        <div class="SearchBar-helpBox dropdown" >
          <span class="SearchBar-helpIcon icon icon--md">
            <i class="fa fa-fw fa-question-circle" tabindex="0" aria-haspopup="true"
              @mouseover="showHelp()"
              @keyup.enter="toggleHelp()"></i>
          </span>
          <div class="SearchBar-helpContent js-searchHelpText dropdown-menu"> 
            <strong class="SearchBar-helpTitle">Operatorer för frågespråk</strong>
            <div v-html="searchHelpDocs"></div>
          </div>
        </div>
      </div> 
    </div>
    <form id="searchForm" class="SearchBar-form">
      <div class="SearchBar-formContent">
        <div class="SearchBar-formGroup form-group panel">
          <label class="SearchBar-inputLabel hidden" id="searchlabel" for="q" aria-hidden="false">
            {{"Search" | translatePhrase}}
          </label>
          <select
            class="SearchBar-select form-control customSelect"
            v-if="searchPerimeter === 'libris'"
            v-model="activeSearchParam">
            <option 
              v-for="prop in searchParams"
              :key="prop.key"
              :value="prop">
              {{prop.key | translatePhrase}}
            </option>
          </select>
          <input type="text"
            class="SearchBar-input customInput form-control"
            v-model="searchPhrase"
            aria-labelledby="searchlabel"
            :placeholder="inputPlaceholder | translatePhrase"
            ref="searchBarInput">
          <span class="SearchBar-clear icon icon--md" v-show="hasInput" @click="clearInputs()">
            <i class="fa fa-fw fa-close"></i>
          </span>
          <button 
            class="SearchBar-submit btn btn-primary icon icon--white icon--md" 
            :aria-label="'Search' | translatePhrase"
            @click.prevent="doSearch"
            :class="{'disabled': searchPerimeter === 'remote' && status.remoteDatabases.length === 0}"
            :disabled="searchPerimeter === 'remote' && status.remoteDatabases.length === 0" >
            <i class="fa fa-search"></i>
          </button>
        </div>
      </div>
      <div class="SearchBar-typeButtons" 
        v-if="searchPerimeter === 'libris'"
        :aria-label="'Choose type' | translatePhrase">
        <label class="SearchBar-typeLabel" 
          :for="filter['@id']"
          v-for="filter in dataSetFilters" 
          :key="filter['@id']">
          <input type="checkbox" class="SearchBar-typeInput customCheckbox-input"
            :id="filter['@id']"
            v-model="activeTypes"
            :value="filter['@id']"/>
            <span class="SearchBar-typeText customCheckbox-icon">
              {{ filter.label }}
            </span>
        </label>
      </div>
      <remote-databases 
        v-if="searchPerimeter === 'remote'" 
        :remoteSearch="searchPhrase"
        @panelClosed="focusSearchInput"
        ref="dbComponent"></remote-databases>
    </form>
  </div>
</template>

<style lang="less">

.SearchBar {
  margin-top: 0vh;
  padding: 10px;
  transition: 0.3s ease margin-top;

  @media (min-width: @screen-md) {
    padding: 0 0 20px 0;
  }

  &-topControl {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &.is-landing-page {
    margin-top: 10vh;
  }

  &-help {
    margin-left: auto;
  }

  &-helpIcon {
    float: right;
    clear: right;

    & > i {
      vertical-align: bottom;
    }

    &:focus {
      outline: auto 5px;
    }
  }

  &-helpBox {
    float: none;
  }

  &-helpContent {
    background: @white;
    font-size: 12px;
    font-size: 1.2rem;
    display: none;
    left: auto;
    width: 300px;
    padding: 10px;
    margin-top: 10px;
    right: 0;
    top: 2em;

    .is-active & {
      display: block;
    }
  }

  &-helpTitle {
    font-weight: 700;
    font-size: 16px;
    font-size: 1.6rem;
  }

  &-input {
    color: @black;
    border-width: 0px 0px 0px 1px;
    border-radius: 0;
    width: 100%;
    box-shadow: none;
    &:focus {
      border-right: none;
    }
  }

  &-select {
    height: auto;
    min-width: unset;
    width: 8em;
    box-shadow: none;
    border: none;
    text-align-last: left;
  }

  &-inputLabel {
    display: block;
    text-transform: uppercase;
  }

  &-clear {
    align-self: center;
    flex: 1 1 2%;
    position: absolute;
    right: 110px;
  }

  &-submit {
    height: 42px;
    border: 0;
    border-radius: 0 4px 4px 0;
    box-shadow: none;

    @media (min-width: @screen-sm) {
      min-width: 84px;
    }
  }

  &-formGroup {
    width: 100%;
    display: inline-block;
    display: flex;
    box-shadow: 0 1px 1px 0 rgba(0,0,0,.10), 0 1px 3px 0 rgba(0,0,0,.12), 0 2px 1px -2px rgba(0,0,0,.1)

  }

  &-typeLabel {
    padding-right: 10px;
    font-weight: normal;
    position: relative;
  }

  &-typeInput {
  }

  &-typeText {
  }
}
</style>
