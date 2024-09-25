<template>
  <div class="SearchBar">
    <div class="container-fluid">
      <div class="row">
        <div class="col-8 col-md-5" v-click-outside="clickOutside">
          <i class="bi-search SearchInput-icon"></i><input type="text" aria-label="Sök" v-model="keyword" @keydown.down.prevent="selectNextSuggestion" @keydown.up.prevent="selectPreviousSuggestion"  id="search" @keyup.enter="submit()" class="form-control SearchInput-input" autocomplete="off">
          <div class="SearchBar-suggestContainer" v-if="searchChangeDetected && keyword.length > 0">
            <ul>
              <li class="SuggestItem" :class="{'is-selected': selectedSuggestion == -1 }" @mouseenter="selectedSuggestion = -1" @click="submit">
                <i class="bi-arrow-return-left"></i>
                <span><strong>{{ keyword }}</strong> <span class="text-muted">{{ translateUi('search all of id.kb.se') }}</span></span>
              </li>
              <template v-if="suggestedItems && suggestedItems.length > 0">
                <li class="SuggestItem-divider">{{ translateUi('suggested') }}<hr></li>
                <SuggestItem v-for="(item, index) in suggestedItems" :selected="selectedSuggestionItem == item['@id']" @hovered="selectedSuggestion = index" :item="item" :key="item['@id']" @suggest="recieveSuggest" />
              </template>
            </ul>
          </div>
        </div>
        <div class="col-4 col-md-2">
          <button type="button" @keyup.enter="submit()" @click="submit()" class="btn btn-kb-secondary-turquoise">{{ translateUi('Search') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// import mockSuggest from '@/resources/json/mockSuggest.json';
import { mapGetters } from 'vuex';
import SuggestItem from '@/components/SuggestItem';

export default {
  data() {
    return {
      keyword: '',
      suggestKeyword: '',
      suggestedItems: null,
      debounce: null,
      disableSuggestion: false,
      selectedSuggestion: null,
      searchChangeDetected: false,
    }
  },
  mounted: function () {
    this.$nextTick(function () {
      if (this.$route.query.hasOwnProperty('q')) {
        this.disableSuggestion = true;
        this.keyword = this.$route.query.q;
        setTimeout(() => {
          this.disableSuggestion = false;
        }, 200);
      }
    })
  },
  methods: {
    clickOutside() {
      this.clearSuggest();
      this.searchChangeDetected = false;
    },
    recieveSuggest(value) {
      this.searchChangeDetected = false;
      this.suggestedItems = null;
      this.$router.push({
        path: value,
      });
      this.selectedSuggestion = null;
    },
    selectNextSuggestion() {
      if (this.selectedSuggestion == null) {
        this.selectedSuggestion = -1;
      } else if (this.suggestedItems && this.selectedSuggestion == this.suggestedItems.length - 1) {
        this.selectedSuggestion = this.selectedSuggestion;
      } else {
        this.selectedSuggestion += 1;
      }
    },
    selectPreviousSuggestion() {
      if (this.selectedSuggestion <= 0 || this.selectedSuggestion == null) {
        this.selectedSuggestion = -1;
      } else {
        this.selectedSuggestion -= 1;
      }
    },
    clearSuggest() {
      this.suggestedItems = null;
    },
    submit() {
      clearTimeout(this.debounce);
      this.searchChangeDetected = false;
      if (this.selectedSuggestion != null && this.selectedSuggestion != -1) {
        this.$store.dispatch('setAppState', { property: 'navigatingFromSearchBar', value: true });
        this.$store.dispatch('setAppState', { property: 'navigatingWithFacetColumn', value: false });
        const selectedPath = this.selectedSuggestionItem.replace('https://id.kb.se/', '/');
        this.clearSuggest();
        this.$nextTick(() => {
          this.$router.push({
            path: selectedPath,
          });
        });
        return;
      }
      if (this.keyword.length === 0) {
        this.keyword = '*';
      };
      this.clearSuggest();
      this.$router.push({
        name: 'find',
        query: this.queryObject,
      });
    },
    async doSuggestSearch() {
      this.clearSuggest();
      const searchPath = `find.jsonld?q=${this.$encodeSpecialChars(this.keyword)}&_lens=chips&_suggest=${this.settings.language}&_limit=7`;
      const suggestData = await fetch(`${this.activeHost()}/${searchPath}`).then(res => res.json());
      this.suggestedItems = suggestData.items;
      // const suggestData = mockSuggest;
      // this.suggestedItems = suggestData;
    },
  },
  watch: {
    keyword(newValue, oldValue) {
      if (this.disableSuggestion) return;
      if (newValue != oldValue && newValue.length > 0) {
        this.searchChangeDetected = true;
        this.selectedSuggestion = -1;
        this.suggestedItems = null;
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
  directives: {
    'click-outside': {
      bind: function(el, binding, vNode) {
        // Provided expression must evaluate to a function.
        if (typeof binding.value !== 'function') {
        	const compName = vNode.context.name
          let warn = `[Vue-click-outside:] provided expression '${binding.expression}' is not a function, but has to be`
          if (compName) { warn += `Found in component '${compName}'` }

          console.warn(warn)
        }
        // Define Handler and cache it on the element
        const bubble = binding.modifiers.bubble
        const handler = (e) => {
          if (bubble || (!el.contains(e.target) && el !== e.target)) {
          	binding.value(e)
          }
        }
        el.__vueClickOutside__ = handler

        // add Event Listeners
        document.addEventListener('click', handler)
			},

      unbind: function(el, binding) {
        // Remove Event Listeners
        document.removeEventListener('click', el.__vueClickOutside__)
        el.__vueClickOutside__ = null

      }
    }
  },
  computed: {
    ...mapGetters(['settings']),
    selectedSuggestionItem() {
      if (this.selectedSuggestion != null && this.selectedSuggestion >= 0) {
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
  components: {
    SuggestItem,
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
      width: 90%;
      @media (min-width: 576px) {
        width: inherit;
      }
      position: absolute;
      background-color: $white;
      border: 1px solid $gray-400;
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
