<script>
import * as _ from 'lodash';
import PropertyMappings from '@/resources/json/propertymappings.json';
import * as httpUtil from '@/utils/http';
import * as StringUtil from '@/utils/string';

export default {
  name: 'search-form',
  props: {
    siteTitle: '',
    filterParam: '',
    useSubmit: false,
    formDataSupported: false,
    isLandingPage: false,
    perimeter: '',
  },
  data() {
    return {
      vocabUrl: 'https://id.kb.se/vocab/',
      inputData: {
        textInput: [
            {
            value: '',
            class: 'searchphrase',
            }
        ],
        currentInput: 0,
        ids: []
      },
      remoteSearch: {
        q: '',
        activeDatabases: ['OCLC']
      }
    }
  },
  methods: {
      addSearchField() {
          const newobj = {};
          newobj.value='';
          newobj.class='searchphrase';
          this.inputData.textInput.push(newobj);
          this.inputData.currentInput += 1;
      },
      updateField() {
        const validTags = this.validSearchTags;
        if (this.currentIsTag) {
            this.currentField.class = 'searchtag valid';
        } else {
            this.currentField.class = 'searchphrase';
        }
      },
      handleFocus(focusedIndex) {
        this.inputData.currentInput = focusedIndex;
      },
      handleInput: function(e) {
        const currentElement = document.getElementById('searchQsmart').children[this.inputData.currentInput];
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
      doRemoteSearch() {
        const databases = this.remoteSearch.activeDatabases.join();
        const keywords = this.remoteSearch.q;
        const query = `q=${keywords}&databases=${databases}`;
        this.$router.push({ path: `/search/Remote/${query}` })
      },
      doSearch() {
        const validTags = this.validSearchTags;
        let queryText = [];
        for (const inputElement of this.inputData.textInput) {
            if (inputElement.class.indexOf('searchtag') > -1) {
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
        // _.each(this.inputData.ids, type => queryText.push(`@type=${type}`));
        const query = queryText.join('&');
        this.$router.push({ path: `/search/Libris/${query}` })
      },
      clearInputs() {
        this.inputData.currentInput = 0;
        this.inputData.textInput.splice(1, this.inputData.textInput.length);
        this.inputData.textInput[0].value = '';
        this.inputData.textInput[0].class = 'searchphrase';
      }
  },
  computed: {
      searchPerimeter() {
        if (this.perimeter) {
            return this.perimeter;
        }
        return 'Libris';
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
          const currentElement = document.getElementById('searchQsmart').children[this.inputData.currentInput];
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
      document.getElementById('searchQsmart').children[newValue].focus();
    },
  },
  mounted() {
    this.$nextTick(() => {
      if (this.searchPerimeter === 'Libris') {
        document.getElementById('searchQsmart').children[this.inputData.currentInput].focus();
      }
    });
  },
};
</script>

<template>
  <div class="search-form-container">
    <div class="panel panel-default search-controls">
      <div class="search-type-button-container">
        <router-link to="/search/Libris" class="card-link" :class="{'active': searchPerimeter === 'Libris' }">Libris</router-link>
        <router-link to="/search/Remote" class="card-link" :class="{'active': searchPerimeter === 'Remote' }">Andra källor</router-link>
      </div>
        <form id="searchForm">
            <div class="form-inline libris-search" v-if="searchPerimeter === 'Libris'">
                <div class="form-group">
                    <label class="search-label hidden" id="searchlabel" for="q">
                        {{"Search" | translatePhrase}}
                    </label>
                    <div id="searchFieldContainer">
                        <div class="form-control search-input">
                            <div aria-labelledby="searchlabel" id="searchQsmart">
                                <input
                                    list="matchingParameters"
                                    v-for="(input, index) in inputData.textInput"
                                    :key="index"
                                    @focus="handleFocus(index)"
                                    @input="updateField"
                                    @keydown="handleInput"
                                    v-model="input.value"
                                    class="smartInput"
                                    :class="input.class"
                                >
                                <datalist id="matchingParameters">
                                    <option v-for="matchingParameter in validSearchTags" :key="matchingParameter" :value="`${matchingParameter}:`">{{matchingParameter}}:</option>
                                </datalist>
                            </div>
                            <span v-show="hasInput" class="field-clearer" @click="clearInputs()"><i class="fa fa-fw fa-close"></i></span>
                        </div>
                        <button class="search-button btn btn-primary" @click.prevent="doSearch"><i class="fa fa-search"></i> {{"Search" | translatePhrase}}</button>
                    </div>
                </div>
            </div>
            <div class="form-inline remote-search" v-if="searchPerimeter === 'Remote'">
                <div class="form-group search-field">
                    <input type="text" class="form-control search-input" placeholder="ISBN eller valfria sökord" v-model="remoteSearch.q">
                    <button v-bind:class="{'disabled': remoteSearch.activeDatabases.length === 0}" v-on:click.prevent="doRemoteSearch()" class="search-button btn btn-primary"><i class="fa fa-search"></i> {{"Search" | translatePhrase}}</button>
                </div>
            </div>

            <div class="type-buttons" aria-label="Välj typ" v-if="searchPerimeter === 'Libris'">
                <label v-for="filter in dataSetFilters" :key="filter['@id']">
                    <input :value="filter['@id']" type="checkbox" :checked="filter['@id'] === 'Instance'" v-model="inputData.ids">
                    {{ filter.label }}
                </label>
            </div>
        </form>
    </div>
  </div>
</template>

<style lang="less">

.search-form-container {
    margin-top: 0vh;
    transition: 0.3s ease margin-top;
    .search-type-button-container {
        margin: 1.5em 0 1em;
        .search-type-button {
            display: inline-block;
            border: solid @gray;
            color: @gray-darker;
            font-size: 85%;
            line-height: 2em;
            font-weight: bold;
            text-transform: uppercase;
            border-width: 1px 1px 0px 1px;
            border-radius: 0.3em 0.3em 0px 0px;
            padding: 0px 10px;
            background-color: @gray-lighter;
            box-shadow: inset 0px -0.1em 0.1em rgba(0, 0, 0, 0.15);
            &.active {
                color: darken(@brand-primary, 15%);
                border-color: @brand-primary;
                background-color: desaturate(lighten(@brand-primary, 30%), 50%);
            }
        }
    }
    &.is-landing-page {
        margin-top: 10vh;
    }
    .search-controls {
        .libris-search {
            .form-group {
                input {
                    display: none;
                }
            }
        }
        .remote-search {
            
        }
        padding: 20px;
        .search-input {
            height: 44px;
            min-width: 75%;
        }
        .search-button {
            min-width: 20%;
            height: 42px;
        }
        .form-group {
            width: 100%;
            > div {
                display: flex;
            > div {
                flex-grow: 1;
                margin-right: 5px;
            }
        }
        #searchFieldContainer {
            > div {
                display: flex;
                justify-content: space-between;
                #searchQsmart {
                    display: flex;
                    flex: 8 8 98%;
                    flex-direction: row;
                    flex-wrap: nowrap;
                    line-height: 2em;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;

                    .searchphrase {
                        flex-grow: 1;
                        margin-right: 5px;
                        outline: none;
                        cursor: text;
                    }
                    .searchtag {
                        margin-right: 5px;
                        border-radius: 3px;
                        padding: 0px 5px;
                        outline: none;
                        cursor: text;
                    }
                    .valid {
                        background-color: #E0F2F1;
                    }
                    input {
                        border: 0px;
                        outline: none;
                        display: inline-block;
                    }
                }
                > .field-clearer {
                    cursor: pointer;
                    align-self: center;
                    flex: 1 1 2%;
                    &:hover {
                        color: #555;
                    }
                }
            }
        }
        }
        .search-label {
            display: block;
            text-transform: uppercase;
        }

        .type-label {
            display: block;
        }
        .type-buttons {
            label {
            padding: 3px 10px;
            font-weight: normal;
            font-size: 12px;
            input {
                margin-right: 0.2em;
            }
            }
            margin-top: 1em;
        }
    }
}

</style>
