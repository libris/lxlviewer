<script>
import * as _ from 'lodash';
import PropertyMappings from '@/resources/json/propertymappings.json';
import * as httpUtil from '@/utils/http';
import Copy from '@/resources/json/copy.json';
import * as StringUtil from '@/utils/string';

export default {
  name: 'search-form',
  props: {
    siteTitle: '',
    filterParam: '',
    useSubmit: false,
    formDataSupported: false,
    isLandingPage: false,
    searchPerimeter: {
        default: 'libris',
        type: String,
    },
  },
  data() {
    return {
      vocabUrl: 'https://id.kb.se/vocab/',
      inputData: {
        textInput: [
            {
            value: '',
            class: 'has-searchPhrase',
            }
        ],
        currentInput: 0,
        ids: []
      },
      remoteSearch: {
        q: '',
        activeDatabases: ['OCLC']
      },
      query: '',
      activeClass: 'is-active',
    }
  },
  methods: {
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
        newobj.class='has-searchPhrase';
        this.inputData.textInput.push(newobj);
        this.inputData.currentInput += 1;
    },
    updateField() {
      const validTags = this.validSearchTags;
      if (this.currentIsTag) {
          this.currentField.class = 'is-searchTag is-valid';
      } else {
          this.currentField.class = 'has-searchPhrase';
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
                }
            }
            if (queryText.length === 0) {
            return;
            }
            queryText.push('_limit=20');
            _.each(this.inputData.ids, id => queryText.push(`@type=${id}`));
            query = queryText.join('&');
        } else {
            const databases = this.remoteSearch.activeDatabases.join();
            const keywords = this.remoteSearch.q;
            query = `q=${keywords}&databases=${databases}`;
        }
        return query;
      },
      doSearch() {
        this.$router.push({ path: `/search/${this.searchPerimeter}/${this.composeQuery()}` })
      },
      clearInputs() {
        this.inputData.currentInput = 0;
        this.inputData.textInput.splice(1, this.inputData.textInput.length);
        this.inputData.textInput[0].value = '';
        this.inputData.textInput[0].class = 'has-searchPhrase';
      }
  },
  computed: {
      copy() {
        return Copy['search-form-help'];
      },
      header() {
          return this.copy.header;
      },
      text() {
        return this.copy.text;
      },
      settings() {
          return this.$store.getters.settings;
      },
      resources() {
          return this.$store.getters.resources;
      },
      dataSetFilters() {
        return this.settings.dataSetFilters.libris.map(term => {
            return {
            '@id': term.replace(this.settings.vocabPfx, ''),
            'label': StringUtil.getLabelByLang(term, this.settings.language, this.resources.vocab, this.settings.vocabPfx, this.resources.context)
            };
        });
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
  },
  watch: {
    currentComputedInput(newValue) {
      document.querySelector('.js-qsmartInput').children[newValue].focus();
    },
  },
  mounted() {
    this.$nextTick(() => {
      if (this.searchPerimeter === 'libris') {
        document.querySelector('.js-qsmartInput').children[this.inputData.currentInput].focus();
      }
    });
  },
};
</script>

