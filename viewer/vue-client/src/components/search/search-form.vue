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
    // resultData: {},
  },
  data() {
    return {
      vocabUrl: 'https://id.kb.se/vocab/',
      // inputData: {
      //   type: 'q',
      //   q: this.$route.query.q,
      // },
      // searchParams: {
      //   _limit: 20,
      //   // currentInput: 0,
      //   '@type': ['Instance', 'Work'],
      // },
      query: (() => {
        if (isEmpty(this.$route.query)) {
          return {
            q: '',
            _limit: 20,
            '@type': ['Instance'],
          };
        }
        const currentQuery = cloneDeep(this.$route.query);
        if (typeof currentQuery['@type'] === 'string') { // put a single @type into an array
          currentQuery['@type'] = [currentQuery['@type']];
        }
        return currentQuery;
      })(),
      // remoteSearch: {
      //   q: '',
      // },
      // query: '',
      // activeClass: 'is-active',
      // currentSearchEl: null,
    };
  },
  methods: {
    focusSearchInput() {
      // this.currentSearchEl = this.searchPerimeter === 'libris' ? this.$refs.librisSearch : this.$refs.remoteSearch;
      // this.currentSearchEl.focus();
      this.$refs.searchBarInput.focus();
    },
    switchPerimeter(id) {
      this.$router.push({ path: `/search/${id}` });
      // this.moveQuery(id);
    },
    // moveQuery(toPerimeter) {
    //   const qIndex = findIndex(this.inputData.textInput, { class: 'is-searchPhrase' });
    //   if (toPerimeter === 'libris') {
    //     this.inputData.textInput[qIndex].value = this.remoteSearch.q;
    //   } else {
    //     this.remoteSearch.q = this.inputData.textInput[qIndex].value;
    //   }
    // },
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
    // addSearchField() {
    //   const newobj = {};
    //   newobj.value = '';
    //   newobj.class = 'is-searchPhrase';
    //   this.inputData.textInput.push(newobj);
    //   this.inputData.currentInput += 1;
    // },
    // updateField() {
    //   if (this.currentIsTag) {
    //     this.currentField.class = 'is-searchTag is-valid';
    //   } else {
    //     this.currentField.class = 'is-searchPhrase';
    //   }
    // },
    // handleFocus(focusedIndex) {
    //   this.inputData.currentInput = focusedIndex;
    // },
    // handleInput(e) {
    //   const currentElement = document.querySelector('.js-qsmartInput').children[this.inputData.currentInput];
    //   if (e.keyCode === 13) { // Enter
    //     e.preventDefault();
    //     if (!this.currentIsTag) {
    //       this.doSearch();
    //     } else if (this.inputData.currentInput === this.inputData.textInput.length - 1) {
    //       this.addSearchField();
    //     } else {
    //       this.inputData.currentInput += 1;
    //     }
    //   } else if (e.keyCode === 8 // Backspace
    //   && !this.currentIsTag
    //   && currentElement.value.slice(0, currentElement.selectionStart).length === 0
    //   && this.inputData.textInput.length >= 2) {
    //     e.preventDefault();
    //     this.inputData.textInput.splice(this.inputData.currentInput - 1, 1);
    //     this.inputData.currentInput -= 1;
    //   }
    // },
    composeQuery() {
      let query = '';
      if (this.searchPerimeter === 'libris') {
        // const validTags = this.validSearchTags;
        const queryArr = [];
        Object.keys(this.query).forEach((param) => {
          if (Array.isArray(this.query[param])) {
            this.query[param].forEach((el) => {
              queryArr.push(`${param}=${el}`);
            });
          } else queryArr.push(`${param}=${this.query[param]}`);
        });
        query = queryArr.join('&');
      } else {
        const databases = this.status.remoteDatabases.join();
        const keywords = this.query.q;
        query = `q=${keywords}&databases=${databases}`;
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
      // this.inputData.currentInput = 0;
      // this.inputData.textInput.splice(1, this.inputData.textInput.length);
      // this.inputData.textInput[0].value = '';
      // this.inputData.textInput[0].class = 'is-searchPhrase';
      this.query.q = '';
      this.focusSearchInput();
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
    // usedFilters() {
    //   const filters = [];
    //   if (typeof this.resultData.search !== 'undefined') {
    //     this.resultData.search.mapping.forEach((item) => {
    //       if (item.variable !== 'q') {
    //         let filter = '';
    //         if (typeof item.object !== 'undefined') {
    //           if (item.variable === '@type') {
    //             filter = item.object['@id'];
    //           } else {
    //             filter = item.object['@id'].replace('https://id.kb.se/', '');
    //           }
    //         } else {
    //           filter = item.value;
    //         }
    //         filters.push(filter);
    //       }
    //     });
    //   }
    //   return filters;
    // },
    // usedTextInput() {
    //   let textInput = '';
    //   if (typeof this.resultData.search !== 'undefined') {
    //     this.resultData.search.mapping.forEach((item) => {
    //       if (item.variable === 'q') {
    //         textInput = item.value;
    //       } 
    //     });
    //   }
    //   return textInput;
    // },
    // currentIsTag() {
    //   const value = this.currentField.value;
    //   return value.indexOf(':') > -1 && this.validSearchTags.indexOf(value.split(':')[0]) > -1;
    // },
    // currentField() {
    //   return this.inputData.textInput[this.inputData.currentInput];
    // },
    // caretIsAtStart() {
    //   const currentElement = document.querySelector('.js-qsmartInput').children[this.inputData.currentInput];
    //   return currentElement.value.slice(0, currentElement.selectionStart).length === 0;
    // },
    validSearchTags() {
      const searchTags = PropertyMappings.map(property => property.key);
      return searchTags;
    },
    // currentComputedInput() {
    //   return this.inputData.currentInput;
    // },
    hasInput() {
      // let hasInput = false;
      // each(this.inputData.textInput, (inputField) => {
      //   if (inputField.value !== '') {
      //     hasInput = true;
      //   }
      // });
      // return hasInput;

      // value in input?
      return this.query.q.length > 0;
    },
    inputPlaceholder() {
      return this.searchPerimeter === 'remote' ? 'ISBN eller valfria sökord' : 'Search';
    },
  },
  components: {
    'remote-databases': RemoteDatabases,
    'tab-menu': TabMenu,
  },
  watch: {
    // currentComputedInput(newValue) {
    //   document.querySelector('.js-qsmartInput').children[newValue].focus();
    // },
    searchPerimeter(newVal, oldVal) {
      if (newVal !== oldVal) {
        this.$nextTick(() => {
          this.focusSearchInput();
        });
      }
    },
    // resultData(newVal) {
    //   if (typeof newVal !== 'undefined' && Object.keys(newVal).length) {
    //     if (this.usedTextInput !== '') {
    //       const newObj = {};
    //       const usedTextInput = [];
    //       newObj.value = this.usedTextInput;
    //       newObj.class = 'is-searchPhrase';
    //       usedTextInput.push(newObj);
          
    //       this.inputData.textInput = usedTextInput;
    //     } 
    //   }
    // },
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
          <!-- <div class="SearchBar-inputWrap" id="searchFieldContainer"> -->
            <!-- <div class="SearchBar-input customInput form-control"> -->
              <!-- <div class="SearchBar-qsmart js-qsmartInput" aria-labelledby="searchlabel"> -->
                <input type="text"
                  class="SearchBar-input customInput form-control"
                  v-model="query.q"
                  aria-labelledby="searchlabel"
                  :placeholder="inputPlaceholder | translatePhrase"
                  ref="searchBarInput">
                <!-- <input type="text" 
                  class="SearchBar-input customInput form-control" 
                  placeholder="ISBN eller valfria sökord"
                  aria-label="ISBN eller valfria sökord"
                  v-model="inputData.q"
                  ref="remoteSearch"> -->
                <!-- <datalist id="matchingParameters">
                  <option v-for="matchingParameter in validSearchTags" 
                    :key="matchingParameter" 
                    :value="`${matchingParameter}:`">
                    {{matchingParameter}}:
                  </option>
                </datalist> -->
              <!-- </div> -->
              <span class="SearchBar-clear icon icon--md" v-show="hasInput" @click="clearInputs()">
                <i class="fa fa-fw fa-close"></i>
              </span>
            <!-- </div> -->
            <button 
              class="SearchBar-submit btn btn-primary icon icon--white icon--md" 
              :aria-label="'Search' | translatePhrase"
              @click.prevent="doSearch"
              :class="{'disabled': searchPerimeter === 'remote' && status.remoteDatabases.length === 0}"
              :disabled="searchPerimeter === 'remote' && status.remoteDatabases.length === 0" >
              <i class="fa fa-search"></i>
            </button>
            <!-- <button 
              v-else-if="searchPerimeter === 'remote'"
              class="SearchBar-submit btn btn-primary icon icon--white icon--md"
              :aria-label="'Search' | translatePhrase"
              v-bind:class="{'disabled': status.remoteDatabases.length === 0}"
              :disabled="status.remoteDatabases.length === 0" 
              v-on:click.prevent="doSearch">
            <i class="fa fa-search"></i>
          </button> -->
          <!-- </div> -->
        </div>
      </div>
      <!-- <div 
        class="SearchBar-formContent"
        v-if="searchPerimeter === 'remote'">
        <div class="SearchBar-formGroup form-group panel">
        </div>
      </div> -->
      <div class="SearchBar-typeButtons" 
        v-if="searchPerimeter === 'libris'"
        :aria-label="'Choose type' | translatePhrase">
        <label class="SearchBar-typeLabel" 
          :for="filter['@id']"
          v-for="filter in dataSetFilters" 
          :key="filter['@id']">
          <input type="checkbox" class="SearchBar-typeInput customCheckbox-input"
            :id="filter['@id']"
            v-model="query['@type']"
            :value="filter['@id']"/>
            <span class="SearchBar-typeText customCheckbox-icon">
              {{ filter.label }}
            </span>
        </label>
      </div>
      <remote-databases 
        v-if="searchPerimeter === 'remote'" 
        :remoteSearch="query.q"
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
    border-width: 1px 0 1px 1px;
    border-radius: 4px 0 0 4px;
    width: 100%;
    box-shadow: none;

    &:focus {
      border-right: none;
    }
  }

  // &-inputWrap {
  //   display: flex;
  //   margin-bottom: 0;
  // }

  &-inputLabel {
    display: block;
    text-transform: uppercase;
  }

  // &-qsmart {
  //   display: flex;
  //   flex: 8 8 98%;
  //   flex-direction: row;
  //   flex-wrap: nowrap;
  //   white-space: nowrap;
  //   overflow: hidden;
  //   text-overflow: ellipsis;
  // }

  // &-qsmartInput {
  //   border: 0px;
  //   outline: none;
  //   display: inline-block;

  //   &.is-searchPhrase {
  //     flex-grow: 1;
  //     margin-right: 5px;
  //     padding: 0;
  //     outline: none;
  //     cursor: text;
  //     color: @black;
  //   }

  //   &.is-searchTag {
  //     margin-right: 5px;
  //     border-radius: 3px;
  //     padding: 0px 5px;
  //     outline: none;
  //     cursor: text;
  //   }
          
  //   &.is-valid {
  //     background-color: #E0F2F1;
  //   }
  // }

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
