<script>
import * as _ from 'lodash';
import * as httpUtil from '../utils/http';
import ResultItem from './resultitem';

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
      showList: false,
    };
  },
  components: {
    'result-item': ResultItem,
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
      const databases = this.selectedDatabases.join();
      vself.remoteResult = {};
      vself.remoteResult.state = 'loading';
      this.remoteSearch(q, databases)
      .then((response) => {
        vself.remoteResult = response;
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
  <div class="panel panel-default remote-search-controls">
    <form v-on:submit.prevent="searchRemote()">
      <div v-show="databases.state == 'complete'">
        <label for="search">SÖK</label>
        <div class="form-group search-field">
          <input type="text" class="form-control" placeholder="Titel, författare, isbn..." id="search" v-model="remoteQuery">
          <button v-bind:class="{'disabled': selectedDatabases.length === 0 || remoteResult.state === 'loading'}" v-on:click.prevent="searchRemote()" id="searchSubmit" class="search-button btn btn-primary"><i class="fa fa-search"></i> Sök</button>
        </div>
        <p class="small" v-if="selectedDatabases.length > 0">
          <span v-if="selectedDatabases.length == 1">Vald databas:</span>
          <span v-if="selectedDatabases.length > 1">Valda databaser:</span>
          <span v-for="db in selectedDatabases">{{db}}{{ $index === (selectedDatabases.length-1) ? '' : ', ' }}</span>
        </p>
        <p class="small" v-if="selectedDatabases.length == 0">
          <span>Ingen källa vald...</span>
        </p>
        <p v-if="remoteResult.state === 'error'">
          <i class="fa fa-close"></i> Något gick fel.
        </p>
        <p v-if="remoteResult.state === 'loading'">
          <i class="fa fa-circle-o-notch fa-spin"></i> Söker...
        </p>
      </div>
      <div>
        <div class="form-group remote-sources">
          <label for="source" v-on:click="showList = !showList">
            KÄLLOR
            <i class="fa fa-fw fa-caret-right" v-show="!showList"></i>
            <i class="fa fa-fw fa-caret-down" v-show="showList"></i></label>
          <ul v-show="databases.state == 'complete' && showList" class="remoteDatabases">
            <li class="databaseItem" v-for="db in databases.list" track-by="$index">
              <input class="dbCheckbox" type="checkbox" name="database" v-model="db.active" />
              <span class="dbLabel">{{db.item.database}} <i v-show="db.item.database !== db.item.name">- {{db.item.name}}</i></span>
              <span class="dbAddr" v-show="db.item.address"><a href="{{ db.item.address }}" target="_blank"><i class="fa fa-external-link-square"></i> Webbplats</a></span>
            </li>
          </ul>
          <p v-show="databases.state == 'loading'"><i class="fa fa-circle-o-notch fa-spin"></i> Laddar externa databaser...</p>
          <p v-show="databases.state == 'error'"><i class="fa fa-close"></i> Kunde inte hämta externa databaser. <a href="" v-on:click.prevent="loadRemoteDatabases()">Försök igen</a></p>
        </div>
      </div>
    </form>
  </div>
  <div class="panel panel-default">
    <div v-if="remoteResult.state == 'complete'">
      <label for="results">RESULTAT</label>
      <p v-for="(db, results) in remoteResult.totalResults">{{ results }} resultat från {{ db }}</p>
      <hr>
      <ul class="remote-list">
        <result-item :item="item" v-for="item in remoteResult.items"></result-item>
      </ul>
    </div>
  </div>
</div>
</template>

<style lang="less">
@import './_variables.less';

  .remote-search {
    .remote-search-controls {
      padding: 20px;
      .search-field {
        display: flex;
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
        }
      }
    }
  }
</style>
