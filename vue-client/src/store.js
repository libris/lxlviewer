import Vue from 'vue';
import Vuex from 'vuex';
import { cloneDeep, each, set, get, assign, filter, isObject } from 'lodash-es';
import ClientOAuth2 from 'client-oauth2';
import * as VocabUtil from 'lxljs/vocab';
import * as StringUtil from 'lxljs/string';
import * as httpUtil from '@/utils/http';

const EXTRACT_ON_SAVE = '__EXTRACT_ON_SAVE__';

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
