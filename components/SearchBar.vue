<template>
  <div class="SearchBar">
    <div class="container-fluid">
      <div class="row">
        <div class="col-8 col-md-5">
          <i class="bi-search SearchInput-icon"></i><input type="text" v-model="keyword" id="search" @keyup.enter="submit()" class="form-control SearchInput-input">
          <div class="SearchBar-suggestContainer" v-if="suggestedItems && suggestedItems.length > 0">
            <ul>
              <SuggestItem tabindex="0" v-for="item in suggestedItems" :item="item" :key="item['@id']" @suggest="recieveSuggest" />
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
    }
  },
  methods: {
    recieveSuggest(value) {
      this.suggestedItems = null;
      console.log("Recieved suggest", value);
    },
    submit() {
      if (this.keyword.length === 0) return;
      this.$router.push({
        name: 'find',
        query: this.queryObject,
      });
    },
    async doSuggestSearch() {
      this.suggestedItems = null;
      console.log("Getting suggested items");
      const searchPath = `find.jsonld?q=${this.keyword}&_lens=chips&_suggest=sv&_limit=7`;
      const suggestData = await fetch(`${process.env.API_PATH}/${searchPath}`).then(res => res.json());
      // const suggestData = mockSuggest;
      // this.suggestedItems = suggestData;
      this.suggestedItems = suggestData.items;
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
