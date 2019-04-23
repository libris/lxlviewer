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
      helpToggled: false,
      vocabUrl: 'https://id.kb.se/vocab/',
      staticProps: { _limit: 20 },
      searchPhrase: '',
      searchParams: PropertyMappings,
      activeSearchParam: null,
      activeTypes: null,
    };
  },
  methods: {
    focusSearchInput() {
      this.$refs.searchBarInput.focus();
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
    setTypes() {
      const performedQuery = cloneDeep(this.$route.query);
      if (isEmpty(performedQuery)) {
        return ['Instance']; // initial value
      }
      if (!performedQuery.hasOwnProperty('@type')) {
        return []; // explicitly no types
      }
      if (typeof performedQuery['@type'] === 'string') { 
        return [performedQuery['@type']]; // put a single @type into an array
      }
      return performedQuery['@type'];
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
      const styles = { top: `${$icon.clientHeight + $formGroup.clientHeight + 50}px` };
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
      return this.settings.dataSetFilters.libris.map(term => ({
        '@id': StringUtil.getCompactUri(term, this.resources.context),
        label: StringUtil.getLabelByLang(term, this.settings.language, this.resources.vocab, this.resources.context),
      }));
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
      return this.activeTypes.length > 0 ? { '@type': this.activeTypes } : {};
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
      this.activeTypes = this.setTypes();
      this.activeSearchParam = this.setSearch();
    },
  },
  mounted() {
    this.$nextTick(() => {
      this.focusSearchInput();
      this.activeSearchParam = this.setSearch();
      this.activeTypes = this.setTypes();
    });
  },
};
</script>

<template>
  <div class="SearchBar">
    <div class="SearchBar-topControl"> 
      <tab-menu :link="true" :tabs="[
        { 'id': 'libris', 'text': 'Libris', link: '/search/libris'},
        { 'id': 'remote', 'text': 'Other sources', link: '/search/remote' },
      ]" :active="searchPerimeter"></tab-menu>
      <div  v-if="searchPerimeter === 'libris'"  class="SearchBar-help">
        <div class="SearchBar-helpBox dropdown" >
          <span class="SearchBar-helpIcon icon icon--md">
            <i v-tooltip="searchHelpTooltip" class="fa fa-fw fa-question-circle" tabindex="0" aria-haspopup="true"
              ref="helpIcon"
              @mouseover="helpHover = true"
              @mouseleave="helpHover = false"
              @click="toggleHelp"
              @keyup.enter="toggleHelp"></i>
          </span>
          <div class="SearchBar-helpContainer" :style="helpContainerBoundaryStyles" v-if="helpToggled"> 
            <strong class="SearchBar-helpTitle">Operatorer för frågespråk</strong><i v-if="helpToggled" class="fa fa-times SearchBar-closeHelp" @click="toggleHelp"></i>
            <div class="SearchBar-helpContent" v-html="searchHelpDocs"></div>
          </div>
        </div>
      </div>
    </div>
    <form id="searchForm" class="SearchBar-form">
      <div class="SearchBar-formContent">
        <div ref="formGroup" class="SearchBar-formGroup form-group panel">
          <label class="SearchBar-inputLabel hidden" id="searchlabel" for="q" aria-hidden="false">
            {{"Search" | translatePhrase}}
          </label>
          <div class="SearchBar-selectWrapper" v-if="searchPerimeter === 'libris'">
            <select
              class="SearchBar-select form-control customSelect"
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
    box-shadow: 0 1px 1px 0 rgba(0,0,0,.10), 0 1px 3px 0 rgba(0,0,0,.12), 0 2px 1px -2px rgba(0,0,0,.1)
  }

  &-selectWrapper {
    flex: 1 0 auto;
    border: 1px solid @grey-light;
    border-right: 0;
    border-top-left-radius: 4px;
    border-bottom-left-radius: 4px;

    & + input {
      border-top-left-radius: 0;
      border-bottom-left-radius: 0;
    }
  }

  &-select {
    height: 100%;
    min-width: unset;
    box-shadow: none;
    text-align-last: left;
    border: none;
  }

  &-input {
    min-width: 100px;
    width: 100%;
    color: @black;
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
    border-right: 0;
    box-shadow: none;
    &:focus {
      border-right: none;
    }
  }

  &-inputLabel {
    display: block;
    text-transform: uppercase;
  }

  &-clear {
    position: absolute;
    right: 75px;
    height: 42px;
    display: flex;
    align-items: center;

    @media (min-width: 768px) {
      right: 110px;
    }
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
