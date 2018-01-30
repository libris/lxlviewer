<script>
import * as _ from 'lodash';
import PropertyMappings from '../../../../resources/json/propertymappings.json';
import * as httpUtil from '../../utils/http';
import * as StringUtil from '../../utils/string';
import { changeResultListStatus, changeStatus } from '../../vuex/actions';
import { getSettings, getStatus, getVocabulary, getContext } from '../../vuex/getters';
export default {
  name: 'search-form',
  vuex: {
    getters: {
      settings: getSettings,
      status: getStatus,
      vocab: getVocabulary,
      context: getContext,
    },
    actions: {
      changeStatus,
      changeResultListStatus,
    },
  },
  props: {
    siteTitle: '',
    result: {},
    filterParam: '',
    useSubmit: false,
    formDataSupported: false,
    isLandingPage: false,
  },
  data() {
    return {
      vocabUrl: 'https://id.kb.se/vocab/',
      inputData: {
        textInput: [
            {
                value: '',
                class: 'searchphrase',
            },
        ],
        currentInput: 0,
        ids: [],
      },
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
        queryText.push('_limit=20');
        _.each(this.inputData.ids, id => queryText.push(`${this.filterParam}=${id}`));
        // _.each(this.inputData.ids, type => queryText.push(`@type=${type}`));
        const url = `/find?${queryText.join('&')}`;
        const resultPromise = new Promise((resolve, reject) => {
            httpUtil.get({ url: url, accept: 'application/ld+json' })
            .then((response) => {
                history.pushState(response, 'unused', response['@id']);
                resolve(response);
            }, (error) => {
                history.pushState({}, 'unused', url);
                reject('Error searching...', error);
            });
        });
        this.$dispatch('newresult', resultPromise);
      },
      clearInputs() {
        this.inputData.currentInput = 0;
        this.inputData.textInput.splice(1, this.inputData.textInput.length);
        this.inputData.textInput[0].value = '';
        this.inputData.textInput[0].class = 'searchphrase';
      },
      searchHelpOpen() {
        console.log('show help');
      }
  },
  computed: {
      observations() {
          const observations = [];
          const statistics = this.result.statistics || this.result.stats;
          const dimensionObservations = statistics.sliceByDimension; //this.result.stats.sliceByDimension
          _.each(dimensionObservations, dimensionObservation => {
            _.each(dimensionObservation.observation, observation => {
              const obs = {};
              obs['@id'] = observation.object['@id'].replace(this.vocabUrl, '');
              obs.label = StringUtil.getLabelFromObject(observation.object, this.settings.language);
              observations.push(obs);
            });
          });
          return observations;
      },
      dataSetFilters() {
          if (this.settings.siteInfo.title === 'libris.kb.se') {
            return this.settings.dataSetFilters.libris.map(term => {
              return {
                '@id': term.replace(this.settings.vocabPfx, ''),
                'label': StringUtil.getLabelByLang(term, this.settings.language, this.vocab, this.settings.vocabPfx, this.context)
              };
            });
          }
          return this.observations;
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
  ready() { // Ready method is deprecated in 2.0, switch to "mounted"
    this.$nextTick(() => {
      document.getElementById('searchQsmart').children[this.inputData.currentInput].focus();
    });
  },
};
</script>

<template>
  <div :class="{'is-landing-page': isLandingPage}" class="search-form-container">
    <div class="panel panel-default search-controls">
      <div class="search-type-button-container" v-if="settings.siteInfo.title === 'libris.kb.se'">
        <a class="card-link active">Libris</a>
        <a class="card-link" href="/import">Andra källor</a>
      </div>
        <form action="/find" method="GET" id="searchForm" class="searchForm">
            <div class="form-inline">
                <div class="form-group">

                    <label class="search-label hidden" id="searchlabel" for="q">
                        {{"Search" | translatePhrase}}
                    </label>
                    <div id="searchFieldContainer">

                        <div class="form-control search-input">
                            <span tabindex="0" class="search-help-icon" @keyup.enter="searchHelpOpen()"><i class="fa fa-fw fa-question-circle"></i></span>
                            <div aria-labelledby="searchlabel" id="searchQsmart">
                                <input
                                    list="matchingParameters"
                                    v-for="input in inputData.textInput"
                                    @focus="handleFocus($index)"
                                    @input="updateField"
                                    @keydown="handleInput"
                                    v-model="input.value"
                                    class="smartInput"
                                    :class="input.class"
                                >
                                <datalist id="matchingParameters">
                                    <option v-for="matchingParameter in validSearchTags" :value="`${matchingParameter}:`">{{matchingParameter}}:</option>
                                </datalist>

                            </div>
                            <span v-show="hasInput" class="field-clearer" @click="clearInputs()"><i class="fa fa-fw fa-close"></i></span>
                        </div>
                        <button id="searchSubmit" class="search-button btn btn-primary" @click.prevent="doSearch"><i class="fa fa-search"></i> {{"Search" | translatePhrase}}</button>
                    </div>
                </div>
            </div>

            <div class="type-buttons" aria-label="Välj typ" v-if="!result.totalItems || settings.siteInfo.title === 'libris.kb.se'">
                <label v-for="filter in dataSetFilters">
                    <input :value="filter['@id']" type="checkbox" :checked="filter['@id'] === 'Instance'" v-model="inputData.ids">
                    {{ filter.label }}
                </label>
            </div>
        </form>
    </div>
  </div>
</template>

<style lang="less">
@import '../shared/_variables.less';

.search-help-icon {
    float: right;
    font-size: 18px;
    margin-top: -35px;
    position: absolute;
    right: 0;
    width: 1em;
}

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
            input {
            display:none;
            }
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
                position: relative;

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
