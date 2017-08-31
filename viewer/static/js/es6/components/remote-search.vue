<script>
import * as _ from 'lodash';
import * as httpUtil from '../utils/http';
import ResultItem from './resultitem';
import ResultList from './result-list';

export default {
  name: 'remote-search',
  props: {
    db: [],
    q: '',
  },
  data() {
    return {
      databases: { state: '', list: [] },
      remoteQuery: '',
      remoteResult: { state: '', totalResults: {}, items: [] },
      convertedItems: [],
      showList: true,
    };
  },
  components: {
    'result-item': ResultItem,
    'result-list': ResultList,
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
        vself.remoteResult = response;
        vself.convertedItems = this.convertResult(response.items);
        vself.remoteResult.state = 'complete';
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
    convertResult(items) {
      const convertedList = [];
      _.each(items, (item) => {
        const convertedItem = this.getMainEntity(item.data['@graph']);
        convertedList.push(convertedItem);
      })
      return convertedList;
    },
    getMainEntity(graph) {
      const mainEntityId = graph[0].mainEntity['@id'];
      let mainEntity = {};
      _.each(graph, (node) => {
        if (node['@id'] === mainEntityId) {
          mainEntity = node;
        }
      });
      return mainEntity;
    },
    toggleDatabase(index) {
      if (this.databases.list[index]) {
        this.databases.list[index].active = !this.databases.list[index].active;
      }
    },
  },
  ready() {
    this.remoteQuery = this.q;
    this.loadRemoteDatabases();
  },
  computed: {
    selectedDatabases() {
      const selected = [];
      const dbs = _.filter(this.databases.list, function (o) {
        return o.active;
      });
      for (let i = 0; i < dbs.length; i++) {
        selected.push(dbs[i].item.database);
      }
      return selected;
    },
  },
};
</script>

<template>
<div class="remote-search">
  <div class="panel panel-default remote-search-controls" v-show="databases.state == 'complete'">
    <form v-on:submit.prevent="searchRemote()">
      <label for="search">SÖK (METAPROXY)</label>
      <div>
        <div class="form-group search-field">
          <input type="text" class="form-control search-input" placeholder="Titel, författare, isbn..." id="search" v-model="remoteQuery">
          <button v-bind:class="{'disabled': selectedDatabases.length === 0 || remoteResult.state === 'loading'}" v-on:click.prevent="searchRemote()" id="searchSubmit" class="search-button btn btn-primary"><i class="fa fa-search"></i> Sök</button>
        </div>
      </div>
      <div>
        <p class="small" v-if="selectedDatabases.length > 0">
          <span v-if="selectedDatabases.length == 1">Vald databas:</span>
          <span v-if="selectedDatabases.length > 1">Valda databaser:</span>
          <span v-for="db in selectedDatabases">{{db}}{{ $index === (selectedDatabases.length-1) ? '' : ', ' }}</span>
        </p>
        <p class="small" v-if="selectedDatabases.length == 0">
          <span>Ingen källa vald...</span>
        </p>
        <div class="form-group remote-sources">
          <label for="source" v-on:click="showList = !showList">
            KÄLLOR
            <i class="fa fa-fw fa-caret-right" v-show="!showList"></i>
            <i class="fa fa-fw fa-caret-down" v-show="showList"></i></label>
          <ul v-show="databases.state == 'complete' && showList" class="remoteDatabases">
            <li class="databaseItem" v-bind:class="{'active': db.active}" v-for="db in databases.list" track-by="$index" v-on:click="toggleDatabase($index)">
              <span class="dbLabel">{{db.item.database}}</span>
              <i class="dbName" v-show="db.item.database !== db.item.name">{{db.item.name}}</i>
            </li>
          </ul>
          <p v-show="databases.state == 'loading'"><i class="fa fa-circle-o-notch fa-spin"></i> Laddar externa databaser...</p>
          <p v-show="databases.state == 'error'"><i class="fa fa-close"></i> Kunde inte hämta externa databaser. <a href="" v-on:click.prevent="loadRemoteDatabases()">Försök igen</a></p>
        </div>
      </div>
    </form>
  </div>
  <p v-if="remoteResult.state === 'error'">
    <i class="fa fa-close"></i> Något gick fel.
  </p>
  <p v-if="remoteResult.state === 'loading'">
    <i class="fa fa-circle-o-notch fa-spin"></i> Söker...
  </p>
  <div class="panel panel-default result-status" v-if="remoteResult.state == 'complete'">
    <label for="results">RESULTAT</label>
    <p v-for="(db, results) in remoteResult.totalResults">{{ results }} resultat från {{ db }}</p>
  </div>
  <result-list :results="convertedItems"></result-list>
</div>
</template>

<style lang="less">
@import './_variables.less';

  .remote-search {
    .remote-search-controls {
      padding: 20px;
      .search-field {
        display: flex;
        .search-input {
          height: 44px;
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
