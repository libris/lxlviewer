<script>
import * as _ from 'lodash';
import PropertyMappings from '@/resources/json/propertymappings.json';
import * as httpUtil from '@/utils/http';
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
    resultData: {},
  },
  data() {
    return {
      vocabUrl: 'https://id.kb.se/vocab/',
      inputData: {
        textInput: [
            {
            value: '',
            class: 'is-searchPhrase',
            }
        ],
        currentInput: 0,
        ids: ['Instance']
      },
      remoteSearch: {
        q: '',
      },
      query: '',
      activeClass: 'is-active',
    }
  },
  methods: {
    focusSearchForm() {
      if (this.searchPerimeter === 'libris') {
        document.querySelectorAll('#librisPanel input')[0].focus();
      } else {
        document.querySelectorAll('#remotePanel input')[0].focus();
      }
    },
    switchPerimeter(id) {
      this.$router.push({ path: `/search/${id}` });
    },
    removeTags(html) {
      let regexHtml = html.replace(/<h1.*>.*?<\/h1>/ig,'').replace(/<h2.*>.*?<\/h2>/ig,'');
      regexHtml = regexHtml.replace(/(<\/?(?:code|br|p)[^>]*>)|<[^>]+>/ig, '$1');
      return regexHtml;
    },
    transformMarkdownToHTML(markdown) {
      let html = marked(markdown);
      html = this.removeTags(html);
      return html;
    },
    showHelp() {
      let helpText = document.querySelector('.js-searchHelpText');
      helpText.parentElement.classList.add(this.activeClass);
    },
    hideHelp() {
      let helpText = document.querySelector('.js-searchHelpText');
      if (helpText.parentElement.classList.contains(this.activeClass)) {
        helpText.parentElement.classList.remove(this.activeClass);
      } 
    },
    toggleHelp() {
      let helpText = document.querySelector('.js-searchHelpText');
      helpText.parentElement.classList.toggle(this.activeClass);
    },
    addSearchField() {
        const newobj = {};
        newobj.value='';
        newobj.class='is-searchPhrase';
        this.inputData.textInput.push(newobj);
        this.inputData.currentInput += 1;
    },
    updateField() {
      const validTags = this.validSearchTags;
      if (this.currentIsTag) {
          this.currentField.class = 'is-searchTag is-valid';
      } else {
          this.currentField.class = 'is-searchPhrase';
      }
    },
    handleFocus(focusedIndex) {
      this.inputData.currentInput = focusedIndex;
    },
    handleInput: function(e) {
      const currentElement = document.querySelector('.js-qsmartInput').children[this.inputData.currentInput];
      if (e.keyCode === 13) { // Enter
          e.preventDefault();
          if (!this.currentIsTag) {
              this.doSearch();
          } else if (this.inputData.currentInput === this.inputData.textInput.length-1) {
              this.addSearchField();
          } else {
              this.inputData.currentInput += 1;
          }
      } else if (e.keyCode === 8 && // Backspace
      !this.currentIsTag &&
      currentElement.value.slice(0, currentElement.selectionStart).length === 0 &&
      this.inputData.textInput.length >= 2) {
          e.preventDefault();
          this.inputData.textInput.splice(this.inputData.currentInput-1, 1);
          this.inputData.currentInput -= 1;
      }
    },
    composeQuery() {
        let query = '';
        if (this.searchPerimeter === 'libris') {
            const validTags = this.validSearchTags;
            let queryText = [];
            for (const inputElement of this.inputData.textInput) {     
                if (inputElement.class.indexOf('is-searchTag') > -1) {
                    const tag = inputElement.value.split(':');
                    const tagKey = tag[0];
                    const tagValue = tag[1];
                    if (validTags.indexOf(tagKey) > -1) {
                        _.each(PropertyMappings, obj => {
                            if (obj.key === tagKey) {
                                _.each(obj.mappings, (mappingValue, mappingKey) => {
                                    if (mappingValue === '') {
                                        queryText.push(`${mappingKey}=${tagValue}`);
                                    } else {
                                        queryText.push(`${mappingKey}=${mappingValue}`);
                                    }
                                });
                            }
                        });
                    }
                } else if (inputElement.value !== '') {
                    queryText.push(`q=${inputElement.value}`);
                } else {
                  queryText.push('q=*');
                }
            }
            if (queryText.length === 0) {
            return;
            }
            queryText.push('_limit=20');
            _.each(this.inputData.ids, id => queryText.push(`@type=${id}`));
            query = queryText.join('&');
        } else {
            const databases = this.status.remoteDatabases.join();
            const keywords = this.remoteSearch.q;
            query = `q=${keywords}&databases=${databases}`;
        }
        return query;
      },
      doSearch() {
        this.$router.push({ path: `/search/${this.searchPerimeter}?${this.composeQuery()}` });
        
        if (this.searchPerimeter === 'remote') {
          this.$refs.dbComponent.showList = false;
        };
      },
      clearInputs() {
        this.inputData.currentInput = 0;
        this.inputData.textInput.splice(1, this.inputData.textInput.length);
        this.inputData.textInput[0].value = '';
        this.inputData.textInput[0].class = 'is-searchPhrase';
      }
  },
  computed: {
    searchHelpDocs() {
      if (this.docs && this.docs.hasOwnProperty('search-01-queries')) {
        return this.transformMarkdownToHTML(this.docs['search-01-queries'].content)
      } else {
        return StringUtil.getUiPhraseByLang('Something went wrong', this.settings.language);
      }
    },
    docs() {
      if (this.resources.helpDocs != null) {
        const json = this.resources.helpDocs;
        return json;
      } else {
        return null;
      }
    },
    ...mapGetters([
      'resources',
      'settings',
      'status',
    ]),
      dataSetFilters() {
        return this.settings.dataSetFilters.libris.map(term => {
            return {
            '@id': StringUtil.getCompactUri(term, this.resources.context),
            'label': StringUtil.getLabelByLang(term, this.settings.language, this.resources.vocab, this.resources.context)
            };
        });
      },
      usedFilters() {
        const filters = [];
        if (typeof this.resultData.search !== 'undefined') {
            this.resultData.search.mapping.forEach(item => {
            if (item.variable !== 'q') {
              let filter = '';
              if (typeof item.object !== 'undefined') {
                if (item.variable === '@type') {
                  filter = item.object['@id'];
                } else {
                  filter = item.object['@id'].replace('https://id.kb.se/', '');
                }
              } else {
                filter = item.value;
              }
              filters.push(filter);
            }
          });
        }
        return filters;
      },
      usedTextInput() {
        let textInput = '';
        if (typeof this.resultData.search !== 'undefined') {
            this.resultData.search.mapping.forEach(item => {
            if (item.variable === 'q') {
              textInput = item.value;
            } 
          });
        }
        return textInput;
      },
      currentIsTag() {
          const value = this.currentField.value;
          return value.indexOf(':') > -1 && this.validSearchTags.indexOf(value.split(':')[0]) > -1;
      },
      currentField() {
          return this.inputData.textInput[this.inputData.currentInput];
      },
      caretIsAtStart() {
          const currentElement = document.querySelector('.js-qsmartInput').children[this.inputData.currentInput];
          return currentElement.value.slice(0, currentElement.selectionStart).length === 0;
      },
      validSearchTags() {
        const searchTags = PropertyMappings.map(property => property.key);
        return searchTags;
      },
      currentComputedInput() {
        return this.inputData.currentInput;
      },
      hasInput() {
        let hasInput = false;
        _.each(this.inputData.textInput, inputField => {
            if (inputField.value !== '') {
                hasInput = true;
            }
        });
        return hasInput;
      }
  },
  components: {
    'remote-databases': RemoteDatabases,
    'tab-menu': TabMenu,
  },
  watch: {
    currentComputedInput(newValue) {
      document.querySelector('.js-qsmartInput').children[newValue].focus();
    },
    searchPerimeter(newVal, oldVal) {
      if (newVal !== oldVal) {
        this.$nextTick(() => {
          this.focusSearchForm();
        });
      }
    },
    resultData: function(newVal, oldVal) {
      if (typeof newVal !== 'undefined' && Object.keys(newVal).length) {

        // don't include filters from facets on new search
        // if (this.usedFilters !== '') {
          // this.inputData.ids = this.usedFilters;
        // }

        if (this.usedTextInput !== '') {
          const newObj = {};
          const usedTextInput = [];
          newObj.value = this.usedTextInput;
          newObj.class='is-searchPhrase';
          usedTextInput.push(newObj);
          
          this.inputData.textInput = usedTextInput;
        } 
      }
    },
  },
  mounted() {
    this.$nextTick(() => {
      this.focusSearchForm();
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
      <div class="SearchBar-formContent is-librisSearch" id="librisPanel"
        v-if="searchPerimeter === 'libris'">
        <div class="SearchBar-formGroup form-group">
          <label class="SearchBar-inputLabel hidden" id="searchlabel" for="q" aria-hidden="false">
            {{"Search" | translatePhrase}}
          </label>
          <div class="SearchBar-inputWrap panel" id="searchFieldContainer">
            <div class="SearchBar-input customInput form-control">
              <div class="SearchBar-qsmart js-qsmartInput" aria-labelledby="searchlabel">
                <input name="q"
                  aria-labelledby="searchlabel"
                  list="matchingParameters"
                  v-for="(input, index) in inputData.textInput"
                  :key="index"
                  @focus="handleFocus(index)"
                  @input="updateField"
                  @keydown="handleInput"
                  v-model="input.value"
                  class="SearchBar-qsmartInput"
                  :placeholder="'Search' | translatePhrase"
                  :class="input.class">
                <datalist id="matchingParameters">
                  <option v-for="matchingParameter in validSearchTags" 
                    :key="matchingParameter" 
                    :value="`${matchingParameter}:`">
                    {{matchingParameter}}:
                  </option>
                </datalist>
              </div>
              <span class="SearchBar-clear icon icon--md" v-show="hasInput" @click="clearInputs()">
                <i class="fa fa-fw fa-close"></i>
              </span>
            </div>
            <button class="SearchBar-submit btn btn-primary icon icon--md" 
              :aria-label="'Search' | translatePhrase"
              @click.prevent="doSearch">
              <i class="fa fa-search"></i>
            </button>
          </div>
        </div>
      </div>
      <div 
        class="SearchBar-formContent is-remoteSearch" 
        id="remotePanel" 
        v-if="searchPerimeter === 'remote'">
        <div class="SearchBar-formGroup form-group panel">
          <input type="text" class="SearchBar-input customInput form-control" placeholder="ISBN eller valfria sökord" 
            v-model="remoteSearch.q">
          <button 
            class="SearchBar-submit btn btn-primary icon icon--md"
            :aria-label="'Search' | translatePhrase"
            v-bind:class="{'disabled': status.remoteDatabases.length === 0}"
            :disabled="status.remoteDatabases.length === 0" 
            v-on:click.prevent="doSearch">
            <i class="fa fa-search"></i>
          </button>
        </div>
      </div>
      <div class="SearchBar-typeButtons" aria-label="Välj typ" 
        v-if="searchPerimeter === 'libris'">
        <label class="SearchBar-typeLabel" 
          :for="filter['@id']"
          v-for="filter in dataSetFilters" 
          :key="filter['@id']">
          <input type="checkbox" class="SearchBar-typeInput customCheckbox-input"
            :id="filter['@id']"
            v-model="inputData.ids"
            :value="filter['@id']"/>
            <span class="SearchBar-typeText customCheckbox-icon">
              {{ filter.label }}
            </span>
        </label>
      </div>
      <remote-databases v-if="searchPerimeter === 'remote'" :remoteSearch="remoteSearch" ref="dbComponent"></remote-databases>
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
    border-width: 1px 0 1px 1px;
    border-radius: 4px 0 0 4px;

    .is-remoteSearch & {
      width: 100%;
    }
  }

  &-inputWrap {
    display: flex;
    margin-bottom: 0;
  }

  &-inputLabel {
    display: block;
    text-transform: uppercase;
  }

  &-qsmart {
    display: flex;
    flex: 8 8 98%;
    flex-direction: row;
    flex-wrap: nowrap;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &-qsmartInput {
    border: 0px;
    outline: none;
    display: inline-block;

    &.is-searchPhrase {
      flex-grow: 1;
      margin-right: 5px;
      outline: none;
      cursor: text;
    }

    &.is-searchTag {
      margin-right: 5px;
      border-radius: 3px;
      padding: 0px 5px;
      outline: none;
      cursor: text;
    }
          
    &.is-valid {
      background-color: #E0F2F1;
    }
  }

  &-clear {
    align-self: center;
    flex: 1 1 2%;
  }

  &-submit {
    height: 42px;
    border: 0;
    border-radius: 0 4px 4px 0;

    @media (min-width: @screen-sm) {
      min-width: 84px;
    }
  }

  &-formGroup {
    width: 100%;
    display: inline-block;

    .is-remoteSearch & {
      display: flex;
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
