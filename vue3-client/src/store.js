import Vue from 'vue';
import Vuex from 'vuex';
import { cloneDeep, each, set, get, assign, filter, isObject } from 'lodash-es';
import ClientOAuth2 from 'client-oauth2';
import * as VocabUtil from 'lxljs/vocab';
import * as StringUtil from 'lxljs/string';
import * as httpUtil from '@/utils/http';

Vue.use(Vuex);

/* eslint-disable no-param-reassign */
const store = new Vuex.Store({
  state: {
    oauth2Client: {},
  },
  mutations: {
  },
  getters: {
    oauth2Client: state => state.oauth2Client,
  },
  actions: {
    checkForMigrationOfUserDatabase({ commit, dispatch, state }) {
      // Check if user has records stored in localStorage
      if (state.userStorage.list) {
        // console.log("Found locally stored flagged records, moving to db.");
        const userStorage = state.userStorage;
        const dbMarkedDocuments = cloneDeep(state.userDatabase.markedDocuments) || {};
        const oldMarkedDocuments = userStorage.list;
        // let numberOfMigrated = 0;
        for (const [key, value] of Object.entries(oldMarkedDocuments)) {
          if (dbMarkedDocuments.hasOwnProperty(key) === false) {
            const item = cloneDeep(value);
            delete item.label;
            for (let i = 0; i < item.tags.length; i++) {
              if (item.tags[i] === 'Directory care') {
                item.tags[i] = 'Flagged';
              }
            }
            dbMarkedDocuments[key] = item;
            // numberOfMigrated++;
          }
        }
        // console.log(`Migrated ${numberOfMigrated} records to user database.`);
        // Save to db
        dispatch('modifyUserDatabase', {
          property: 'markedDocuments',
          value: dbMarkedDocuments,
          callback: () => {
            // Clean up the old list
            delete userStorage.list;
            commit('setUserStorage', userStorage);
          },
        });
      }
    },
    loadUserDatabase({ commit, dispatch, state }) {
      if (state.user.id.length === 0) {
        throw new Error('loadUserDatabase was dispatched with no real user loaded.');
      }
      // Call this when you need to load the userDatabase from the server.
      StringUtil.digestMessage(state.user.id).then((digestHex) => {
        httpUtil.get({ url: `${state.settings.apiPath}/_userdata/${digestHex}`, token: state.user.token, contentType: 'text/plain' }).then((result) => {
          commit('setUserDatabase', result);
          dispatch('checkForMigrationOfUserDatabase');
        }, (error) => {
          console.error(error);
        });
      });
    },
    modifyUserDatabase({ commit, state }, payload) {
      if (state.user.id.length === 0) {
        throw new Error('modifyUserDatabase was dispatched with no real user loaded.');
      }
      // Modifies a property in the userDatabase
      const userDatabase = cloneDeep(state.userDatabase);
      if (payload.value == null) {
        delete userDatabase[payload.property];
      } else {
        userDatabase[payload.property] = payload.value;
      }
      StringUtil.digestMessage(state.user.id).then((digestHex) => {
        httpUtil.put({ url: `${state.settings.apiPath}/_userdata/${digestHex}`, token: state.user.token, contentType: 'text/plain' }, userDatabase).then(() => {
          if (payload.callback) payload.callback();
          commit('setUserDatabase', userDatabase);
        }, (error) => {
          console.error(error);
        });
      });
    },
    initOauth2Client({ commit, state }) {
      const client = new ClientOAuth2({
        clientId: state.settings.clientId,
        authorizationUri: state.settings.authPath,
        redirectUri: state.settings.redirectPath,
        scopes: state.settings.scopes,
      });
      commit('setOauth2Client', client);
    },
  },
});

// TODO: Move this subscription to somewhere (it needs to subscribe to user store)
// store.subscribe((mutation, state) => {
//   if (mutation.type === 'setUserStorage') {
//     let userStorageTotal = JSON.parse(localStorage.getItem('userStorage'));
//     if (userStorageTotal === null) {
//       userStorageTotal = {};
//     }
//     userStorageTotal[state.user.idHash] = mutation.payload;
//     delete userStorageTotal[state.user.emailHash];
//     localStorage.setItem('userStorage', JSON.stringify(userStorageTotal));
//   }
// });
/* eslint-enable no-param-reassign */

export default store;
