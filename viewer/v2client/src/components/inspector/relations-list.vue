<script>
import EntitySummary from '../shared/entity-summary';
import PanelComponent from '@/components/shared/panel-component';
import PanelSearchList from '@/components/search/panel-search-list';
import ModalPagination from '@/components/inspector/modal-pagination';
import * as StringUtil from '@/utils/string';
import * as RecordUtil from '@/utils/record';
import * as LayoutUtil from '@/utils/layout';
import * as DataUtil from '@/utils/data';
import * as HttpUtil from '@/utils/http';
import { mapGetters } from 'vuex';
import VueSimpleSpinner from 'vue-simple-spinner';

export default {
  name: 'relations-list',
  props: {
    query: null,
    listContextType: {
      type: String,
      default: '',
    },
    itemOf: {}
  },
  data() {
    return {
      currentPage: 0,
      numberOfPages: 0,
      maxResults: 20,
      isCompact: false,
      loading: true,
      error: null,
      searchResult: null,
      itemData: {},
      embellishedList: [],
      showInstances: false,
    }
  },
  methods: {
    go(n) {
      if (n >= 0 && n <= this.numberOfPages && n !== this.currentPage) {
        this.currentPage = n;
      }
    },
    getResults() {
      this.loading = true;
      fetch(this.builtQuery)
        .then((response) => {
          if (response.status === 200) {
            response.json().then((result) => {
              this.searchResult = result;
              this.numberOfPages = Math.floor(result.totalItems/this.maxResults);
              this.loading = false;
            });
          }
        })
        .catch((error) => {
          this.error = error;
          this.loading = false;
        });
    },
    hide() {
      this.$emit('close');
    },
  },
  computed: {
    ...mapGetters([
      'inspector',
      'resources',
      'user',
      'settings',
      'status',
    ]),
    resultItems() {
      if (this.searchResult) {
        return this.searchResult.items;
      } else {
        return [];
      }
    },
    builtQuery() {
      const queryPairs = this.query;
      if (queryPairs === null) {
        return '';
      }
      queryPairs['_offset'] = this.currentPage*this.maxResults;
      queryPairs['_limit'] = this.maxResults;
      let q = `${this.settings.apiPath}/find.json?`;
      _.each(queryPairs, (v, k) => {
        q += (`${encodeURIComponent(k)}=${encodeURIComponent(v)}&`);
      });
      return q;
    },
    windowTitle() {
      if (this.listContextType === 'Item') {
        return StringUtil.getUiPhraseByLang('All holdings', this.settings.language);
      } else if (this.listContextType === 'Instance') {
        let windowTitle = StringUtil.getUiPhraseByLang('Holdings of', this.settings.language);
        windowTitle += ' '+this.itemOfTitle;
        return windowTitle;
      } else if (this.listContextType === 'Agent') {
        return StringUtil.getUiPhraseByLang('Contribution', this.settings.language);
      }
      const typeLabel = StringUtil.getLabelByLang(this.listContextType, this.settings.language, this.resources.vocab, this.resources.context);
      return `${typeLabel} ${StringUtil.getUiPhraseByLang('Used in', this.settings.language)}`;
    },
    itemOfTitle() {
      return this.itemOf.hasTitle[0] ? 
      this.itemOf.hasTitle[0].mainTitle : 
      StringUtil.getUiPhraseByLang('instance', this.settings.language);
    }
  },
  components: {
    'modal-pagination': ModalPagination,
    'entity-summary': EntitySummary,
    'panel-component': PanelComponent,
    'panel-search-list': PanelSearchList,
    'vue-simple-spinner': VueSimpleSpinner,
  },
  watch: {
    builtQuery(val, oldVal) {
      if (val.length > 0 && val !== oldVal) {
        this.getResults();
      }
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.getResults();
    });
  },
};
</script>

<template>
  <div class="RelationsList">
    <panel-component :title="windowTitle" @close="hide()">
      <template slot="panel-header-extra">
      </template>
      <template slot="panel-body">
        <div class="PanelComponent-searchStatus" v-show="loading">
          <vue-simple-spinner size="large" :message="'Searching' | translatePhrase"></vue-simple-spinner>
        </div>
        <panel-search-list
          class="RelationsList-resultListContainer"
          :results="resultItems"
          :is-compact="isCompact"
          icon="chain"
          text="Link entity"
          v-if="!loading && searchResult !== null && error == null"
        />
        <div v-if="error !== null">
          error happened: {{error}}
        </div>
      </template>
      <template slot="panel-footer"> 
        <div class="RelationsList-resultControls" v-if="!loading && resultItems.length > 0">
          <modal-pagination 
            v-if="searchResult.totalItems > maxResults"
            @go="go" 
            :numberOfPages="numberOfPages" 
            :currentPage="currentPage">
          </modal-pagination>
        </div>
      </template>
    </panel-component>
  </div>
</template>

<style lang="less">

.RelationsList {

  &-resultControls {
    display: flex;
    justify-content: space-between;
    align-items: baseline;

    .ModalPagination {
      margin: 15px 10px;
    }
  }
  &-body {
    width: 100%;
    background-color: white;
    border: 1px solid #ccc;
    padding: 0px;
    overflow-y: scroll;
    .entity-summary {
      &:hover {
        background: darken(@white, 5%);
        cursor: pointer;
        .header {
          text-decoration: underline;
        }
      }
    }
  }
}
</style>
