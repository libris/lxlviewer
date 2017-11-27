<script>
import * as _ from 'lodash';
import * as httpUtil from '../utils/http';
import * as RecordUtil from '../utils/record';
import ResultItem from './resultitem';
import ResultList from './result-list';
import SearchResultComponent from './search-result-component';
import { getSettings, getStatus } from '../vuex/getters';

export default {
  name: 'remote-search',
  props: {
    db: [],
    q: '',
  },
  vuex: {
    actions: {
    },
    getters: {
      settings: getSettings,
      status: getStatus,
    },
  },
  data() {
    return {
      databases: { state: '', list: [] },
      remoteQuery: '',
      remoteResult: { state: '', totalResults: {}, items: [] },
      convertedItems: {},
      importData: [],
      showList: true,
      importJson: '',
      selectedDatabases: [],
    };
  },
  components: {
    'result-item': ResultItem,
    'result-list': ResultList,
    'search-result-component': SearchResultComponent,
  },
  events: {
    'set-import'(data){
      this.importJson = data;
      this.$nextTick(() => {
        document.getElementById("importForm").submit();
      });
    },
  },
  watch: {
    databases: {
      handler: function() {
        const selected = [];
        const dbs = _.filter(this.databases.list, function (o) {
          return o.active;
        });
        if (dbs.length > 0) {
          for (let i = 0; i < dbs.length; i++) {
            selected.push(dbs[i].item.database);
          }
          this.selectedDatabases = selected;
        }
      },
      deep: true,
    },
  },
  methods: {
    isPlainObject(o) {
      return _.isPlainObject(o);
    },
    loadRemoteDatabases() {
      const vself = this;

      this.databases.state = 'loading';
      this.databases.debug = '';
      this.fetchDatabases().then((dbs) => {
        const newDbList = [];
        for (let i = 0; i < dbs.length; i++) {
          const obj = { item: dbs[i], active: false };
          newDbList.push(obj);
        }
        vself.databases.list = newDbList;
        vself.databases.state = 'complete';
        if (history.state !== null) {
          vself.selectedDatabases = history.state.selectedDatabases;
          vself.attachResult(history.state);
          this.showList = false;
        }
        // if (vself.q.length > 0) {
        //   vself.searchRemote();
        // }
      }, () => {
        vself.databases.state = 'error';
      });
    },
    fetchDatabases() {
      return new Promise((resolve, reject) => {
        httpUtil.get({ url: '/_remotesearch?databases=list' })
        .then((response) => {
          resolve(response);
        }, (error) => {
          reject('Error loading databases...', error);
        });
      });
    },
    searchRemote() {
      if (this.selectedDatabases.length === 0 || this.remoteQuery === '') return;
      const vself = this;
      const q = this.remoteQuery;
      this.showList = false;
      const databases = this.selectedDatabases.join();
      vself.remoteResult = {};
      vself.remoteResult.state = 'loading';
      this.remoteSearch(q, databases)
      .then((response) => {
        const clonedResponse = _.cloneDeep(response);
        clonedResponse.selectedDatabases = this.selectedDatabases;
        vself.remoteResult = response;
        history.pushState(clonedResponse, 'unused');
        this.attachResult(clonedResponse);
      }, () => {
        vself.remoteResult.state = 'error';
      });
    },
    remoteSearch(q, databases) {
      return new Promise((resolve, reject) => {
        const url = `/_remotesearch?q=${q}&databases=${databases}`;
        httpUtil.get({ url })
        .then((response) => {
          resolve(response);
        }, (error) => {
          reject('Error loading databases...', error);
        });
      });
    },
    convertResult(result) {
      let totalResults = 0;
      for (const db in result.totalResults) {
        if (result.totalResults.hasOwnProperty(db)) {
           totalResults += result.totalResults[db];
        }
      }
      const convertedList = { totalItems: totalResults, items: []};
      _.each(result.items, (item) => {
        const convertedItem = RecordUtil.getMainEntity(item.data['@graph']);
        convertedList.items.push(convertedItem);
      })
      return convertedList;
    },
    toggleDatabase(index) {
      if (this.databases.list[index]) {
        this.databases.list[index].active = !this.databases.list[index].active;
      }
    },
    attachResult(response) {
      const convertedResult = this.convertResult(response);
      this.convertedItems = convertedResult;
      this.importData = response.items;
      this.remoteResult.state = 'complete';
    },
  },
  ready() {
    this.remoteQuery = this.q;
    this.loadRemoteDatabases();
  },
  computed: {
  },
};
</script>

