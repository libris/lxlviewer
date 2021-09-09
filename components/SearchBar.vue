<template>
  <div class="SearchBar">
    <div class="container-fluid">
      <div class="row">
        <div class="col-8 col-md-5">
          <i class="bi-search SearchInput-icon"></i><input type="text" v-model="keyword" @blur="clearSuggest" @keyup.down="selectNextSuggestion" @keyup.up="selectPreviousSuggestion"  id="search" @keyup.enter="submit()" class="form-control SearchInput-input">
          <div class="SearchBar-suggestContainer" v-if="suggestedItems && suggestedItems.length > 0">
            <ul>
              <SuggestItem v-for="item in suggestedItems" :selected="selectedSuggestionItem == item['@id']" :item="item" :key="item['@id']" @suggest="recieveSuggest" />
            </ul>
          </div>
        </div>
        <div class="col-4 col-md-2">
          <button type="button" @keyup.enter="submit()" @click="submit()" class="btn btn-kb-secondary-turquoise">sök</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// import mockSuggest from '@/resources/json/mockSuggest.json';

export default {
  data() {
    return {
      keyword: '',
      suggestKeyword: '',
      suggestedItems: null,
      debounce: null,
      selectedSuggestion: null,
    }
  },
  methods: {
    recieveSuggest(value) {
      this.suggestedItems = null;
      this.$router.push({
        path: value,
      });
    },
    selectNextSuggestion() {
      if (this.selectedSuggestion == null) {
        this.selectedSuggestion = 0;
      } else if (this.selectedSuggestion == this.suggestedItems.length - 1) {
        this.selectedSuggestion = this.selectedSuggestion;
      } else {
        this.selectedSuggestion += 1;
      }
    },
    selectPreviousSuggestion() {
      if (this.selectedSuggestion == 0 || this.selectedSuggestion == null) {
        this.selectedSuggestion = null;
      } else {
        this.selectedSuggestion -= 1;
      }
    },
    clearSuggest() {
      this.suggestedItems = null;
    },
    submit() {
      if (this.selectedSuggestion != null) {
        this.$router.push({
          path: this.selectedSuggestionItem.replace('https://id.kb.se/', '/'),
        });
        this.clearSuggest();
        return;
      }
      if (this.keyword.length === 0) return;
      this.clearSuggest();
      this.$router.push({
        name: 'find',
        query: this.queryObject,
      });
    },
    async doSuggestSearch() {
      this.clearSuggest();
      console.log("Getting suggested items");
      const searchPath = `find.jsonld?q=${this.keyword}&_lens=chips&_suggest=sv&_limit=7`;
      const suggestData = await fetch(`${process.env.API_PATH}/${searchPath}`).then(res => res.json());
      this.suggestedItems = suggestData.items;
      // const suggestData = mockSuggest;
      // this.suggestedItems = suggestData;
      this.selectedSuggestion = null;
    },
  },
  watch: {
    keyword(newValue, oldValue) {
      if (newValue != oldValue && newValue.length > 0) {
        this.suggestKeyword = newValue;
        clearTimeout(this.debounce);
        this.debounce = setTimeout(() => {
          this.doSuggestSearch();
        }, 600);
      } else if (newValue.length == 0) {
        this.suggestedItems = null;
      }
    },
  },
  computed: {
    selectedSuggestionItem() {
      if (this.selectedSuggestion != null) {
        console.log("Reading selection", this.selectedSuggestion);
        return this.suggestedItems[this.selectedSuggestion]['@id'];
      }
      return '';
    },
    queryObject() {
      const queryObj = {};
      if (this.$route.query.hasOwnProperty('inScheme.@id')) {
        queryObj['inScheme.@id'] = this.$route.query['inScheme.@id'];
      }
      queryObj.q = this.keyword;
      return queryObj;
    },
  },
  props: {
  },
}
</script>

<style lang="scss">
  .SearchBar {
    background-color: $gray-100;
    padding: 1em 0;
    border: solid $gray-200;
    border-width: 0px 0px 1px 0px;
    &-suggestContainer {
      position: absolute;
      background-color: $white;
      width: inherit;
      border: 1px solid $gray-200;
      border-radius: 4px;
      ul {
        padding: 0;
        margin-bottom: 0.25em;
      }
    }
  }
  .SearchInput {
    &-icon {
      position: absolute;
      margin-top: 0.6rem;
      margin-left: 1rem;
      font-size: 125%;
    }
    &-input {
      padding-left: 3em !important;
    }
  }

</style>
