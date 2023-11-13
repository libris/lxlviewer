<script>
import { isPlainObject, each } from 'lodash-es';
import { mapGetters } from 'vuex';
import Spinner from '@/components/shared/spinner.vue';
import * as httpUtil from '@/utils/http';
import * as RecordUtil from '@/utils/record';
import { translatePhrase } from '@/utils/filters';

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
      hideFacetColumn: true,
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
      const dbs = this.remoteDatabases.list;
      const active = {};
      for (const key in dbs) {
        if (
          dbs[key].active === true
        ) {
          active[key] = dbs[key];
        }
      }
      return active;
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
        const activeIds = [];
        for (const key in val) {
          if (val[key].active === true) {
            activeIds.push(key);
          }
        }
        this.$store.dispatch('setStatusValue', {
          property: 'remoteDatabases',
          value: activeIds,
        });

        if (this.user) {
          this.updateUserDbs(activeIds);
        }
      }
    },
  },
  methods: {
    translatePhrase,
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
        httpUtil.get({ url: `${this.settings.apiPath}/_remotesearch?databases=list`, token: this.user.token })
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
    Spinner,
  },
  mounted() {
    this.remoteQuery = this.remoteSearch.q;
    this.loadRemoteDatabases();
  },
};
</script>

<template>
  <div class="RemoteDatabases">
    <!-- <p v-if="activeDatabases.length === 0" class="RemoteDatabases-activeInfo no-sources">{{translatePhrase('No sources chosen')}}</p>  -->
    <!-- <p v-else class="RemoteDatabases-activeInfo">{{translatePhrase('Databases')}}:</p> -->
    <!-- <div class="ResultControls-filterWrapper">
      <div class="ResultControls-filterBadge" v-for="(db, index) in activeDatabases" :key="index">
        <span>{{db}}</span>
        <i
          role="button"
          tabindex="0"
          class="fa fa-times-circle icon"
          @click="removeDatabase(db)"
          @keydown.enter="removeDatabase(db)"
          :title="translatePhrase('Remove')">
        </i>
      </div>
      <div class="ResultControls-filterBadge--inverted"
        v-if="activeDatabases.length > 1"
        @click="clearDatabases()"
        @keyup.enter="clearDatabases()"
        tabindex="0"
        role="button"
        :aria-label="translatePhrase('Clear all')"
        @mouseover="clearTooltip = true"
        @mouseout="clearTooltip = false">
        {{ translatePhrase('Clear all') }}
        <i class="fa fa-times-circle icon"></i>
      </div>
    </div> -->
    <portal to="facetColumn">
      <div v-show="remoteDatabases.state == 'loading'" class="RemoteDatabases-searchStatus">
        <Spinner size="2x" :message="translatePhrase('Loading external databases')" />
      </div>
      <div class="RemoteDatabases-searchStatus" v-show="remoteDatabases.state == 'error'">
        <p class="RemoteDatabases-statusText">
          {{ translatePhrase("Did not find any external databases") }}
        </p>
        <button class="btn btn-primary btn--sm" v-on:click.prevent="loadRemoteDatabases()">{{ translatePhrase("Try again") }}</button>
      </div>
      <div v-if="remoteDatabases.state == 'complete'" class="Find-facetHeading uppercaseHeading--light">
        <span @click="hideFacetColumn = !hideFacetColumn">
          {{ translatePhrase('Valda databaser') }} ({{ status.remoteDatabases.length }})
          <i
            class="fa fa-fw hidden-md hidden-lg"
            :class="{ 'fa-caret-down': !hideFacetColumn, 'fa-caret-right': hideFacetColumn }" />
        </span>
        <a
          class="pull-right"
          v-if="status.remoteDatabases.length > 0"
          @click="clearDatabases()">{{ translatePhrase('Clear') }}</a></div>
      <div v-if="remoteDatabases.state == 'complete'" :class="{ 'hidden-xs hidden-sm': hideFacetColumn }">
        <ul class="RemoteDatabases-activeList">
          <li
            class="RemoteDatabases-activeListItem"
            v-for="(db, index) in activeDatabases"
            :key="index"
            :aria-label="db.database">
            {{db.database}}
            <i
              v-show="!db.disabled"
              class="fa icon icon--xs fa-times-circle"
              :title="translatePhrase(db.active ? 'Remove' : 'Add')"
              tabindex="0"
              role="button"
              @click="toggleDatabase(db.database)"
              @keyup.enter="toggleDatabase(db.database)" />
          </li>
        </ul>
        <hr class="sectionDivider">
        <span class="uppercaseHeading--light">
          Databaser
        </span>
        <input
          class="RemoteDatabases-listFilterInput customInput mousetrap"
          type="text"
          v-if="remoteDatabases.state == 'complete'"
          v-model="filterKey"
          :aria-label="translatePhrase('Search for database')"
          :placeholder="translatePhrase('Search for database')"
          ref="listFilterInput">
        <ul class="RemoteDatabases-list" v-if="remoteDatabases.state == 'complete'">
          <li
            class="RemoteDatabases-listItem"
            :class="{ 'is-active': db.active, 'is-disabled': db.disabled }"
            v-for="(db, index) in filteredDatabases"
            :key="index"
            :aria-label="db.database">
            <div class="RemoteDatabases-addControl">
              <i v-show="db.disabled" class="fa fa-ban icon icon--sm is-disabled" />
              <i
                v-show="!db.disabled"
                class="fa icon icon--sm"
                :class="{ 'fa-plus-circle': !db.active, 'fa-check-circle': db.active, 'is-inactive': !db.active }"
                :title="translatePhrase(db.active ? 'Remove' : 'Add')"
                tabindex="0"
                role="button"
                @click="toggleDatabase(db.database)"
                @keyup.enter="toggleDatabase(db.database)" />
            </div>
            <div class="RemoteDatabases-dbInfo">
              <div class="RemoteDatabases-dbLabel">
                {{db.database}}
                <span v-show="db.disabled" class="RemoteDatabases-dbUnavailable">
                  ({{ translatePhrase('unavailable')}})
                </span>
                <div class="RemoteDatabases-dbExtraInfo" v-show="db.about">
                  <i class="fa fa-question-circle fa-fw icon" />
                  <span class="RemoteDatabases-dbExtrainfoText">{{ db.about }}</span>
                </div>
                <div class="RemoteDatabases-dbExtraInfo" v-show="db.comment">
                  <i class="fa fa-info-circle fa-fw icon" />
                  <span class="RemoteDatabases-dbExtrainfoText">{{ db.comment }}</span>
                </div>
              </div>
              <div
                class="RemoteDatabases-dbName"
                v-show="db.database !== db.name"
                :title="db.name">{{db.name}}
              </div>
            </div>
          </li>
        </ul>
        <div v-show="numOfFilteredDatabases === 0 && remoteDatabases.state !== 'loading'" class="RemoteDatabases-searchStatus">
          <span>{{ translatePhrase('No results') }}</span>
        </div>
      </div>
    </portal>
  </div>
