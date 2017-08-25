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
      formData: [
          {
            value: '',
            class: 'searchphrase',
          },
      ],
      currentInput: 0,
    }
  },
  methods: {
      addSearchField(){
          const newobj = {};
          newobj.value='';
          newobj.class='searchphrase';
          this.formData.push(newobj);
          this.currentInput += 1;
      },
      updateField() {
        const validTags = this.settings.validSearchTags;
        if (this.currentIsTag) {
          if (validTags.indexOf(this.currentField.value.split(':')[0].toLowerCase()) > -1) {
          this.currentField.class = 'searchtag valid';
          } else {
          this.currentField.class = 'searchtag invalid';
          }
        } else {
            this.currentField.class = 'searchphrase';
        }
      },
      getSelectedFilter() {
        const filterInputs = document.querySelectorAll('.type-buttons input');
        for (const input of filterInputs) {
          if (input.checked) {
            const obj = {};
            if (input.value === 'allParam') {
              return obj;
            }
            obj[input.name] = input.value;
            return obj;
          }
        }
      },
      handleFocus(focusedIndex) {
        this.currentInput = focusedIndex;
      },
      handleInput: function(e) {
        const currentElement = document.getElementById('searchQsmart').children[this.currentInput];
        if (e.keyCode === 13) { // Enter
            e.preventDefault();
            if (!this.currentIsTag) {
                this.doSearch();
            } else if (this.currentInput === this.formData.length-1) {
                this.addSearchField();
            } else {
                this.currentInput += 1;
            }
        } else if (e.keyCode === 8 && // Backspace
        !this.currentIsTag &&
        currentElement.value.slice(0, currentElement.selectionStart).length === 0 &&
        this.formData.length >= 2) {
            e.preventDefault();
            this.formData.splice(this.currentInput-1, 1);
            this.currentInput -= 1;
        }
      },
      getConvertedSearchObject(object) {
        const convertedObject = {};
        _.each(object, (v, k) => {
            const tagMatchObject = _.find(PropertyMappings, (value, mappingKey) => {
                return mappingKey.toLowerCase() === k.toLowerCase();
            });
            if (typeof tagMatchObject !== 'undefined') {
                _.each(tagMatchObject.propertyChains, property => {
                    property.indexOf('@type') >= 0 ? convertedObject[property] = k.toUpperCase() : convertedObject[property] = v;
                });
            } else {
                convertedObject[k] = v;
            }
        });
        return convertedObject;
      },
      doSearch() {
        if (this.formDataSupported) {
            this.changeResultListStatus('loading', true);
        }
        const form = document.querySelector('#searchForm');
        const validTags = this.settings.validSearchTags;
        const queryText = [];
        const tagObject = {};
        for (const node of this.formData) {
          if (node.class.indexOf('searchtag') > -1) {
              const tag = node.value.split(':');
              if (validTags.indexOf(tag[0].toLowerCase()) > -1) {
                  tagObject[tag[0]] = tag[1];
              } else {
                  queryText.push(tag[1]);
              }
          } else if (node.value !== '') {
              queryText.push(`${node.value}`);
          }
        }
        const filterObject = this.getSelectedFilter();
        tagObject.q = queryText.join(' ');
        const searchObj = Object.assign(tagObject, filterObject);
        const tagInputs = document.querySelectorAll('.tagInput');
        _.each(this.getConvertedSearchObject(searchObj), (v, k) => {
          _.each(tagInputs, inputTag => {
            if (inputTag.name === k) {
                inputTag.value = v;
            }
          });
        });
        this.removeEmptyFields();
        if (!this.useSubmit) {
            const data = new FormData(form);
            const inputs = [];
            if (typeof(data.entries) === "undefined") {
                form.submit();
            } else {
                for(const pair of data.entries()) {
                    if (pair[1] !== '') {
                        inputs.push(`${pair[0]}=${pair[1]}`);
                    }
                }
                const url = `${form.action}?${inputs.join('&')}`;
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
                this.clearFields();
                this.currentInput = 0;
                this.formData.splice(1, this.formData.length);
                this.formData[0].value = '';
                this.$dispatch('newresult', resultPromise);
            }
        } else {
            form.submit();
        }
        return false;
      },
      removeEmptyFields() {
        // Empty inputs
        $('#searchForm').find('input').filter(function() {
            return 
            !$.trim(this.value).length &&
            this.type !== 'radio' &&
            (this.className.indexOf('searchphrase') < 0) &&
            this.name !== 'q';
        }).prop('disabled', true);
      },
      clearFields() {
        // Empty inputs
        $('#searchForm').find('input').filter(function() {
            return this.name.indexOf('identifiedBy') > -1;
        }).prop('value', '');
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
      filters() {
          const filters = [];
          if (typeof this.result.search !== 'undefined') {
              this.result.search.mapping.forEach(item => {
              if (item.variable !== 'q') {
                  const filterObj = {
                      label: '',
                      up: '',
                  };
                  if (typeof item.object !== 'undefined') {
                    filterObj.label = item.object['@id'];
                  } else {
                    filterObj.label = item.value;
                  }
                  filterObj.up = item.up['@id'];
                  filters.push(filterObj);
              }
            });
          }
          return filters;
      },
      currentIsTag() {
          return this.currentField.value.indexOf(':') > -1;
      },
      currentField() {
          return this.formData[this.currentInput];
      },
      caretIsAtStart() {
          const currentElement = document.getElementById('searchQsmart').children[this.currentInput];
          return currentElement.value.slice(0, currentElement.selectionStart).length === 0;
      },
  },
  components: {
  },
  watch: {
      currentInput(newValue) {
          document.getElementById('searchQsmart').children[newValue].focus();
      },
  },
  ready() { // Ready method is deprecated in 2.0, switch to "mounted"
    this.$nextTick(() => {
      document.getElementById('searchQsmart').children[this.currentInput].focus();
    });
  },
};
</script>

