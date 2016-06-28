<script>
import * as _ from 'lodash';
import * as httpUtil from '../utils/http';
import ResultItem from './resultitem';

export default {
  name: 'remote-search',
  data() {
    return {
      databases: { state: '', list: [] },
      remoteQuery: '',
      remoteResult: { state: '', totalResults: {}, items: [] },
    }
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
      this.databases['state'] = 'loading';
      this.databases['debug'] = '';
      this.fetchDatabases().then(function(response) {
        const dbs = JSON.parse(response);
        const newDbList = [];
        for (let i = 0; i < dbs.length; i++) {
          newDbList.push({ item: dbs[i], active: false });
        }
        vself.databases.list = newDbList;
        vself.databases.state = 'complete';
      }, function(error) {
        vself.databases.state = 'error';
      });
    },
    fetchDatabases() {
      return new Promise((resolve, reject) => {
        // TODO: fix url
        httpUtil.getContent('/_remotesearch?databases=list').then((response) => {
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
      vself.remoteResult['state'] = 'loading';
      this.remoteSearch(q, databases).then(function(response) {
        vself.remoteResult = JSON.parse(response);
        vself.remoteResult['state'] = 'complete';
      }, function(error) {
        vself.remoteResult['state'] = 'error';
      });
    },
    remoteSearch(q, databases) {
      return new Promise((resolve, reject) => {
        const url = `/_remotesearch?q=${q}&databases=${databases}`;
        httpUtil.getContent(url).then((response) => {
          resolve(response);
        }, (error) => {
          reject('Error loading databases...', error);
        });
      });
    },
  },
  ready: function() {
    this.loadRemoteDatabases();
  },
  computed: {
    selectedDatabases() {
      const selected = [];
      const dbs =  _.filter(this.databases.list, function (o) {
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
  <div class="panel-body container-fluid">
  <div class="row">
      <form v-on:submit.prevent="searchRemote()">
      <div class="col-md-6">
        <div class="form-group">
          <label for="source">KÄLLOR</label>
          <ul v-show="databases.state == 'complete'" class="remoteDatabases">
            <li class="databaseItem" v-for="db in databases.list" track-by="$index">
              <input class="dbCheckbox" type="checkbox" name="database" v-model="db.active" />
              <span class="dbLabel">{{db.item.database}} <i v-show="db.item.database !== db.item.name">- {{db.item.name}}</i></span>
              <span class="dbAddr" v-show="db.item.address"><a href="{{ db.item.address }}" target="_blank"><i class="fa fa-external-link-square"></i> Webbplats</a></span>
            </li>
          </ul>
          <p v-show="databases.state == 'loading'"><i class="fa fa-cog fa-spin"></i> Laddar externa databaser...</p>
          <p v-show="databases.state == 'error'"><i class="fa fa-close"></i> Kunde inte hämta externa databaser. <a href="" v-on:click.prevent="loadRemoteDatabases()">Försök igen</a></p>
        </div>
      </div>
        <div class="col-md-6">
          <div class="form-group">
            <label for="search">SÖK</label>
            <input type="text" class="form-control" placeholder="Titel, författare, isbn..." id="search" v-model="remoteQuery">
          </div>
          <p v-if="remoteResult.state === 'loading'">
            <i class="fa fa-cog fa-spin"></i> Söker...
          </p>
          <p v-if="remoteResult.state === 'error'">
            <i class="fa fa-close"></i> Något gick fel.
          </p>
          <p class="small" v-if="selectedDatabases.length > 0">
            <span v-if="selectedDatabases.length == 1">Vald databas:</span>
            <span v-if="selectedDatabases.length > 1">Valda databaser:</span>
            <span v-for="db in selectedDatabases">{{db}}{{ $index === (selectedDatabases.length-1) ? '' : ', ' }}</span>
          </p>
          <p class="small" v-if="selectedDatabases.length == 0">
            <span>Ingen databas vald...</span>
          </p>
          <button v-if="selectedDatabases.length > 0 && remoteResult.state !== 'loading'" v-on:click.prevent="searchRemote()" id="searchSubmit" class="search-button btn btn-primary"><i class="fa fa-search"></i> Sök</button>
        </div>
      </form>
    </div>
    <div class="row">
      <div class="col-md-12 " v-if="remoteResult.state == 'complete'">
        <label for="results">RESULTAT</label>
        <p v-for="(db, results) in remoteResult.totalResults">{{ results }} resultat från {{ db }}</p>
        <hr>
        <ul>
          <result-item :item="item.data['@graph'][1]" v-for="item in remoteResult.items"></result-item>
        </ul>
      </div>
    </div>
  </div>
</template>