<template>
  <div class="SearchBar panel panel-default">
    <ul class="SearchBar-sourceTabs" role="tablist">
      <router-link to="/search/libris" class="SearchBar-sourceTab" role="tab"
        aria-controls="librisPanel" 
        aria-selected="true"
        :class="{'is-active': searchPerimeter === 'libris' }">Libris
      </router-link>
      <router-link to="/search/remote" class="SearchBar-sourceTab" role="tab"
        aria-controls="remotePanel" 
        aria-selected="false"
        :class="{'is-active': searchPerimeter === 'remote' }">Andra källor
      </router-link>
    </ul>
    <div class="SearchBar-help">
      <div class="SearchBar-helpBox dropdown" @mouseleave="hideHelp()">
        <span class="SearchBar-helpIcon">
          <i class="fa fa-fw fa-question-circle-o" tabindex="0" aria-haspopup="true"
            @mouseover="showHelp()"
            @keyup.enter="toggleHelp()"></i>
        </span>
        <div class="SearchBar-helpContent js-searchHelpText dropdown-menu"> 
          <strong class="SearchBar-helpTitle">{{ header }}</strong>
          <p v-for="(paragraph, index) in text.paragraphs" v-html="paragraph" :key='index'></p>
        </div>
      </div>
    </div>       
    <form id="searchForm" class="SearchBar-form">
      <div class="is-librisSearch" id="librisPanel" role="tabpanel" 
        aria-labelledby="librisTab"
        v-if="searchPerimeter === 'libris'" 
        aria-hidden="false">
        <div class="SearchBar-formGroup form-group ">
          <label class="SearchBar-inputLabel hidden" id="searchlabel" for="q">
            {{"Search" | translatePhrase}}
          </label>
          <div class="SearchBar-inputWrap" id="searchFieldContainer">
            <div class="SearchBar-input form-control">
              <div class="SearchBar-qsmart js-qsmartInput" aria-labelledby="searchlabel">
                <input
                    list="matchingParameters"
                    v-for="(input, index) in inputData.textInput"
                    :key="index"
                    @focus="handleFocus(index)"
                    @input="updateField"
                    @keydown="handleInput"
                    v-model="input.value"
                    class="SearchBar-qsmartInput"
                    :class="input.class">
                <datalist id="matchingParameters">
                  <option v-for="matchingParameter in validSearchTags" 
                    :key="matchingParameter" 
                    :value="`${matchingParameter}:`">
                    {{matchingParameter}}:
                  </option>
                </datalist>
              </div>
              <span class="SearchBar-clear" v-show="hasInput" @click="clearInputs()">
                <i class="fa fa-fw fa-close"></i>
              </span>
            </div>
            <button class="SearchBar-submit btn btn-primary" @click.prevent="doSearch">
              <i class="fa fa-search"></i> {{"Search" | translatePhrase}}
            </button>
          </div>
        </div>
      </div>
      <div class="is-remoteSearch" id="remotePanel" role="tabpanel" 
        aria-labelledby="remoteTab"
        v-if="searchPerimeter === 'remote'" 
        aria-hidden="true">
        <div class="SearchBar-formGroup form-group">
          <input type="text" class="SearchBar-input form-control" placeholder="ISBN eller valfria sökord" 
            v-model="remoteSearch.q">
          <button class="SearchBar-submit btn btn-primary"
            v-bind:class="{
              'disabled': remoteSearch.activeDatabases.length === 0
            }" 
            v-on:click.prevent="doSearch">
            <i class="fa fa-search"></i> {{"Search" | translatePhrase}}
          </button>
        </div>
      </div>
      <div class="SearchBar-typeButtons" aria-label="Välj typ" v-if="searchPerimeter === 'libris'">
        <label v-for="filter in dataSetFilters" :key="filter['@id']" class="SearchBar-typeLabel">
          <input type="checkbox" class="Searchbar-typeInput"
            :checked="filter['@id'] === 'Instance'" 
            v-model="inputData.ids"
            :value="filter['@id']">
            {{ filter.label }}
        </label>
      </div>
    </form>
  </div>
</template>

<style lang="less">

.SearchBar {
  margin-top: 0vh;
  padding: 20px;
  transition: 0.3s ease margin-top;

  &-sourceTabs {
    margin: 1.5em 0 1em;
    padding: 0;
  }

  &-sourceTab {
    color: @brand-primary;
    font-weight: 700;
    margin: 0.25em 0;
    padding: 0.4em 1em;
    text-transform: uppercase;
    transition: color 0.5s ease;

    &.is-active {
      background-color: @brand-primary;
      color: #fff;
    }
  }

  &.is-landing-page {
    margin-top: 10vh;
  }

  &-help {
    margin-top: -35px;
  }

  &-helpIcon {
    clear: right;
    cursor: pointer;
    font-size: 18px;
    float: right;
    margin-right: 24px;
    width: 20%;

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
    display: none;
    left: auto;
    max-width: 300px;
    padding: 10px;
    right: 0;
    top: 2em;
    width: 30%;

    .is-active & {
      display: block;
    }
  }

  &-helpTitle {
    font-weight: 700;
  }

  &-input {
    height: 44px;
    min-width: 75%;
    margin: 0 5px 0 0;
    flex-grow: 1;
    display: flex;
    justify-content: space-between;

    .is-remoteSearch & {
      width: 100%;
    }
  }

  &-inputWrap {
    display: flex;
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
    line-height: 2em;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &-qsmartInput {
    border: 0px;
    outline: none;
    display: inline-block;

    &.has-searchPhrase {
      flex-grow: 1;
      margin-right: 5px;
      outline: none;
      cursor: text;
    }

    &.has-searchPhrase {
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
    cursor: pointer;
    align-self: center;
    flex: 1 1 2%;

    &:hover {
        color: #555;
    }
  }

  &-submit {
    min-width: 20%;
    height: 42px;   
  }

  &-formGroup {
    width: 100%;
    display: inline-block;

    .is-remoteSearch & {
      display: flex;
    }
  }

  &-typeButtons {
    margin-top: 1em;  
  }

  &-typeLabel {
    padding: 3px 10px;
    font-weight: normal;
    font-size: 12px;   
  }

  &-typeInput {
    margin-right: 0.2em;   
  }
}
</style>