<template>
    <div class="panel panel-default search-controls">
        <form action="/find" method="GET" id="searchForm">
            <div class="form-inline">
                <div class="form-group">
                <div class="tagInputContainer">
                    <input class="tagInput" name="identifiedBy.value">
                    <input class="tagInput" name="identifiedBy.@type">
                    <input class="tagInput" name="_limit" value="20">
                </div>
                <label class="search-label" id="searchlabel" for="q">
                    {{"Search" | translatePhrase}}
                </label>
                <div id="searchFieldContainer">
                    <input aria-labelledby="searchlabel" class="form-control search-input tagInput" name="q" id="searchQ" ></input>
                    <div aria-labelledby="searchlabel" class="form-control search-input" id="searchQsmart">
                        <input v-for="input in formData" type="text" @focus="handleFocus($index)" @input="updateField" @keydown="handleInput" :name="input.name" v-model="input.value" class="smartInput" :class="input.class">
                    </div>
                    <button id="searchSubmit" class="search-button btn btn-primary" @click.prevent="doSearch"><i class="fa fa-search"></i> {{"Search" | translatePhrase}}</button>
                </div>
                </div>
            </div>

            <div class="type-buttons" aria-label="Välj typ">
                <label v-for="filter in dataSetFilters" class="">
                    <input :name="filterParam" :value="filter" type="radio" :checked="filter === 'Instance'">
                    {{filter | labelByLang}}
                </label>
                <label class="no-choice">
                    <input :name="filterParam" id="noneType" value="" :checked="siteTitle != 'libris.kb.se'" type="radio"> {{"All" | translatePhrase}}
                </label>
            </div>

           <!-- <div v-if="result.search" class="activated-facets">
                <label>
                    Aktiv filtrering
                </label>
                <ul>
                    <li v-for="filter in filters">
                        <a :href="filter.up">
                            {{filter.label | labelByLang}}<i class="fa fa-remove"></i>
                        </a>
                    </li>
                </ul>
            </div> -->
        </form>
    </div>
</template>

<style>

</style>
