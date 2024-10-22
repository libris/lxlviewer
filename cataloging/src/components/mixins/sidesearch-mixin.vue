<script>
import {get, isEmpty} from 'lodash-es';
import { mapGetters } from 'vuex';
import * as DisplayUtil from 'lxljs/display';
import * as VocabUtil from 'lxljs/vocab';
import {translatePhrase} from "../../utils/filters.js";

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
    translatePhrase,
    getLabelWithTreeDepth(term) {
      if (term?.id === 'Any') {
        return translatePhrase('Unspecified');
      } else {
        return DisplayUtil.getLabelWithTreeDepth(term, this.settings, this.resources);
      }
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
      this.search();
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
      this.maxItems = parseInt(result.maxItems);
    },
    go(n) {
      this.fetch(n);
    },
    getItems(keyword) {
      const searchPhrase = this.getSearchPhrase(keyword);
      const urlSearchParams = new URLSearchParams({
        ...(!this.currentSearchParam && { q: searchPhrase }),
        _limit: this.maxResults,
        _offset: this.currentPage * this.maxResults,
        _sort: this.sort,
      });

      this.typeArray?.forEach((type) => urlSearchParams.append('@type', type));

      this.currentSearchParam?.searchProps
        .forEach((searchProp) => urlSearchParams.append(searchProp, searchPhrase));

      Object.keys(this.currentSearchParam?.mappings || {})
        .forEach((key) => urlSearchParams.append(key, this.currentSearchParam.mappings[key]));

      if (this.fieldKey === 'shelfMark') {
        urlSearchParams.append('meta.descriptionCreator.@id',  this.user.getActiveLibraryUri());
        urlSearchParams.append('shelfMarkStatus', 'ActiveShelfMark');
      }

      if (this.fieldKey) {
        const field = VocabUtil.getTermObject(this.fieldKey, this.resources.vocab, this.resources.context);
        /**
         * If field is a kbv:predicate (e.g. role) then filter linkable items depending on field and parent type.
         * */
        // A VocabUtil.isSubPropertyOf(field.subPropertyOf, 'predicate', ...) would be preferable here.
        if (field.subPropertyOf?.find((subProp) => subProp['@id'] === VocabUtil.getTermObject('predicate', this.resources.vocab, this.resources.context)['@id'])) {
          const statement = VocabUtil.getTermObject(field.domain[0]['@id'], this.resources.vocab, this.resources.context); // e.g. Contribution
          const statementOf = statement.allowedProperties.find((p) => p.domain?.find((d) => d['@id'] === statement['@id'])); // e.g. contributionOf
          const subClassesOfRanges = [
            ...new Set(
              [...(statementOf.range || []), ...(statementOf.rangeIncludes || [])].flatMap( // iterate over both range and rangeIncludes
                (rangeItem) => VocabUtil.getSubClassChain(rangeItem['@id'], this.resources.vocabClasses, this.resources.context), // get subclasses of e.g. Endeavour
              ),
            ),
          ];

          const fieldParentPath = this.path.split('.').slice(0, -2).join('.');
          const fieldParentType = get(this.inspector.data, fieldParentPath)['@type']; // e.g. Text
          const fieldParentBaseClasses = VocabUtil.getBaseClasses(
            VocabUtil.getTermObject(fieldParentType, this.resources.vocab, this.resources.context)['@id'],
            this.resources.vocab,
            this.resources.context,
          );

          const linkableDomainIds = fieldParentBaseClasses
            .filter((baseClassName) => subClassesOfRanges.includes(baseClassName))
            .map(((className) => VocabUtil.getTermObject(className, this.resources.vocab, this.resources.context)['@id']));

          // Append urlSearchParams with linkable domain ids
          linkableDomainIds.forEach((className) => urlSearchParams.append('or-domain.@id', className));
        }
      }

      const searchUrl = `${this.settings.apiPath}/find.jsonld?${urlSearchParams.toString()}`;

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
        term.abstract = classTree[i].abstract || null;
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
      const tree = treeSource.map((type) => VocabUtil.getTree(
        type,
        this.resources.vocab,
        this.resources.context,
      ));
      const flattenedTree = VocabUtil.flattenTree(
        tree,
        this.resources.vocab,
        this.resources.context,
        this.user.settings.language,
      );

      if (this.isBulkChange) {
        return [this.anyType, ...flattenedTree];
      } else {
        return flattenedTree;
      }
    },
    anyType() {
      return { id: 'Any', sub: [], abstract : false, depth: 0, parentChainString: 'Any'};
    },
    isBulkChange() {
      return this.$route.path.includes('bulkchanges');
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
