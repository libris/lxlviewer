import Vue from 'vue';
import Vuex from 'vuex';
import { cloneDeep, each, set, get, assign, filter, isObject } from 'lodash-es';
import ClientOAuth2 from 'client-oauth2';
import * as VocabUtil from 'lxljs/vocab';
import * as StringUtil from 'lxljs/string';
import settings from './settings';
import * as httpUtil from '@/utils/http';
import * as User from '@/models/user';

Vue.use(Vuex);

/* eslint-disable no-param-reassign */
const store = new Vuex.Store({
  state: {
    resources: {
      resourcesLoaded: false,
      loadingError: false,
      vocab: {},
      display: {},
      context: {},
      templates: {},
      helpDocs: null,
      globalMessages: null,
      i18n: null,
      displayGroups: null,
    },
    directoryCare: {
      sender: null,
      senderHoldings: [],
      reciever: null,
      recieverHoldings: [],
      selectedHoldings: [],
      holdingsMoved: [],
    },
    enrichment: {
      data: {
        source: null,
        target: null,
        result: null,
      },
    },
    inspector: {
      data: {},
      insertData: {},
      originalData: {},
      compositeHistoryData: {},
      languageCache: {},
      title: '',
      status: {
        detailedEnrichmentModal: {
          open: false,
        },
        saving: false,
        opening: false,
        lastAdded: '',
        editing: false,
        focus: 'mainEntity',
        removing: false,
        updating: false,
        isNew: false,
        readyForSave: true,
        embellished: [],
      },
      validation: {
        numberOfViolations: 0,
        violations: {},
      },
      clipboard: null,
      changeHistory: [],
      event: [],
      magicShelfMarks: [], 
    },
    status: {
      userIdle: false,
      panelOpen: false,
      fullScreenPanelOpen: false,
      keybindState: '',
      fullWidth: false,
      keyActions: [],
      resultList: {
        loading: false,
      },
      loadingIndicators: [],
      notifications: [],
      helpSectionTitle: '',
      remoteDatabases: [],
      workingRemoteDatabases: '',
      failedRemoteDatabases: '',
      hintSigelChange: false,
    },
    user: User.getUserObject(),
    userDatabase: null,
    userStorage: {
      list: {},
      copyClipboard: null,
      dismissedMessages: [],
    },
    settings: settings,
    oauth2Client: {},
  },
  mutations: {
    setUserDatabase(state, data) {
      // Sets the userDatabase to *state*
      // this should only be called after an API call to the user database has been successful
      // Usually it would be set after a load from the database,
      // or if you modify something and get a 200 response.
      let recievedData = data;
      if (isObject(recievedData) === false) {
        if (recievedData.length === 0) {
          recievedData = {};
        } else {
          recievedData = JSON.parse(recievedData);
        }
      }
      state.userDatabase = recievedData;
    },
    setGlobalMessages(state, payload) {
      state.resources.globalMessages = payload;
    },
    setValidation(state, payload) {
      if (payload.validates) {
        if (state.inspector.validation.violations[payload.path]) {
          delete state.inspector.validation.violations[payload.path];
        }
      } else {
        state.inspector.validation.violations[payload.path] = payload.reasons;
      }
      state.inspector.validation.numberOfViolations = Object.keys(state.inspector.validation.violations).length;
    },
    pushKeyAction(state, keyAction) {
      state.status.keyActions.push(keyAction);
    },
    pushInspectorEvent(state, payload) {
      state.inspector.event = payload;
    },
    pushNotification(state, content) {
      const date = new Date();
      content.id = StringUtil.getHash(`${date.getSeconds()}${date.getMilliseconds()}`);
      state.status.notifications.push(content);
    },
    removeNotification(state, id) {
      for (let i = 0; i < state.status.notifications.length; i++) {
        if (state.status.notifications[i].id === id) {
          state.status.notifications.splice(i, 1);
        }
      }
    },
    setOriginalData(state, data) {
      state.inspector.originalData = cloneDeep(data);
    },
    setInspectorData(state, data) {
      state.inspector.data = data;
    },
    setInsertData(state, data) {
      state.inspector.insertData = data;
    },
    setCompositeHistoryData(state, data) {
      state.inspector.compositeHistoryData = data;
    },
    addToLanguageCache(state, data) {
      const languageCache = cloneDeep(state.inspector.languageCache);
      for (const [key, value] of Object.entries(data)) {
        languageCache[key] = value;
      }
      state.inspector.languageCache = languageCache;
    },

    addToQuoted(state, data) {
      const quoted = cloneDeep(state.inspector.data.quoted);
      quoted[data['@id']] = data;
      (data.sameAs || []).forEach((sameAs) => {
        if (sameAs.hasOwnProperty('@id')) {
          quoted[sameAs['@id']] = data;
        }
      });
      
      state.inspector.data.quoted = quoted;
    },
    updateInspectorData(state, payload) {
      state.inspector.status.updating = true;
      // Clone inspectorData so we can manipulate it before setting it
      let inspectorData = cloneDeep(state.inspector.data);
      // Push old value to history
      if (payload.addToHistory) {
        const changes = [];
        each(payload.changeList, (node) => {
          let oldValue;
          if (node.path === '') {
            oldValue = inspectorData;
          } else {
            oldValue = cloneDeep(get(inspectorData, node.path));
          }
          const historyNode = { path: node.path, value: oldValue };
          changes.push(historyNode);
        });
        state.inspector.changeHistory.push(changes);
      }
      // Set the new values
      each(payload.changeList, (node) => {
        // console.log("DATA_UPDATE:", JSON.stringify(node));
        if (node.path === '') {
          inspectorData = node.value;
        } else {
          set(inspectorData, node.path, node.value);
        }
      });
      // Check if we should remove work node (if it went from local to being linked)
      if (inspectorData.mainEntity.hasOwnProperty('instanceOf') && (inspectorData.mainEntity.instanceOf === null || (inspectorData.mainEntity.instanceOf.hasOwnProperty('@id') && inspectorData.mainEntity.instanceOf['@id'].indexOf('#work') === -1))) {
        if (state.inspector.data.hasOwnProperty('work')) {
          delete inspectorData.work;
        }
      }
      // Apply everything
      state.inspector.data = Object.assign({}, inspectorData);
    },
    setInspectorTitle(state, str) {
      state.inspector.title = str;
    },
    setStatusValue(state, payload) {
      if (state.status.hasOwnProperty(payload.property)) {
        state.status[payload.property] = payload.value;
      } else {
        throw new Error(`Trying to set unknown status property "${payload.property}". Is it defined in the store?`);
      }
    },
    setOauth2Client(state, client) {
      state.oauth2Client = client;
    },
    setInspectorStatusValue(state, payload) {
      if (state.inspector.status.hasOwnProperty(payload.property)) {
        state.inspector.status[payload.property] = payload.value;
      } else {
        throw new Error(`Trying to set unknown status property "${payload.property}" on inspector. Is it defined in the store?`);
      }
    },
    setUser(state, userObj) {
      state.user = userObj;
      // Sync user language with app language
      state.settings.language = state.user.settings.language;
      // Sync user settings with localstorage
      state.user.saveSettings();
    },
    setEnrichmentTarget(state, data) {
      state.enrichment.data.target = data;
    },
    setEnrichmentSource(state, data) {
      state.inspector.data.quoted = assign(data.quoted, state.inspector.data.quoted);
      state.enrichment.data.source = data;
    },
    setEnrichmentResult(state, data) {
      state.enrichment.data.result = data;
    },
    setUserStorage(state, data) {
      if (data) {
        state.userStorage = data;
      } else {
        state.userStorage = {
          list: {},
          copyClipboard: null,
        };
      }
    },
    flushChangeHistory(state) {
      state.inspector.changeHistory = [];
    },
    logoutUser(state) {
      localStorage.removeItem('at');
      state.user = User.getUserObject();
    },
    setSettings(state, settingsObj) {
      state.settings = settingsObj;
    },
    changeResourcesStatus(state, status) {
      state.resources.resourcesLoaded = status;
    },
    changeResourcesLoadingError(state, bool) {
      state.resources.loadingError = bool;
    },
    setHelpDocs(state, data) {
      state.resources.helpDocs = data;
    },
    setVocab(state, data) {
      state.resources.vocab = data;
    },
    setVocabProperties(state, data) {
      state.resources.vocabProperties = data;
    },
    setVocabClasses(state, data) {
      state.resources.vocabClasses = data;
    },
    setTemplates(state, data) {
      state.resources.templates = data;
    },
    setContext(state, data) {
      state.resources.context = data;
    },
    setForcedListTerms(state, data) {
      state.resources.forcedListTerms = data;
    },
    setDisplay(state, data) {
      state.resources.display = data;
    },
    setTranslations(state, data) {
      state.resources.i18n = data;
    },
    setResource(state, payload) {
      state.resources[payload.property] = payload.value;
    },
    setDirectoryCare(state, data) {
      state.directoryCare = data;
    },
    addMagicShelfMark(state, path) {
      state.inspector.magicShelfMarks.push(path);
    },
    removeMagicShelfMark(state, path) {
      state.inspector.magicShelfMarks = state.inspector.magicShelfMarks.filter(p => p !== path);
    },
  },
  getters: {
    inspector: state => state.inspector,
    resources: state => state.resources,
    resourcesLoaded: state => state.resources.resourcesLoaded,
    resourcesLoadingError: state => state.resources.loadingError,
    templates: state => state.resources.templates,
    settings: state => state.settings,
    oauth2Client: state => state.oauth2Client,
    user: state => state.user,
    userStorage: state => state.userStorage,
    enrichment: state => state.enrichment,
    activeGlobalMessages: (state) => {
      const now = new Date();
      const activeMessages = [];
      const messages = state.resources.globalMessages;
      if (messages && messages.length > 0) {
        for (let i = 0; i < messages.length; i++) {
          if (state.userStorage.hasOwnProperty('dismissedMessages') && state.userStorage.dismissedMessages.includes(messages[i].id)) {
            continue;
          }
          const startTime = new Date(messages[i].startTime * 1000);
          const endTime = new Date(messages[i].endTime * 1000);
          if (startTime < now && endTime > now) {
            activeMessages.push(messages[i]);
          }
        }
      }
      return activeMessages;
    },
    userBookmarks: (state) => {
      const collection = [];
      if (state.userDatabase == null || state.userDatabase.markedDocuments == null) {
        return collection;
      }
      const list = state.userDatabase.markedDocuments;
      const ids = Object.keys(list);
      for (let i = 0; i < ids.length; i++) {
        const listItem = list[ids[i]];
        if (listItem.hasOwnProperty('tags') && listItem.tags.indexOf('Bookmark') > -1) {
          collection.push({ '@id': ids[i], label: list[ids[i]].label });
        }
      }
      return collection;
    },
    userFlagged: (state) => {
      const collection = [];
      if (state.userDatabase == null || state.userDatabase.markedDocuments == null) {
        return collection;
      }
      const list = state.userDatabase.markedDocuments;
      const ids = Object.keys(list);
      for (let i = 0; i < ids.length; i++) {
        const listItem = list[ids[i]];
        if (listItem.hasOwnProperty('tags') && listItem.tags.indexOf('Flagged') > -1) {
          collection.push({ '@id': ids[i], label: list[ids[i]].label });
        }
      }
      return collection;
    },
    userDatabase: state => state.userDatabase,
    status: state => state.status,
    directoryCare: state => state.directoryCare,
    vocab: state => state.resources.vocab,
    display: state => state.resources.display,
    context: state => state.resources.context,
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
    mark({ dispatch, state }, payload) {
      const markedDocuments = cloneDeep(state.userDatabase.markedDocuments) || {};
      const tag = payload.tag;
      const id = payload.documentId;
      if (markedDocuments.hasOwnProperty(id)) {
        if (markedDocuments[id].tags.indexOf(tag) < 0) {
          markedDocuments[id].tags.push(tag);
        }
      } else {
        markedDocuments[id] = { tags: [tag] };
      }
      dispatch('modifyUserDatabase', { property: 'markedDocuments', value: markedDocuments });
    },
    unmark({ dispatch, state }, payload) {
      const markedDocuments = cloneDeep(state.userDatabase.markedDocuments);
      const tag = payload.tag;
      const id = payload.documentId;
      if (markedDocuments.hasOwnProperty(id)) {
        if (markedDocuments[id].tags.indexOf(tag) >= 0) {
          markedDocuments[id].tags.splice(markedDocuments[id].tags.indexOf(tag), 1);
          if (markedDocuments[id].tags.length === 0) {
            delete markedDocuments[id];
          }
        }
      }
      dispatch('modifyUserDatabase', { property: 'markedDocuments', value: markedDocuments });
    },
    purgeUserTagged({ dispatch, state }, tagName) {
      const markedDocuments = cloneDeep(state.userDatabase.markedDocuments);
      const newList = {};
      for (const [key, value] of Object.entries(markedDocuments)) {
        value.tags.splice(value.tags.indexOf(tagName), 1);
        if (value.tags.length > 0) {
          newList[key] = value;
        }
      }      
      dispatch('modifyUserDatabase', { property: 'markedDocuments', value: newList });
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
    setEnrichmentTarget({ commit }, data) {
      commit('setEnrichmentTarget', data);
    },
    setEnrichmentSource({ commit }, data) {
      commit('setEnrichmentSource', data);
    },
    setEnrichmentResult({ commit }, data) {
      commit('setEnrichmentResult', data);
    },
    setGlobalMessages({ commit }, data) {
      commit('setGlobalMessages', data);
    },
    dismissMessage({ commit, state }, id) {
      const userStorage = cloneDeep(state.userStorage);
      if (userStorage.hasOwnProperty('dismissedMessages') === false) {
        userStorage.dismissedMessages = [];
      }
      userStorage.dismissedMessages.push(id);
      commit('setUserStorage', userStorage);
    },
    cleanupDismissedList({ commit, state }) {
      if (state.resources.globalMessages.length > 0) {
        const userStorage = cloneDeep(state.userStorage);
        const keepInList = [];
        if (userStorage.hasOwnProperty('dismissedMessages') && userStorage.dismissedMessages.length > 0) {
          for (let i = 0; i < userStorage.dismissedMessages.length; i++) {
            const item = userStorage.dismissedMessages[i];
            for (let x = 0; x < state.resources.globalMessages.length; x++) {
              if (state.resources.globalMessages[x].id === item) {
                keepInList.push(item);
              }
            }
          }
        }
        userStorage.dismissedMessages = keepInList;
        commit('setUserStorage', userStorage);
      }
    },
    async verifyUser({ commit, state }) {
      return new Promise((resolve, reject) => {
        if (state.user.isLoggedIn === true && state.user.hasTokenExpired() === false) {
          resolve();
          return;
        }
        const token = localStorage.getItem('at');
        let userObj = User.getUserObject();
        if (token !== null) {
          const headers = new Headers();
          const verifyUrl = state.settings.verifyPath;
          headers.append('Authorization', `Bearer ${token}`);
          fetch(verifyUrl, {
            headers,
            method: 'GET',
          }).then(response => response.json()).then((result) => {
            userObj = User.getUserObject(result.user);
            userObj.token = token;
            userObj.token_expires_at = result.expires_at;
            userObj.loadUserData(state.settings.apiPath).then(() => {
              commit('setUser', userObj);
              resolve(userObj);
            });
          }, (error) => {
            localStorage.removeItem('at');
            commit('setUser', userObj);
            console.warn(`Authentication failed for existing token: ${error}`);
            reject();
          });
        } else {
          commit('setUser', userObj);
          reject();
        }
      });
    },
    logoutUser({ commit }) {
      const userObj = User.getUserObject();
      localStorage.removeItem('at');
      localStorage.removeItem('lastPath');
      commit('setUser', userObj);
    },
    setValidation({ commit }, payload) {
      commit('setValidation', payload);
    },
    flushChangeHistory({ commit }) {
      commit('flushChangeHistory');
    },
    undoInspectorChange({ commit, state }) {
      const history = state.inspector.changeHistory;
      const lastNode = history[history.length - 1];

      const payload = { addToHistory: false, changeList: [] };
      each(lastNode, (node) => {
        if (typeof node.value !== 'undefined') {
          // It had a value
          payload.changeList.push({
            path: node.path,
            value: node.value,
          });
        } else {
          // It did not have a value (ie key did not exist)
          const pathParts = node.path.split('.');
          const key = pathParts[pathParts.length - 1];
          pathParts.splice(pathParts.length - 1, 1);
          const path = pathParts.join('.');
          const data = cloneDeep(get(state.inspector.data, path));
          delete data[key];
          payload.changeList.push({
            path: path,
            value: data,
          });
        }
      });
      history.splice(history.length - 1, 1);
      commit('updateInspectorData', payload);
    },
    pushLoadingIndicator({ commit, state }, indicatorString) {
      const loaders = state.status.loadingIndicators;
      loaders.push(indicatorString);
      commit('setStatusValue', {
        property: 'loadingIndicators',
        value: loaders,
      });
    },
    removeLoadingIndicator({ commit, state }, indicatorString) {
      const loaders = state.status.loadingIndicators;
      for (let i = 0; i < loaders.length; i++) {
        if (loaders[i] === indicatorString) {
          loaders.splice(i, 1);
          break;
        }
      }
      commit('setStatusValue', {
        property: 'loadingIndicators',
        value: loaders,
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
    pushKeyAction({ commit }, keyAction) {
      commit('pushKeyAction', keyAction);
    },
    pushInspectorEvent({ commit }, payload) {
      commit('pushInspectorEvent', payload);
    },
    setUserStorage({ commit }, data) {
      commit('setUserStorage', data);
    },
    setUser({ commit }, userObj) {
      commit('setUser', userObj);
    },
    setSettings({ commit }, settingsObj) {
      commit('setSettings', settingsObj);
    },
    setOriginalData({ commit }, data) {
      commit('setOriginalData', data);
    },
    setInspectorData({ commit }, data) {
      commit('setInspectorData', data);
    },
    setInsertData({ commit }, data) {
      commit('setInsertData', data);
    },
    setCompositeHistoryData({ commit }, data) {
      commit('setCompositeHistoryData', data);
    },
    addToLanguageCache({ commit }, data) {
      commit('addToLanguageCache', data);
    },
    updateInspectorData({ commit }, payload) {
      commit('updateInspectorData', payload);
    },
    addToQuoted({ commit }, data) {
      commit('addToQuoted', data);
    },
    setInspectorStatusValue({ commit }, payload) {
      commit('setInspectorStatusValue', payload);
    },
    setStatusValue({ commit }, payload) {
      commit('setStatusValue', payload);
    },
    setInspectorTitle({ commit }, str) {
      commit('setInspectorTitle', str);
    },
    removeNotification({ commit }, index) {
      commit('removeNotification', index);
    },
    pushNotification({ commit }, content) {
      commit('pushNotification', content);
    },
    changeResourcesStatus({ commit }, status) {
      commit('changeResourcesStatus', status);
    },
    changeResourcesLoadingError({ commit }, bool) {
      commit('changeResourcesLoadingError', bool);
    },
    setContext({ commit }, contextJson) {
      commit('setContext', contextJson);
    },
    setDisplay({ commit }, displayJson) {
      commit('setDisplay', displayJson);
    },
    setDirectoryCare({ commit }, obj) {
      commit('setDirectoryCare', obj);
    },
    setTemplates({ commit }, data) {
      const templates = {
        base: data.base,
        combined: {},
      };
      const combinedBaseTypes = Object.keys(data.combined);
      for (let i = 0; i < combinedBaseTypes.length; i++) {
        templates.combined[combinedBaseTypes[i]] = filter(data.combined[combinedBaseTypes[i]], (o) => {
          if (o.hasOwnProperty('status') && o.status === 'draft') {
            return false;
          }
          return true;
        });
      }
      commit('setTemplates', templates);
    },
    setTranslations({ commit }, data) {
      commit('setTranslations', data);
    },
    setResource({ commit }, payload) {
      commit('setResource', payload);
    },
    setHelpDocs({ commit }, helpDocsJson) {
      commit('setHelpDocs', helpDocsJson);
    },
    setupVocab({ dispatch }, vocabJson) {
      dispatch('setVocab', vocabJson);
      dispatch('setVocabClasses', vocabJson);
      dispatch('setVocabProperties', vocabJson);
    },
    setVocab({ commit }, vocabJson) {
      const vocabMap = new Map(vocabJson.map(entry => [entry['@id'], entry]));
      commit('setVocab', vocabMap);
    },
    setVocabClasses({ commit, state }, vocabJson) {
      const classTerms = [].concat(
        VocabUtil.getTermByType('Class', vocabJson, state.resources.context, state.settings),
        VocabUtil.getTermByType('marc:CollectionClass', vocabJson, state.resources.context, state.settings),
      );
      const classes = new Map(classTerms.map(entry => [entry['@id'], entry]));
      classes.forEach((classObj) => {
        if (classObj.hasOwnProperty('subClassOf')) {
          each(classObj.subClassOf, (baseClass) => {
            const baseClassObj = classes.get(baseClass['@id']);
            if (typeof baseClassObj !== 'undefined') {
              if (baseClassObj.hasOwnProperty('baseClassOf')) {
                baseClassObj.baseClassOf.push(StringUtil.convertToPrefix(classObj['@id'], state.resources.context));
              } else {
                baseClassObj.baseClassOf = [StringUtil.convertToPrefix(classObj['@id'], state.resources.context)];
              }
            }
          });
        }
      });
      commit('setVocabClasses', classes);
    },
    setVocabProperties({ commit, state }, vocabJson) {
      let props = [];
      props = props.concat(VocabUtil.getTermByType('Property', vocabJson, state.resources.context, state.settings));
      props = props.concat(VocabUtil.getTermByType('DatatypeProperty', vocabJson, state.resources.context, state.settings));
      props = props.concat(VocabUtil.getTermByType('ObjectProperty', vocabJson, state.resources.context, state.settings));
      props = props.concat(VocabUtil.getTermByType('owl:SymmetricProperty', vocabJson, state.resources.context, state.settings));
      const vocabProperties = new Map(props.map(entry => [entry['@id'], entry]));

      commit('setVocabProperties', vocabProperties);
    },
  },
});

store.subscribe((mutation, state) => {
  if (mutation.type === 'setUserStorage') {
    let userStorageTotal = JSON.parse(localStorage.getItem('userStorage'));
    if (userStorageTotal === null) {
      userStorageTotal = {};
    }
    userStorageTotal[state.user.idHash] = mutation.payload;
    delete userStorageTotal[state.user.emailHash];
    localStorage.setItem('userStorage', JSON.stringify(userStorageTotal));
  }
});
/* eslint-enable no-param-reassign */

export default store;
