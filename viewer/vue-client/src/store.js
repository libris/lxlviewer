import Vue from 'vue';
import Vuex from 'vuex';
import { cloneDeep, each, set, get } from 'lodash-es';
import * as VocabUtil from '@/utils/vocab';
import * as StringUtil from '@/utils/string';
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
      helpDocs: null,
    },
    directoryCare: {
      sender: null,
      senderHoldings: [],
      reciever: null,
      recieverHoldings: [],
      selectedHoldings: [],
      holdingsMoved: [],
    },
    inspector: {
      data: {},
      insertData: {},
      originalData: {},
      title: '',
      status: {
        saving: false,
        opening: false,
        lastAdded: '',
        recentlyAdded: [],
        editing: false,
        focus: 'mainEntity',
        removing: false,
        updating: false,
        isNew: false,
      },
      validation: {
        numberOfViolations: 0,
        violations: {},
      },
      clipboard: null,
      changeHistory: [],
      event: [],
    },
    status: {
      panelOpen: false,
      keybindState: '',
      fullWidth: false,
      keyActions: [],
      resultList: {
        loading: false,
      },
      loadingIndicators: [],
      notifications: [],
      helpSection: 'none',
      remoteDatabases: [],
    },
    user: User.getUserObject(),
    userStorage: {
      list: {},
      copyClipboard: null,
    },
    settings: {
      title: 'Libris katalogisering',
      language: 'sv',
      environment: process.env.VUE_APP_ENV_LABEL || 'local',
      version: process.env.VUE_APP_VERSION,
      dataPath: process.env.VUE_APP_DATA_PATH || process.env.VUE_APP_API_PATH,
      apiPath: process.env.VUE_APP_API_PATH,
      authPath: process.env.VUE_APP_AUTH_PATH,
      idPath: process.env.VUE_APP_ID_PATH,
      matomoId: process.env.VUE_APP_MATOMO_ID,
      appPaths: {
        '/find?': '/search/libris?',
      },
      embeddedTypes: [
        'StructuredValue',
        'QualifiedRole',
      ],
      mainFields: {
        Instance: 'instanceOf',
        Work: 'expressionOf',
        Item: 'itemOf',
      },
      extractableTypes: [
        'Item',
        'Instance',
        // 'Agent', - Blocking this per request of MSS
        // 'Concept', - Blocking this per request of MSS
        'Work',
      ],
      keysToClear: {
        duplication: [
          'record.controlNumber',
          'record.descriptionUpgrader',
          'record.generationProcess',
          'record.generationDate',
          'record.identifiedBy',
          'record.sameAs',
          'mainEntity.sameAs',
          'work.sameAs',
        ],
        remoteImport: [
          'record.generationProcess',
          'record.generationDate',
          'record.sameAs',
          'mainEntity.sameAs',
          'work.sameAs',
        ],
      },
      removableBaseUris: [
        'http://libris.kb.se/',
        'https://libris.kb.se/',
        'http://id.kb.se/vocab/',
        'https://id.kb.se/vocab/',
        'http://id.kb.se/',
        'https://id.kb.se/',
      ],
      filteredCategories: [
        'pending',
        'shorthand',
        'unstable',
      ],
      hiddenProperties: [
        '@id',
        '@type',
        'created',
        'modified',
        'mainEntity',
      ],
      lockedProperties: [
        'sameAs',
        'controlNumber',
        'systemNumber',
        'heldBy',
        'itemOf',
        'mainEntity',
        'created',
        'modified',
        'descriptionCreator',
        'descriptionLastModifier',
      ],
      dataSetFilters: {
        libris: [
          'https://id.kb.se/vocab/Instance',
          'https://id.kb.se/vocab/Work',
          'https://id.kb.se/vocab/Agent',
          'https://id.kb.se/vocab/Concept',
        ],
      },
      warnOnSave: {
        'record.encodingLevel': ['marc:PrepublicationLevel', 'marc:PartialPreliminaryLevel'],
      },
      propertyChains: {
        'instanceOf.@type': {
          sv: 'Verkstyp',
          en: 'Type of work',
          facet: {
            order: 0,
          },
        },
        issuanceType: {
          sv: 'Utgivningssätt',
          en: 'Issuance type',
          facet: {
            order: 1,
          },
        },
        'publication.year': {
          sv: 'Utgivningsår',
          en: 'Publication year',
          facet: {
            order: 2,
          },
        },
        'instanceOf.language': {
          sv: 'Språk',
          en: 'Language of work',
          facet: {
            order: 3,
          },
        },
        'meta.encodingLevel': {
          sv: 'Beskrivningsnivå',
          en: 'Encoding level',
          facet: {
            order: 4,
          },
        },
        '@type': {
          sv: 'Typ',
          en: 'Type',
          facet: {
            order: 5,
          },
        },
        carrierType: {
          sv: 'Bärartyp',
          en: 'Carrier type',
          facet: {
            order: false,
          },
        },
        'instanceOf.contentType': {
          sv: 'Verksinnehållstyp',
          en: 'Content type of work',
          facet: {
            order: false,
          },
        },

      },
      sortOptions: {
        Instance: [
          { 
            query: '',
            label: 'Relevance', 
          },
          {
            query: 'hasTitle.mainTitle',
            label: 'Main title (A-Z)',
          },
          {
            query: '-hasTitle.mainTitle',
            label: 'Main title (Z-A)',
          },
          {
            query: '-publication.year',
            label: 'Publication year (descending)',
          },
          {
            query: 'publication.year',
            label: 'Publication year (ascending)',
          },
        ],
        Item: [
          { 
            query: '',
            label: 'Relevance', 
          },
          { 
            query: 'heldBy.@id',
            label: 'Sigel (A-Z)', 
          },
          { 
            query: '-heldBy.@id',
            label: 'Sigel (Z-A)', 
          },
        ],  
      },
      availableUserSettings: {
        languages: [
          {
            label: 'Swedish',
            value: 'sv',
          },
          {
            label: 'English (experimental)',
            value: 'en',
          },
        ],
        appTechs: [
          {
            label: 'On',
            value: 'on',
          },
          {
            label: 'Off',
            value: 'off',
          },
        ],
      },
    },
  },
  mutations: {
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
    pushRecentlyAdded(state, formPath) {
      const list = state.inspector.status.recentlyAdded;
      const index = list.indexOf(formPath);
      if (index === -1) {
        list.push(formPath);
      }
      state.inspector.status.recentlyAdded = list;
    },
    removeRecentlyAdded(state, formPath) {
      const list = state.inspector.status.recentlyAdded;
      const index = list.indexOf(formPath);
      if (index > -1) {
        list.splice(index, 1);
      }
      state.inspector.status.recentlyAdded = list;
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
      state.inspector.originalData = data;
    },
    setInspectorData(state, data) {
      state.inspector.data = data;
    },
    setInsertData(state, data) {
      state.inspector.insertData = data;
    },
    addToQuoted(state, data) {
      const quoted = cloneDeep(state.inspector.data.quoted);
      quoted[data['@id']] = data;
      state.inspector.data.quoted = quoted;
    },
    updateInspectorData(state, payload) {
      state.inspector.status.updating = true;
      // Clone inspectorData so we can manipulate it before setting it
      const inspectorData = cloneDeep(state.inspector.data);
      // Push old value to history
      if (payload.addToHistory) {
        const changes = [];
        each(payload.changeList, (node) => {
          const oldValue = cloneDeep(get(inspectorData, node.path));
          const historyNode = { path: node.path, value: oldValue };
          changes.push(historyNode);
        });
        state.inspector.changeHistory.push(changes);
      }

      // Set the new values
      each(payload.changeList, (node) => {
        // console.log("DATA_UPDATE:", JSON.stringify(node));
        set(inspectorData, node.path, node.value);
      });
      state.inspector.data = inspectorData;
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
    setInspectorStatusValue(state, payload) {
      if (state.inspector.status.hasOwnProperty(payload.property)) {
        state.inspector.status[payload.property] = payload.value;
      } else {
        throw new Error(`Trying to set unknown status property "${payload.property}" on inspector. Is it defined in the store?`);
      }
    },
    setUser(state, userObj) {
      state.user = userObj;
      state.user.saveSettings();
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
    setContext(state, data) {
      state.resources.context = data;
    },
    setForcedListTerms(state, data) {
      state.resources.forcedListTerms = data;
    },
    setDisplay(state, data) {
      state.resources.display = data;
    },
    setDirectoryCare(state, data) {
      state.directoryCare = data;
    },
  },
  getters: {
    inspector: state => state.inspector,
    resources: state => state.resources,
    resourcesLoaded: state => state.resources.resourcesLoaded,
    resourcesLoadingError: state => state.resources.loadingError,
    settings: state => state.settings,
    user: state => state.user,
    userStorage: state => state.userStorage,
    userFavorites: (state, getters) => {
      const collection = [];
      const list = getters.userStorage.list;
      const ids = Object.keys(list);
      for (let i = 0; i < ids.length; i++) {
        const listItem = list[ids[i]];
        if (listItem.hasOwnProperty('tags') && listItem.tags.indexOf('Favorite') > -1) {  
          collection.push({ [ids[i]]: [ids[i]].label });
        }
      }
      return collection;
    },
    userCare: (state, getters) => {
      const collection = [];
      const list = getters.userStorage.list;
      const ids = Object.keys(list);
      for (let i = 0; i < ids.length; i++) {
        const listItem = list[ids[i]];
        if (listItem.hasOwnProperty('tags') && listItem.tags.indexOf('Directory care') > -1) {
          collection.push({ '@id': ids[i], label: list[ids[i]].label });
        }
      }
      return collection;
    },
    status: state => state.status,
    directoryCare: state => state.directoryCare,
    vocab: state => state.resources.vocab,
    display: state => state.resources.display,
    forcedSetTerms: state => state.resources.forcedSetTerms,
    context: state => state.resources.context,
  },
  actions: {
    pushRecentlyAdded({ commit }, formPath) {
      console.log("Add:", formPath);
      commit('pushRecentlyAdded', formPath);
    },
    removeRecentlyAdded({ commit }, formPath) {
      console.log("Remove:", formPath);
      commit('removeRecentlyAdded', formPath);
    },
    mark({ commit, state }, payload) {
      const userStorage = cloneDeep(state.userStorage);
      const tag = payload.tag;
      const id = payload.documentId;
      const label = payload.documentTitle;
      if (userStorage.list.hasOwnProperty(id)) {
        if (userStorage.list[id].tags.indexOf(tag) < 0) {
          userStorage.list[id].tags.push(tag);
          userStorage.list[id].label = label;
        }
      } else {
        userStorage.list[id] = { tags: [tag], label };
      }
      commit('setUserStorage', userStorage);
    },
    unmark({ commit, state }, payload) {
      const userStorage = cloneDeep(state.userStorage);
      const tag = payload.tag;
      const id = payload.documentId;
      if (userStorage.list.hasOwnProperty(id)) {
        if (userStorage.list[id].tags.indexOf(tag) >= 0) {
          userStorage.list[id].tags.splice(userStorage.list[id].tags.indexOf(tag), 1);
          if (userStorage.list[id].tags.length === 0) {
            delete userStorage.list[id];
          }
        }
      }
      commit('setUserStorage', userStorage);
    },
    purgeUserTagged({ commit, state }) {
      const userStorage = cloneDeep(state.userStorage);
      userStorage.list = {};
      commit('setUserStorage', userStorage);
    },
    verifyUser({ commit, state }) {
      return new Promise((resolve, reject) => {
        if (state.user.isLoggedIn === true && state.user.hasTokenExpired() === false) {
          return resolve();
        }
        const token = localStorage.getItem('at');
        let userObj = User.getUserObject();
        if (token !== null) {
          const headers = new Headers();
          const url = state.settings.authPath;
          headers.append('Authorization', `Bearer ${token}`);
          fetch(url, {
            headers,
            method: 'GET',
          }).then(response => response.json()).then((result) => {
            userObj = User.getUserObject(result.user);
            userObj.token = token;
            userObj.token_expires_at = result.expires_at;
            commit('setUser', userObj);
            return resolve();
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
    logoutUser({ commit, state }) {
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
    setHelpDocs({ commit }, helpDocsJson) {
      commit('setHelpDocs', helpDocsJson);
    },
    setForcedListTerms({ commit }, forcedSetTermsJson) {
      commit('setForcedListTerms', forcedSetTermsJson);
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
    userStorageTotal[state.user.emailHash] = mutation.payload;
    localStorage.setItem('userStorage', JSON.stringify(userStorageTotal));
  }
});
/* eslint-enable no-param-reassign */

export default store;
