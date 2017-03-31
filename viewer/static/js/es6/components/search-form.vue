<script>
import * as _ from 'lodash';
import PropertyMappings from '../propertymappings.json';
export default {
  name: 'search-form',
  props: {
    siteTitle: '',
    result: {},
    filterParam: '',
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
        const validTags = ['isbn'];
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
                const resultKey = tagMatchObject.propertyChain.join('.');
                convertedObject[resultKey] = v;
                // Hardcoded for isbn
                if (k.toLowerCase() === 'isbn') {
                    convertedObject['identifiedBy.@type'] = 'ISBN';
                }
            } else {
                convertedObject[k] = v;
            }
        });
        return convertedObject;
      },
      doSearch() {
        const validTags = ['isbn'];
        const queryText = [];
        const tagObject = {};
        for (const node of this.formData) {
            if (node.class.includes('searchtag')) {
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
        tagObject.q = queryText.join(' ');
        const tagInputs = document.querySelectorAll('.tagInput');
        _.each(this.getConvertedSearchObject(tagObject), (v, k) => {
            tagInputs.forEach(inputTag => {
                if (inputTag.name === k) {
                    inputTag.value = v;
                }
            });
        });
        this.removeEmptyFields();
        document.querySelector('#searchForm').submit();
        return false;
      },
      removeEmptyFields() {
        // Empty inputs
        $('#searchForm').find('input').filter(function() {
            return !$.trim(this.value).length;
        }).prop('disabled', true);
      },
  },
  computed: {
      observations() {
          const observations = [];
          const dimensionObservations = this.result.statistics.sliceByDimension; //this.result.stats.sliceByDimension
          _.each(dimensionObservations, dimensionObservation => {
            _.each(dimensionObservation.observation, observation => {
                if (typeof observation.object.titleByLang !== 'undefined') {
                    observations.push(observation.object.titleByLang['sv']);
                } else if (typeof observation.object.label !== 'undefined') {
                    observations.push(observation.object.label);
                } else if (typeof observation.object.notation !== 'undefined') {
                    observations.push(observation.object.notation.join(', '));
                } else {
                    observations.push(observation.object['@id'].replace(this.vocabUrl, ''));
                }
            });
          });
          return observations;
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
          return this.currentField.value.includes(':')
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
                <input v-if="siteTitle == 'libris.kb.se'" class="tagInput" name="@type" value="Instance" />
                <div class="tagInputContainer">
                    <input class="tagInput" name="identifiedBy.value">
                    <input class="tagInput" name="identifiedBy.@type">
                    <input class="tagInput" name="_limit" value="20">
                </div>
                <label class="search-label" id="searchlabel" for="q">
                    Sök
                </label>
                <div id="searchFieldContainer">
                    <input aria-labelledby="searchlabel" class="form-control search-input tagInput" name="q" id="searchQ" ></input>
                    <div aria-labelledby="searchlabel" class="form-control search-input" id="searchQsmart">
                        <input v-for="input in formData" type="text" @focus="handleFocus($index)" @input="updateField" @keydown="handleInput" :name="input.name" v-model="input.value" class="smartInput" :class="input.class">
                    </div>
                    <button id="searchSubmit" class="search-button btn btn-primary" @click.prevent="doSearch"><i class="fa fa-search"></i> Sök</button>
                </div>
                </div>
            </div>

            <div v-if="filterParam.length > 0 && result.statistics" class="type-buttons" aria-label="Välj typ">
                <label class="no-choice">
                    <input :name="filterParam" id="noneType" value="" type="radio" checked> Alla
                </label>
                <label v-for="observation in observations" class="">
                    <input :name="filterParam" :value="observation" type="radio">
                    {{observation}}
                </label>
            </div>

            <div v-if="result.search" class="activated-facets">
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
            </div>
        </form>
    </div>
</template>

<style>

</style>