<script>
import * as _ from 'lodash';
import PropertyMappings from '../propertymappings.json';
import * as httpUtil from '../utils/http';
import { changeResultListStatus } from '../vuex/actions';
import { getSettings } from '../vuex/getters';
export default {
  name: 'search-form',
  vuex: {
    getters: {
      settings: getSettings,
    },
    actions: {
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
        types: [],
      },
    }
  },
  methods: {
      addSearchField(){
          const newobj = {};
          newobj.value='';
          newobj.class='searchphrase';
          this.inputData.textInput.push(newobj);
          this.inputData.currentInput += 1;
      },
      updateField() {
        const validTags = this.validSearchTags;
        if (this.currentIsTag) {
          if (validTags.indexOf(this.currentField.value.split(':')[0]) > -1) {
          this.currentField.class = 'searchtag valid';
          } else {
          this.currentField.class = 'searchtag invalid';
          }
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
        _.each(this.inputData.types, type => queryText.push(`@type=${type}`));
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
  },
  computed: {
      observations() {
          const observations = [];
          const dimensionObservations = this.result.statistics.sliceByDimension; //this.result.stats.sliceByDimension
          _.each(dimensionObservations, dimensionObservation => {
            _.each(dimensionObservation.observation, observation => {
              const obs = {};
              obs['@id'] = observation.object['@id'].replace(this.vocabUrl, '');
              if (typeof observation.object.titleByLang !== 'undefined') {
                  obs['label'] = observation.object.titleByLang['sv'];
              } else if (typeof observation.object.label !== 'undefined') {
                  obs['label'] = observation.object.label;
              } else if (typeof observation.object.notation !== 'undefined') {
                  obs['label'] = observation.object.notation.join(', ');
              } else {
                  obs['label'] = observation.object['@id'].replace(this.vocabUrl, '');
              }
              observations.push(obs);
            });
          });
          return observations;
      },
      dataSetFilters() {
          if (this.settings.siteInfo.title === 'libris.kb.se') {
            return this.settings.dataSetFilters.libris;
          }
          return this.observations.map(observation => observation['@id']);
      },
      currentIsTag() {
          return this.currentField.value.indexOf(':') > -1;
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
    <div class="panel panel-default search-controls">
        <form action="/find" method="GET" id="searchForm">
            <div class="form-inline">
                <div class="form-group">
                    <label class="search-label" id="searchlabel" for="q">
                        {{"Search" | translatePhrase}}
                    </label>
                    <div id="searchFieldContainer">
                        <div aria-labelledby="searchlabel" class="form-control search-input" id="searchQsmart">
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
                        <button id="searchSubmit" class="search-button btn btn-primary" @click.prevent="doSearch"><i class="fa fa-search"></i> {{"Search" | translatePhrase}}</button>
                    </div>
                </div>
            </div>

            <div class="type-buttons" aria-label="Välj typ">
                <label v-for="filter in dataSetFilters">
                    <input :value="filter" type="checkbox" :checked="filter === 'Instance'" v-model="inputData.types">
                    {{filter | labelByLang}}
                </label>
            </div>
        </form>
    </div>
</template>

<style>

</style>