<template>
<div class="remote-search">
  <form id="importForm" method="POST" action="/edit">
    <textarea name="data" class="hidden">{{importJson}}</textarea>
  </form>
  <div class="panel panel-default remote-search-controls" v-show="databases.state == 'complete'">
    <div class="search-type-button-container" v-if="settings.siteInfo.title === 'libris.kb.se'">
      <a class="card-link" href="/">Libris</a>
      <a class="card-link active">Andra källor</a>
    </div>
    <form v-on:submit.prevent="searchRemote()">
      <label class="hidden" for="search">{{"Search" | translatePhrase}}</label>
      <div>
        <div class="form-group search-field">
          <input type="text" class="form-control search-input" placeholder="ISBN eller valfria sökord" id="search" v-model="remoteQuery">
          <button v-bind:class="{'disabled': selectedDatabases.length === 0 || remoteResult.state === 'loading'}" v-on:click.prevent="searchRemote()" id="searchSubmit" class="search-button btn btn-primary"><i class="fa fa-search"></i> {{"Search" | translatePhrase}}</button>
        </div>
      </div>
      <div>
        <p class="small" v-if="selectedDatabases.length > 0">
          <span v-if="selectedDatabases.length == 1">Vald databas:</span>
          <span v-if="selectedDatabases.length > 1">Valda databaser:</span>
          <span v-for="db in selectedDatabases">{{db}}{{ $index === (selectedDatabases.length-1) ? '' : ', ' }}</span>
        </p>
        <p class="small" v-if="selectedDatabases.length == 0">
          <span>{{"No sources chosen" | translatePhrase}}...</span>
        </p>
        <div class="form-group remote-sources">
          <label for="source" v-on:click="showList = !showList">
            {{"Sources" | translatePhrase}}
            <i class="fa fa-fw fa-caret-right" v-show="!showList"></i>
            <i class="fa fa-fw fa-caret-down" v-show="showList"></i></label>
          <ul v-show="databases.state == 'complete' && showList" class="remoteDatabases">
            <li class="databaseItem" v-bind:class="{'active': db.active}" v-for="db in databases.list" track-by="$index" v-on:click="toggleDatabase($index)">
              <span class="dbLabel">{{db.item.database}}</span>
              <i class="dbName" v-show="db.item.database !== db.item.name">{{db.item.name}}</i>
            </li>
          </ul>
          <p v-show="databases.state == 'loading'"><i class="fa fa-circle-o-notch fa-spin"></i> {{"Loading external databases" | translatePhrase}}...</p>
          <p v-show="databases.state == 'error'"><i class="fa fa-close"></i> {{"Did not find any external databases" | translatePhrase}}. <a href="" v-on:click.prevent="loadRemoteDatabases()">{{"Try again" | translatePhrase}}</a></p>
        </div>
      </div>
    </form>
  </div>
  <p v-if="remoteResult.state === 'error'">
    <i class="fa fa-close"></i> {{"Something went wrong" | translatePhrase}}
  </p>
  <p v-if="remoteResult.state === 'loading'">
    <i class="fa fa-circle-o-notch fa-spin"></i> {{"Searching" | translatePhrase}}...
  </p>
  <search-result-component :result="convertedItems" :import-data="importData" v-if="convertedItems.totalItems > -1 || status.resultList.loading"></search-result-component>
</div>
</template>

<style lang="less">
@import './_variables.less';

  .remote-search {
    .remote-search-controls {
      padding: 20px;
      .search-type-button-container {
        margin: 1.5em 0 1em;
      }
      .hidden {
        display: none;
      }
      .search-field {
        display: flex;
        .search-input {
          height: 44px;
          margin-right: 5px;
        }
        button {
          min-width: 20%;
        }
      }
      .remote-sources {
        label {
          cursor: pointer;
        }
        ul.remoteDatabases {
          list-style: none;
          padding: 0px;
          display: flex;
          flex-wrap: wrap;
          width: 100%;
          text-align: center;
          .databaseItem {
            width: 19%;
            cursor: pointer;
            border: 1px solid @gray;
            margin: 0.2em;
            padding: 0.2em;
            border-radius: 0.2em;
            background-color: #f1f1f1;
            &.active {
              background-color: desaturate(lighten(@brand-primary, 30%), 50%);
            }
            .dbLabel {
              display: block;
              font-weight: bold;
            }
            .dbName {
              width: 100%;
              display: inline-block;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }
            .dbAddr {
              float: right;
              display: block;
            }
            .dbCheckbox {
              display: block;
            }
          }
        }
      }
    }
    .result-status {
      padding: 20px;
    }
  }
</style>
