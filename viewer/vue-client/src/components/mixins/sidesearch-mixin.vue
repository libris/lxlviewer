<script>
import { mapGetters } from 'vuex';
import * as DisplayUtil from '@/utils/display';
import * as VocabUtil from '@/utils/vocab';
import { buildQueryString } from '@/utils/http';

export default {
  data() {
    return {
      searchResult: [],
      keyword: '',
      activeSearches: 0,
      searchAbortController: null,
      searchMade: false,
      currentSearchTypes: [],
      currentSearchParam: null,
      resetParamSelect: 0,
      active: false,
      currentPage: 0,
      maxResults: 20,
      totalItems: 0,
      maxItems: 0,
      sort: '',
      isCompact: false,
    };
  },
  props: {
    fieldKey: {
      type: String,
      default: '',
    },
    allSearchTypes: {
      type: Array,
      default: () => [],
    },
    allValuesFrom: {
      type: Array,
      default: () => [],
    },
    someValuesFrom: {
      type: Array,
      default: () => [],
    },
    range: {
      type: Array,
      default: () => [],
    },
    rangeFull: {
      type: Array,
      default: () => [],
    },
    entityType: {
      type: String,
      default: '',
    },
  },
  methods: {
    getLabelWithTreeDepth(term) {
      return DisplayUtil.getLabelWithTreeDepth(
        term,
        this.settings,
        this.resources.vocab,
        this.resources.context,
      );
    },
    setParam($event) {
      this.currentSearchParam = $event;
      if (this.keyword) {
        this.search();
      }
    },
    handleChange(value) {
      this.searchMade = false;
      if (value) {
        setTimeout(() => {
          if (this.keyword === value) {
            this.search();
          }
        }, this.settings.debounceTimer);
      } else {
        this.searchResult = [];
      }
    },
    setFilter($event) {
      let valuesArray = [];
      let values;

      if ($event.value !== null && typeof $event.value === 'object') {
        values = Object.assign({}, { value: $event.value });
        valuesArray = Object.values(values.value);
      } else {
        valuesArray.push($event.value);
      }

      this.currentSearchTypes = valuesArray;

      if (this.keyword) {
        this.search();
      }
    },
    getSearchPhrase(keyword) {
      let q = '';
      if (keyword === '') {
        q = '*';
      } else if (keyword.match(/[|~*+"]/) || keyword.match(/^-| -/)) {
        // User is using operators, accept their keyword as-is
        q = keyword;
      } else {
        // Add wildcard if user is not using operators
        q = `${keyword} | ${keyword}*`;
      }
      return q;
    },
    getSearchParams(searchPhrase) {
      if (this.currentSearchParam == null) {
        return { q: searchPhrase };
      }

      const params = Object.assign({}, this.currentSearchParam.mappings || {});
      this.currentSearchParam.searchProps.forEach((param) => { params[param] = searchPhrase; });
      return params;
    },
    fetch(pageNumber) {
      const self = this;
      self.currentPage = pageNumber;
      self.activeSearches += 1;
      this.getItems(this.keyword).then((result) => {
        self.loadResults(result);
      }, (error) => {
        console.log(error);
      }).then(() => {
        self.activeSearches -= 1;
      });
    },
    loadResults(result) {
      this.searchResult = result.items;
      this.totalItems = result.totalItems;
      this.maxItems = result.maxItems;
    },
    go(n) {
      this.fetch(n);
    },
    getItems(keyword) {
      let params = this.getSearchParams(this.getSearchPhrase(keyword));
      params = Object.assign(params, {
        _limit: this.maxResults,
        _offset: this.currentPage * this.maxResults,
        _sort: this.sort,
      });
      if (typeof this.typeArray !== 'undefined' && this.typeArray.length > 0) {
        params['@type'] = this.typeArray;
      }
      const searchUrl = `${this.settings.apiPath}/find.jsonld?${buildQueryString(params)}`;
      return new Promise((resolve, reject) => {
        // Check if abortcontroller is available
        // ie11 doesn't have it atm so they don't get cancellable fetches...
        if (typeof AbortController !== 'undefined') {
          // Here is fetch that IS cancellable
          if (this.searchAbortController !== null) {
            // If search exists, abort it
            this.searchAbortController.abort();
          }
          const controller = new AbortController();
          const signal = controller.signal;
          this.searchAbortController = controller;
          fetch(searchUrl, { signal }).then((response) => {
            resolve(response.json());
          }, (error) => {
            reject('Error searching...', error);
          });
        } else {
          // Here is fetch that is NOT cancellable (ie11)
          fetch(searchUrl).then((response) => {
            resolve(response.json());
          }, (error) => {
            reject('Error searching...', error);
          });
        }
      });
    },
  },
  events: {
  },
  computed: {
    ...mapGetters([
      'inspector',
      'resources',
      'user',
      'settings',
      'status',
    ]),
    searchInProgress() {
      return this.activeSearches > 0;
    },
    filterPlaceHolder() {
      if (this.someValuesFrom.length > 0) {
        return 'Suggested types';
      }
      return 'All types';
    },
    selectOptions() {
      const classTree = this.getClassTree;
      const options = [];

      for (let i = 0; i < classTree.length; i++) {
        const term = {};
        term.depth = classTree[i].depth;
        term.abstract = classTree[i].abstract;
        term.label = this.getLabelWithTreeDepth(classTree[i]);
        term.value = classTree[i].id;
        term.key = `${classTree[i].id}-${i}`;
        options.push(term);
      }
      return options;
    },
    priorityOptions() {
      const list = this.allValuesFrom.length > 1 ? this.allValuesFrom : this.someValuesFrom;
      return list;
    },
    getClassTree() {
      let treeSource = this.range;
      if (this.allValuesFrom.length > 0) {
        treeSource = this.allValuesFrom;
      }
      const tree = treeSource.map(type => VocabUtil.getTree(
        type,
        this.resources.vocab,
        this.resources.context,
      ));
      return VocabUtil.flattenTree(
        tree,
        this.resources.vocab,
        this.resources.context,
        this.user.settings.language,
      );
    },
  },
  watch: {
    keyword(value) {
      this.handleChange(value);
    },
    'inspector.event'(val) {
      if (val.name === 'form-control') {
        switch (val.value) {
          case 'close-modals':
            this.hide();
            break;
          case 'focus-changed':
            this.hide();
            break;
          default:
        }
      }
    },
  },
};
</script>
