<script>
import * as _ from 'lodash';
import PropertyMappings from '../propertymappings.json';
import * as httpUtil from '../utils/http';
import * as StringUtil from '../utils/string';
import { changeResultListStatus, changeStatus } from '../vuex/actions';
import { getSettings, getStatus, getVocabulary } from '../vuex/getters';
export default {
  name: 'search-form',
  vuex: {
    getters: {
      settings: getSettings,
      status: getStatus,
      vocab: getVocabulary,
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
                'label': StringUtil.labelByLang(term, this.settings.language, this.vocab, this.settings.vocabPfx)
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
  <div>
    <div class="panel panel-default search-controls">
      <div class="search-type-button-container" v-if="settings.siteInfo.title === 'libris.kb.se'">
        <a class="card-link active">Libris</a>
        <a class="card-link" href="/import">Andra källor</a>
      </div>
        <form action="/find" method="GET" id="searchForm">
            <div class="form-inline">
                <div class="form-group">
                    <label class="search-label hidden" id="searchlabel" for="q">
                        {{"Search" | translatePhrase}}
                    </label>
                    <div id="searchFieldContainer">
                        <div class="form-control search-input">
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

<style>
.search-type-button-container {
  margin: 0.5em;
}

</style>
