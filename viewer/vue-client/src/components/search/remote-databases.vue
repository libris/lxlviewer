<script>
import { isPlainObject, each } from 'lodash-es';
import { mapGetters } from 'vuex';
import VueSimpleSpinner from 'vue-simple-spinner';
import * as httpUtil from '../../utils/http';
import * as RecordUtil from '../../utils/record';
import PanelComponent from '@/components/shared/panel-component';
import TooltipComponent from '../shared/tooltip-component';

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
      importJson: '',
      filterKey: '',
      remoteDatabases: {
        state: '',
        list: [],
        debug: '',
      },
      addTooltip: false,
      clearTooltip: false,
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
          key.toLowerCase().indexOf(query) > -1
          || dbs[key].name.toLowerCase().indexOf(query) > -1
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
    'set-import'(data) {
      this.importJson = data;
      this.$nextTick(() => {
        document.getElementById('importForm').submit();
      });
    },
  },
  watch: {
    activeDatabases(val, oldVal) {
      if (val !== oldVal) {
        this.$store.dispatch('setStatusValue', { 
          property: 'remoteDatabases', 
          value: val,
        });

        if (this.user) {
          this.updateUserDbs(val);
        }
      }
    },
  },
  methods: {
    isPlainObject(o) {
      return isPlainObject(o);
    },
    loadRemoteDatabases() {
      const disabled = [
        'NLI',
        'AGRALIN',
        'ARM',
        'IRN', 
        'LIBRIS',
        'NORBOK', 
        'NOSP', 
        'NYPL', 
        'NY',
        'WHOLIS', 
      ];

      const defaultDbs = this.user ? this.user.settings.defaultDatabases : [];
      this.remoteDatabases.state = 'loading';
      this.remoteDatabases.debug = '';
      this.fetchDatabases().then((dbs) => {
        const dbList = {};
        for (let i = 0; i < dbs.length; i++) {
          const database = dbs[i];
          database.disabled = disabled.includes(database.database);
          database.active = defaultDbs.includes(database.database);
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
      const convertedList = { totalItems: totalResults, items: [] };
      each(result.items, (item) => {
        const convertedItem = RecordUtil.getMainEntity(item.data['@graph']);
        convertedList.items.push(convertedItem);
      });
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
    clearDatabases() {
      this.clearTooltip = false;
      for (const key in this.remoteDatabases.list) {
        if (Object.prototype.hasOwnProperty.call(this.remoteDatabases.list, key)) {
          this.remoteDatabases.list[key].active = false;
        }
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
      userObj.settings.defaultDatabases = dbs;
      this.$store.dispatch('setUser', userObj);
    },
    // focusFilterInput() {
    //   this.$refs.listFilterInput.focus();
    // },
  },
  components: {
    'panel-component': PanelComponent,
    'tooltip-component': TooltipComponent,
    'vue-simple-spinner': VueSimpleSpinner,
  },
  mounted() {
    this.remoteQuery = this.remoteSearch.q;
    this.loadRemoteDatabases();
  },
};
</script>

<template>
  <div class="RemoteDatabases" v-show="remoteDatabases.state == 'complete'">
    <p v-if="activeDatabases.length === 0" class="RemoteDatabases-activeInfo no-sources">{{'No sources chosen' | translatePhrase}}</p> 
    <p v-else class="RemoteDatabases-activeInfo">{{'Databases' | translatePhrase}}:</p>
    <div class="ResultControls-filterWrapper">
      <div class="ResultControls-filterBadge" v-for="(db, index) in activeDatabases" :key="index">
        <span>{{db}}</span>
        <i 
          role="button"
          tabindex="0"
          class="fa fa-times-circle icon"  
          @click="removeDatabase(db)"
          @keydown.enter="removeDatabase(db)"
          :title="'Remove' | translatePhrase">
        </i>
      </div>
      <div class="RemoteDatabases-clear"
        v-if="activeDatabases.length > 1"
        @click="clearDatabases()"
        @keyup.enter="clearDatabases()"
        tabindex="0"
        role="button"
        :aria-label="'Clear all' | translatePhrase"
        @mouseover="clearTooltip = true" 
        @mouseout="clearTooltip = false">
        <tooltip-component 
          class="RemoteDatabases-tooltip"
          :show-tooltip="clearTooltip" 
          tooltip-text="Clear all"
          position="top">
        </tooltip-component>
        <i class="fa fa-times-circle icon icon--lg"></i>
      </div>
    </div>
    <portal to="facetColumn">
      <div class="RemoteDatabases-listFilter form-group panel">
        <input 
          class="RemoteDatabases-listFilterInput customInput form-control mousetrap" 
          type="text" 
          v-model="filterKey"
          :aria-label="'Filter by' | translatePhrase"
          :placeholder="'Filter by' | translatePhrase"
          ref="listFilterInput">
      </div>
      <ul class="RemoteDatabases-list"
        v-show="remoteDatabases.state == 'complete'">
        <li 
          class="RemoteDatabases-listItem"
          :class="{'is-active': db.active, 'is-disabled': db.disabled }" 
          v-for="(db, index) in filteredDatabases" 
          :key="index"
          :aria-label="db.database">
          <div class="RemoteDatabases-addControl">
            <i v-show="db.disabled" class="fa fa-ban icon icon--sm is-disabled"></i>
            <i 
              v-show="!db.disabled" 
              class="fa icon icon--sm" 
              :class="{ 'fa-square-o': !db.active, 'fa-check-square-o': db.active, 'is-active': db.active }"
              :title="db.active ? 'Remove' : 'Add' | translatePhrase"
              tabindex="0"
              role="button"
              @click="toggleDatabase(db.database)"
              @keyup.enter="toggleDatabase(db.database)">
            </i>
          </div>
          <div class="RemoteDatabases-dbInfo">
            <div class="RemoteDatabases-dbLabel">
              {{db.database}} 
              <span v-show="db.disabled" class="RemoteDatabases-dbUnavailable">
                ({{'unavailable' | translatePhrase}})
              </span>
              <div class="RemoteDatabases-dbExtraInfo" v-show="db.about">
                <i class="fa fa-question-circle fa-fw icon--sm"></i>
                <span class="RemoteDatabases-dbExtrainfoText">{{ db.about }}</span>
              </div>
              <div class="RemoteDatabases-dbExtraInfo" v-show="db.comment">
                <i class="fa fa-info-circle fa-fw icon icon icon--sm"></i>
                <span class="RemoteDatabases-dbExtrainfoText">{{ db.comment }}</span>
              </div>
            </div>
            <div class="RemoteDatabases-dbName" 
              v-show="db.database !== db.name" 
              :title="db.name">{{db.name}}
            </div>
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
    </portal>
</div>
</template>

<style lang="less">

.RemoteDatabases {

  &-activeInfo {
    margin-bottom: 5px;
    
    &.no-sources {
    }
  }

  &-activeContainer {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    min-height: 40px;
  }

  &-add,
  &-clear {
    margin-left: 10px;
  }

  &-tooltip {
    bottom: 10px;
  }

  &-list {
    list-style: none;
    padding: 0;
    margin: 0;
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

  &-listItem {
    display: flex;
    &.is-disabled {
      color: @gray-dark-transparent;
      cursor: initial;
    }
  }

  &-dbInfo {
    display: inline-block;
    overflow: hidden;
    font-weight: 600;
    width: 90%;
    font-size: 1.4rem;
  }

  &-dbExtraInfo {
    display: inline;
    &:hover {
      .RemoteDatabases-dbExtrainfoText {
        display: block;
      }
    }
  }

  &-dbExtrainfoText {
    display: none;
    position: absolute;
    right: 30px;
    width: 300px;
    font-size: 12px;
    font-size: 1.2rem;
    color: @black;
    line-height: 1.6;
    text-transform: none;
    padding: 10px;
    text-align: left;
    white-space: normal;
    background-color: @white;
    border: 1px solid @gray-lighter;
    border-radius: 4px;
    box-shadow: @shadow-panel;
    z-index: 3;
  }

  &-addControl {
    width: 2rem;
    display: inline-block;
    i.is-active {
      color: @brand-primary;
    }
  }

  &-dbLabel {
  }

  &-dbName {
    font-size: 85%;
    font-weight: normal;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &-dbUnavailable {
    padding-left: 5px;
  }
}
</style>
