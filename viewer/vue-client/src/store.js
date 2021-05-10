import Vue from 'vue';
import Vuex from 'vuex';
import { cloneDeep, each, set, get, assign, filter } from 'lodash-es';
import ClientOAuth2 from 'client-oauth2';
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
      templates: {},
      helpDocs: null,
      globalMessages: null,
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
    userStorage: {
      list: {},
      copyClipboard: null,
      dismissedMessages: [],
    },
    settings: {
      title: 'Libris katalogisering',
      language: 'sv',
      debounceTimer: 500, // Wait this long for input to stop before reacting
      environment: process.env.VUE_APP_ENV_LABEL || 'local',
      version: process.env.VUE_APP_VERSION,
      gitDescribe: JSON.parse(process.env.VUE_APP_GIT_DESCRIBE),
      dataPath: process.env.VUE_APP_DATA_PATH || process.env.VUE_APP_API_PATH,
      apiPath: process.env.VUE_APP_API_PATH,
      verifyPath: process.env.VUE_APP_VERIFY_PATH,
      idPath: process.env.VUE_APP_ID_PATH,
      authPath: process.env.VUE_APP_AUTHORIZE_PATH,
      redirectPath: process.env.VUE_APP_REDIRECT_PATH,
      clientId: process.env.VUE_APP_CLIENT_ID,
      scopes: process.env.VUE_APP_SCOPES,
      mockDisplay: Boolean(process.env.VUE_APP_MOCK_DISPLAY_BOOL) || false,
      mockHelp: Boolean(process.env.VUE_APP_MOCK_HELP_BOOL) || false,
      matomoId: process.env.VUE_APP_MATOMO_ID,
      appPaths: {
        '/find?': '/search/libris?',
      },
      embeddedTypes: [
        'StructuredValue',
        'QualifiedRole',
      ],
      extractableTypes: [
        'Item',
        'Instance',
        // 'Agent',
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
        'generationDate',
        'generationProcess',
        'recordStatus',
      ],
      defaultExpandedProperties: [
        'hasComponent',
        '@reverse/reproductionOf',
        '@reverse/supplementTo',
      ],
      dataSetFilters: {
        libris: [
          {
            value: 'Instance',
            label: 'Instance',
          },
          {
            value: 'Work',
            label: 'Work',
          },
          {
            value: 'Agent',
            label: 'Agent',
          },
          {
            value: 'Concept',
            label: 'Concept',
          },
          {
            value: '*',
            label: 'All',
          },
        ],
      },
      warnOnSave: {
        'record.encodingLevel': ['marc:PrepublicationLevel', 'marc:PartialPreliminaryLevel'],
      },
      propertyChains: {
        '@reverse.itemOf.heldBy.@id': {
          sv: 'Har bestånd',
          en: 'Has holding',
          facet: {
            order: -1,
          },
        },
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
        'meta.encodingLevel': {
          sv: 'Beskrivningsnivå',
          en: 'Encoding level',
          facet: {
            order: 2,
          },
        },
        'publication.year': {
          sv: 'Utgivningsår',
          en: 'Publication year',
          facet: {
            order: 3,
          },
        },
        'instanceOf.language.@id': {
          sv: 'Verksspråk',
          en: 'Language of work',
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
        'inScheme.@id': {
          sv: 'Termsystem',
          en: 'Term System',
          facet: {
            order: 6,
          },
        },
        'inCollection.@id': {
          sv: 'Termsamling',
          en: 'Term Collection',
          facet: {
            order: 7,
          },
        },
        'nationality.@id': {
          sv: 'Nationalitet',
          en: 'Nationality',
          facet: {
            order: 7,
          },
        },
        'language.@id': {
          sv: 'Språk',
          en: 'Language',
          facet: {
            order: 6,
          },
        },
        'genreForm.@id': {
          sv: 'Genre/form',
          en: 'Genre/form',
          facet: {
            order: 7,
          },
        },
        'contribution.agent.@id': {
          sv: 'Medverkan eller primär medverkan',
          en: 'Contribution or primary contribution',
          facet: {
            order: 7,
          },
        },
        'contentType.@id': {
          sv: 'Innehållstyp',
          en: 'Content type',
          facet: {
            order: 10,
          },
        },
        'carrierType.@id': {
          sv: 'Bärartyp',
          en: 'Carrier type',
          facet: {
            order: 10,
          },
        },
        'instanceOf.subject.@id': {
          sv: 'Ämne',
          en: 'Subject',
          facet: {
            order: 11,
          },
        },
        'meta.bibliography.@id': {
          sv: 'Ingår i bibliografi',
          en: 'In bibliography',
          facet: {
            order: 12,
          },
        },
        '@reverse': {
          sv: 'Relation',
          en: 'Relation',
          facet: {
            order: 0,
          },
        },
      },
      interestingFacets: {
        '@reverse': [
          'contribution.agent',
          'https://id.kb.se/vocab/subject',
        ],
      },
      sortOptions: {
        Instance: [
          {
            query: '',
            label: 'Relevance',
          },
          {
            query: '_sortKeyByLang',
            label: 'A-Z',
          },
          {
            query: '-_sortKeyByLang',
            label: 'Z-A',
          },
          {
            query: '-publication.year',
            label: 'Publication year (descending)',
          },
          {
            query: 'publication.year',
            label: 'Publication year (ascending)',
          },
          {
            query: '-meta.modified',
            label: 'Last updated',
          },
        ],
        Work: [
          {
            query: '',
            label: 'Relevance',
          },
          {
            query: '_sortKeyByLang',
            label: 'A-Z',
          },
          {
            query: '-_sortKeyByLang',
            label: 'Z-A',
          },
          {
            query: '-meta.modified',
            label: 'Last updated',
          },
          {
            query: '-reverseLinks.totalItems',
            label: 'Most linked',
          },
        ],
        Concept: [
          {
            query: '',
            label: 'Relevance',
          },
          {
            query: '_sortKeyByLang',
            label: 'A-Z',
          },
          {
            query: '-_sortKeyByLang',
            label: 'Z-A',
          },
          {
            query: '-meta.modified',
            label: 'Last updated',
          },
          {
            query: '-reverseLinks.totalItems',
            label: 'Most linked',
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
        Agent: [
          {
            query: '',
            label: 'Relevance',
          },
          {
            query: '_sortKeyByLang',
            label: 'A-Z',
          },
          {
            query: '-_sortKeyByLang',
            label: 'Z-A',
          },
          {
            query: '-meta.modified',
            label: 'Last updated',
          },
          {
            query: '-reverseLinks.totalItems',
            label: 'Most linked',
          },
        ],
        Common: [
          {
            query: '',
            label: 'Relevance',
          },
          {
            query: '_sortKeyByLang',
            label: 'A-Z',
          },
          {
            query: '-_sortKeyByLang',
            label: 'Z-A',
          },
          {
            query: '-meta.modified',
            label: 'Last updated',
          },
          {
            query: '-reverseLinks.totalItems',
            label: 'Most linked',
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
    oauth2Client: {},
  },
  mutations: {
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
    context: state => state.resources.context,
  },
  actions: {
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
    verifyUser({ commit, state }) {
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
              resolve();
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
    userStorageTotal[state.user.emailHash] = mutation.payload;
    localStorage.setItem('userStorage', JSON.stringify(userStorageTotal));
  }
});
/* eslint-enable no-param-reassign */

export default store;