</template>

<style lang="less">

.RemoteDatabases {

  &-activeInfo {
    margin-bottom: 5px;
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
    background-color: transparent;
    color: #364a4c;
  }

  &-tooltip {
    bottom: 10px;
  }

  &-list {
    list-style: none;
    padding: 0;
    margin: 0.5em 0 0 0;
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
    margin-bottom: 1rem;
    &.is-disabled {
      color: @grey-dark-transparent;
      cursor: initial;
    }
  }
  &-activeList {
    list-style: none;
    padding: 0;
    margin: 0.5em 0 0 0;
    width: 100%;
    display: flex;
    flex-wrap: wrap;
  }
  &-activeListItem {
    display: inline-block;
    border-radius: 2em;
    border: 1px solid @brand-primary;
    color: @brand-primary;
    padding: 0 0.4em;
    margin: 0 0.2em 0.2em 0;
    font-size: 1.4rem;
    font-weight: 600;
  }

  &-dbInfo {
    display: inline-block;
    overflow: hidden;
    font-weight: 600;
    width: 90%;
    font-size: 1.4rem;
    line-height: 1.6rem;
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
    border: 1px solid @grey-lighter;
    border-radius: 4px;
    box-shadow: @shadow-panel;
    z-index: 3;
  }

  &-addControl {
    width: 2rem;
    line-height: 1.6rem;
    display: inline-block;
    i.is-inactive {
      color: @brand-primary;
    }
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
