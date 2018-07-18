<script>
import * as _ from 'lodash';
import * as httpUtil from '../../utils/http';
import * as RecordUtil from '../../utils/record';
import ResultList from './result-list';
import PanelComponent from '@/components/shared/panel-component';
import TooltipComponent from '../shared/tooltip-component';
import SearchResult from './search-result';
import { mapGetters } from 'vuex';
import VueSimpleSpinner from 'vue-simple-spinner';

export default {
  name: 'remote-databases',
  props: {
    remoteSearch: {
      q: '',
    },
  },
  data() {
    return {
      remoteResult: { state: '', totalResults: {}, items: [] },
      convertedItems: {},
      importData: [],
      showList: true,
      importJson: '',
      filterKey: '',
      remoteDatabases: {
        state: '',
        list: [],
        debug: '',
      },
    removeHover: false,
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
      const selected = [];
      const dbs = this.remoteDatabases.list;
      for (const key in dbs) {
        if (dbs.hasOwnProperty(key)) {
          if (dbs[key].active) {
            selected.push(key);
          }
        }
      }
      return selected;
    },
    filteredDatabases() {
      const dbs = this.remoteDatabases.list;
      const query = this.filterKey.toLowerCase();
      const filtered = {};
      for (const key in dbs) {
        if (
          key.toLowerCase().indexOf(query) > -1 ||
          dbs[key].name.toLowerCase().indexOf(query) > -1
          ) {
          filtered[key] = dbs[key];
        }
      }
      return filtered;
    },
    numOfFilteredDatabases() {
      return Object.keys(this.filteredDatabases).length;
    },
    q() {
      return this.remoteSearch.q;
    },
    user() {
      const user = this.$store.getters.user;
      return user.isLoggedIn ? user : false;
    },
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
    activeDatabases(val, oldVal) {
      if (val !== oldVal) {
        this.$store.dispatch('setStatusValue', { 
          property: 'remoteDatabases', 
          value: val
        });
        this.user && this.updateUserDbs(val);
      }
    },
    showList(val, oldVal) {
      if (val !== oldVal) {
        this.filterKey = '';
      }
    }
  },
  methods: {
    isPlainObject(o) {
      return _.isPlainObject(o);
    },
    loadRemoteDatabases() {
      const disabled = [
        'NLI',
        'AGRALIN',
        'ARM',
        'BNF',
        'IRN', 
        'KNYGOS',
        'LIBISNET',
        'LIBRIS',
        'NORBOK', 
        'NOSP', 
        'NYPL', 
        'NY',
        'WHOLIS', 
        'YALE'
      ];

      const defaultDbs = this.user ? this.user.settings.defaultDatabases : [];
      this.remoteDatabases.state = 'loading';
      this.remoteDatabases.debug = '';
      this.fetchDatabases().then((dbs) => {
        const dbList = {};
        for (let i = 0; i < dbs.length; i++) {
          const database = dbs[i];
          database.disabled = disabled.includes(database.database);
          database.active = defaultDbs.includes(database.database)
          dbList[dbs[i].database] = database;
        }
        this.remoteDatabases.list = dbList;
        this.remoteDatabases.state = 'complete';
      }, () => {
        this.remoteDatabases.state = 'error';
      });
    },
    fetchDatabases() {
      return new Promise((resolve, reject) => {
        httpUtil.get({ url: `${this.settings.apiPath}/_remotesearch?databases=list` })
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
    addDatabase(key) {
      if (this.remoteDatabases.list[key].disabled === false) {
        this.remoteDatabases.list[key].active = true;
      }
    },
    removeDatabase(key) {
      this.remoteDatabases.list[key].active = false;
    },
    toggleDatabase(key) {
      if (this.remoteDatabases.list[key].disabled === false) {
        this.remoteDatabases.list[key].active = !this.remoteDatabases.list[key].active;
      }
    },
    attachResult(response) {
      const convertedResult = this.convertResult(response);
      this.convertedItems = convertedResult;
      this.importData = response.items;
      this.remoteResult.state = 'complete';
    },
    updateUserDbs(dbs) {
      const userObj = this.user;
      userObj.settings.defaultDatabases = dbs
      this.$store.dispatch('setUser', userObj);
    }
  },
  components: {
    'result-list': ResultList,
    'search-result': SearchResult,
    'panel-component': PanelComponent,
    'tooltip-component': TooltipComponent,
    'vue-simple-spinner': VueSimpleSpinner,
  },
  mounted() {
    this.remoteQuery = this.remoteSearch.q;
    this.loadRemoteDatabases();
    this.showList = false;
  },
};
</script>

<template>
  <div class="RemoteDatabases" v-show="remoteDatabases.state == 'complete'">
    <p v-if="activeDatabases.length === 0" class="RemoteDatabases-activeInfo no-sources">{{'No sources chosen' | translatePhrase}}</p> 
    <p v-else class="RemoteDatabases-activeInfo">{{'Databases' | translatePhrase}}:</p>
    <div class="RemoteDatabases-activeContainer">
      <div class="RemoteDatabases-chip chip" v-for="(db, index) in activeDatabases" :key="index">
        <span class="chip-label">{{db}}</span>
        <div class="chip-removeButton icon icon--sm">
          <i class="fa fa-times-circle"  v-on:click="removeDatabase(db)"></i>
        </div>
      </div>
      <!-- <span class="RemoteDatabases-chip" v-on:click="showList = true">
        {{'Add' | translatePhrase}} <i class="fa fa-plus-circle"></i></span> -->
      <div class="RemoteDatabases-add" 
          :class="{ 'is-open': showList }"
          @click="showList = !showList"
          @keyup.enter="showList = !showList"
          tabindex="0"
          role="button"
          @mouseover="removeHover = true" 
          @mouseout="removeHover = false">
        <tooltip-component 
          v-if="!showList"
          class="RemoteDatabases-tooltip"
          :show-tooltip="removeHover" 
          tooltip-text="Add"
          position="top" 
          translation="translatePhrase">
        </tooltip-component>
        <i class="fa fa-plus-circle icon icon--primary icon--lg"></i>
      </div>
    </div>
    <panel-component
      v-if="showList"
      :title="'Sources' | translatePhrase"
      @close="showList = false"
    >
      <template slot="panel-header-extra">
        <div class="RemoteDatabases-listFilter form-group panel">
          <input 
            class="RemoteDatabases-listFilterInput customInput form-control mousetrap" 
            type="text" 
            v-model="filterKey"
            :placeholder="'Filter by' | translatePhrase "
            >
        </div>
      </template>
      <template slot="panel-body">
        <ul class="RemoteDatabases-list" aria-labelledby="remoteDbListLabel"
          v-show="remoteDatabases.state == 'complete' && showList">
          <li 
            class="RemoteDatabases-listItem"
            :class="{'is-active': db.active, 'is-disabled': db.disabled }" 
            v-for="(db, index) in filteredDatabases" 
            :key="index">
            <div class="RemoteDatabases-addControl">
              <i v-show="db.disabled" class="fa fa-ban icon icon--lg is-disabled"></i>
              <i 
                v-show="!db.active && !db.disabled" 
                class="fa fa-plus-circle icon icon--lg icon--primary" 
                :title="'Add' | translatePhrase"
                tabindex="0"
                role="button"
                @click="toggleDatabase(db.database)"
                @keyup.enter="toggleDatabase(db.database)">
              </i>
              <i 
                v-show="db.active" 
                class="fa fa-check-circle icon icon--lg" 
                :title="'Added' | translatePhrase"
                tabindex="0"
                role="button"
                @click="toggleDatabase(db.database)"
                @keyup.enter="toggleDatabase(db.database)">
              </i>
            </div>
            <div class="RemoteDatabases-dbInfo">
              <span class="RemoteDatabases-dbLabel">
                {{db.database}} 
                <span v-show="db.disabled" class="RemoteDatabases-dbUnavailable">
                  ({{'unavailable' | translatePhrase}})
                </span>
              </span>
              <span class="RemoteDatabases-dbName" 
                v-show="db.database !== db.name" 
                :title="db.name">{{db.name}}
              </span>
            </div>
            <div class="RemoteDatabases-dbExtraInfo">
              <i 
                v-show="db.comment" 
                :title="db.comment"
                class="RemoteDatabases-dbCommentTrigger fa fa-info-circle fa-fw icon icon--sm">
                <!-- <div class="RemoteDatabases-dbComment">
                  
                </div> -->
              </i>
              <i v-show="db.about" class="fa fa-question-circle fa-fw"></i>
            </div>
          </li>
        </ul>
        <div v-show="numOfFilteredDatabases === 0" class="RemoteDatabases-searchStatus">
          <span>{{'No results' | translatePhrase}}</span>
        </div>
        <div v-show="remoteDatabases.state == 'loading'" class="RemoteDatabases-searchStatus">
          <vue-simple-spinner size="large" :message="'Loading external databases' | translatePhrase"></vue-simple-spinner>
        </div>
        <div class="RemoteDatabases-searchStatus" v-show="remoteDatabases.state == 'error'">
          <p class="RemoteDatabases-statusText">
            {{"Did not find any external databases" | translatePhrase}}
          </p>
          <button class="btn btn-primary btn--sm" v-on:click.prevent="loadRemoteDatabases()">{{"Try again" | translatePhrase}}</button>
        </div>
      </template>
    </panel-component>
  <!-- <p v-if="remoteResult.state === 'error'">
    <i class="fa fa-close"></i> {{"Something went wrong" | translatePhrase}}
  </p>
  <p v-if="remoteResult.state === 'loading'">
    <i class="fa fa-circle-o-notch fa-spin"></i> {{"Searching" | translatePhrase}}...
  </p> -->
  <!-- <search-result :result="convertedItems" :import-data="importData" 
  v-if="convertedItems.totalItems > -1 || status.resultList.loading"></search-result> -->
</div>
</template>

<style lang="less">

.RemoteDatabases {

  &-activeInfo {
    font-size: 18px;
    font-size: 1.8rem;

    &.no-sources {
      color: @gray;
    }
  }

  &-activeContainer {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    min-height: 35px;
  }

  &-chip {
  }

  &-add {
    margin-left: 10px;

    &.is-open i {
      color: @icon-primary--hover;
    }
  }

  &-tooltip {
    bottom: 10px;
  }

  &-list {
    display: flex;
    flex-wrap: wrap;
    list-style: none;
    padding: 0px;
    width: 100%;
  }

  &-listFilter {
    width: 100%;
    display: flex;
    flex-direction: row;
    input {
      flex-grow: 1;
    }
  }

  &-listTitle {
    cursor: pointer;
  }

  &-listItem {
    display: flex;
    width: 100%;
    height: 60px;
    padding: 10px 15px;
    background-color: @list-item-bg-even;
    transition: background-color 0.2s ease;
    cursor: pointer;

    &:nth-child(odd) {
      background-color: @list-item-bg-odd;
    }
    &:hover:not(.is-disabled) {
      background-color: @list-item-bg-hover;
    }

    &.is-active {      
    }

    &.is-disabled {
      color: @gray;
      cursor: default;
    }
  }

  &-dbInfo {
    display: flex;
    flex-basis: 50%;
    flex-grow: 1;
    overflow: hidden;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    padding: 0 15px;
    font-weight: 600;
  }

  &-dbExtraInfo {
    display: flex;
    align-items: center;
  }
  // &-dbCommentTrigger {
  //   div {
  //     font-family: 'Open sans', sans-serif;
  //     line-height: 1.6;
  //     background-color: @neutral-color;
  //     text-align: left;
  //     display: none;
  //     position: absolute;
  //     top: 1em;
  //     right: 1em;
  //     border: 1px solid @gray-light;
  //     padding: 0.25em;
  //     border-radius: 0.25em;
  //     width: 50%;
  //   }
  //   &:hover {
  //     div {
  //       display: block;
  //     }
  //   }
  // }
  &-addControl {
    display: flex;
    align-items: center;
    width: 30px;
  }

  &-dbLabel {
    display: flex;
  }

  &-dbName {
    width: 100%;
    font-weight: normal;
    display: inline-block;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;    
    padding-left: 10px;
    &::before {
      content: ' – ';
    }
  }

  &-dbUnavailable {
    padding-left: 5px;
  }

  &-searchStatus {
    padding: 20px;
    display: flex;    
    flex-direction: column;
    align-items: center;
    font-size: 20px;
    font-size: 2rem;
    color: @grey;
  }
}
</style>
