<script>
import * as _ from 'lodash';
import * as httpUtil from '../../utils/http';
import * as RecordUtil from '../../utils/record';
import ResultList from './result-list';
import SearchResult from './search-result';
import { mapGetters } from 'vuex';

export default {
  name: 'remote-databases',
  props: {
    db: [],
    remoteSearch: {
      q: '',
      activeDatabases: []
    },
  },
  data() {
    return {
      databases: { state: '', list: [] },
      remoteResult: { state: '', totalResults: {}, items: [] },
      convertedItems: {},
      importData: [],
      showList: true,
      importJson: '',
    };
  },
  computed: {
    ...mapGetters([
      'inspector',
      'resources',
      'user',
      'settings',
      'status',
    ]),
    activeDatabases() {
      return this.remoteSearch.activeDatabases;
    },
    q() {
      return this.remoteSearch.q;
    }
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
          this.activeDatabases = selected;
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
          //vself.activeDatabases = history.state.activeDatabases;
          vself.attachResult(history.state);
          this.showList = false;
        }
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
    // searchRemote() {
    //   if (activeDatabases.length === 0 || this.remoteQuery === '') return;
    //   const vself = this;
    //   const q = this.remoteQuery;
    //   this.showList = false;
    //   const databases = activeDatabases.join();
    //   vself.remoteResult = {};
    //   vself.remoteResult.state = 'loading';
    //   this.remoteSearch(q, databases)
    //   .then((response) => {
    //     const clonedResponse = _.cloneDeep(response);
    //     clonedResponse.activeDatabases = activeDatabases;
    //     vself.remoteResult = response;
    //     history.pushState(clonedResponse, 'unused');
    //     this.attachResult(clonedResponse);
    //   }, () => {
    //     vself.remoteResult.state = 'error';
    //   });
    // },
    // remoteSearch(q, databases) {
    //   return new Promise((resolve, reject) => {
    //     const url = `/_remotesearch?q=${q}&databases=${databases}`;
    //     httpUtil.get({ url })
    //     .then((response) => {
    //       resolve(response);
    //     }, (error) => {
    //       reject('Error loading databases...', error);
    //     });
    //   });
    // },
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
  components: {
    //'result-item': ResultItem,
    'result-list': ResultList,
    'search-result': SearchResult,
  },
  mounted() {
    this.remoteQuery = this.remoteSearch.q;
    this.loadRemoteDatabases();
  },
};
</script>

<template>
  <div class="RemoteDatabases" v-show="databases.state == 'complete'">
    <div class="RemoteDatabases-activeInfo">
      <p v-if="activeDatabases.length > 0">
        <span v-if="activeDatabases.length == 1">Vald databas:</span>
        <span v-if="activeDatabases.length > 1">Valda databaser:</span>
        <span v-for="(db, index) in activeDatabases" 
          :key="index">{{db}}{{ index === (activeDatabases.length-1) ? '' : ', ' }}</span>
      </p>
      <p v-if="activeDatabases.length == 0">
        <span>{{"No sources chosen" | translatePhrase}}...</span>
      </p>
    </div>
    <div class="RemoteDatabases-container">
      <h4 id="remoteDbListLabel" class="RemoteDatabases-listTitle" v-on:click="showList = !showList">
        {{"Sources" | translatePhrase}}
        <i class="fa fa-fw fa-caret-right" v-show="!showList"></i>
        <i class="fa fa-fw fa-caret-down" v-show="showList"></i>
      </h4>
      <ol class="RemoteDatabases-list" aria-labelledby="remoteDbListLabel"
        v-show="databases.state == 'complete' && showList">
        <li class="RemoteDatabases-listItem" tabindex="0"
          :class="{'is-active': db.active}" 
          v-for="(db, index) in databases.list" 
          @click="toggleDatabase(index)"
          @keyup.enter="toggleDatabase(index)"
          :key="index">
          <span class="RemoteDatabases-dbLabel">{{db.item.database}}</span>
          <em class="RemoteDatabases-dbName" 
            v-show="db.item.database !== db.item.name" 
            :title="db.item.name">{{db.item.name}}</em>
        </li>
      </ol>
      <p class="RemoteDatabases-statusText" v-show="databases.state == 'loading'" >
        <i class="fa fa-circle-o-notch fa-spin"></i> 
        {{"Loading external databases" | translatePhrase}}...
      </p>
      <p class="RemoteDatabases-statusText" v-show="databases.state == 'error'">
        <i class="fa fa-close"></i> 
        {{"Did not find any external databases" | translatePhrase}}. 
        <a href="" v-on:click.prevent="loadRemoteDatabases()">
          {{"Try again" | translatePhrase}}
        </a>
      </p>
    </div>
  <!-- <p v-if="remoteResult.state === 'error'">
    <i class="fa fa-close"></i> {{"Something went wrong" | translatePhrase}}
  </p>
  <p v-if="remoteResult.state === 'loading'">
    <i class="fa fa-circle-o-notch fa-spin"></i> {{"Searching" | translatePhrase}}...
  </p> -->
  <!-- <search-result :result="convertedItems" :import-data="importData" v-if="convertedItems.totalItems > -1 || status.resultList.loading"></search-result> -->
</div>
</template>

<style lang="less">

.RemoteDatabases {
  &-list {
    display: flex;
    flex-wrap: wrap;
    list-style: none;
    padding: 0px;
    text-align: center;
    width: 100%;
  }

  &-listItem {
    border-radius: 0.2em;
    background-color: #f1f1f1;
    border: 1px solid @gray;
    cursor: pointer;
    margin: 0.2em;
    padding: 0.2em;
    width: 19%;

    &.is-active {
      background-color: desaturate(lighten(@brand-primary, 30%), 50%);
    }

    &:focus {
      border: 1px solid desaturate(lighten(@brand-primary, 30%), 50%);
      border-radius: 0;
      outline: 2px dashed desaturate(lighten(@brand-primary, 30%), 50%);
    }
  }

  &-dbLabel {
    display: block;
    font-weight: 700;
  }

  &-dbName {
    width: 100%;
    display: inline-block;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;    
  }

  &-resultStatus {
    padding: 20px;
  }
}
</style>
