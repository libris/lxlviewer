import { createStore } from 'vuex';
import { cloneDeep, each, set, get, assign, filter, isObject } from 'lodash-es';
import ClientOAuth2 from 'client-oauth2';
import * as VocabUtil from 'lxljs/vocab';
import * as StringUtil from 'lxljs/string';
import * as httpUtil from '@/utils/http';
import * as User from '@/models/user';
import settings from './settings';

const EXTRACT_ON_SAVE = '__EXTRACT_ON_SAVE__';
export const DELETE_ON_SAVE = '__DELETE_ON_SAVE__';

const store = createStore({
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
      bulkChange: {
        initData: null
      },
      mergeSourceId: null,
      mergeTargetId: null
    },
    enrichment: {
      data: {
        source: null,
        target: null,
        result: null,
        changes: null
      },
    },
    inspector: {
      data: {},
      insertData: {},
      originalData: {},
      compositeHistoryData: {},
      languageCache: {},
      langTagSearch: '',
      supportedTags: {
        data: [],
        promises: [],
      },
      title: '',
      status: {
        detailedEnrichmentModal: {
          open: false,
        },
        mergeViewModal: {
          open: false,
        },
        enrichFromSelection: {
          open: false,
        },
        sideBySide: false,
        saving: false,
        opening: false,
        lastAdded: '',
        editing: false,
        focus: 'mainEntity',
        removing: false,
        updating: false,
        isNew: false,
        readyForSave: true,
        enriched: [],
        selected: []
      },
      validation: {
        numberOfViolations: 0,
        violations: {},
      },
      backendValidation: {
        numberOfErrors: 0,
        errors: {},
      },
      clipboard: null,
      changeHistory: [],
      event: [],
      magicShelfMarks: [],
      otherRecordsToDeleteOnSave: [],
      extractItemsOnSave: [],
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
          const { [payload.path]: _deletedPath, ...restValidations } = state.inspector.validation.violations;
          state.inspector.validation.violations = restValidations;
        }
      } else {
        state.inspector.validation.violations[payload.path] = payload.reasons;
      }
      state.inspector.validation.numberOfViolations = Object.keys(state.inspector.validation.violations).length;
    },
    setBackendValidationErrors(state, errors) {
      state.inspector.backendValidation.errors = {};
      // TODO handle multiple errors at same path?
      for (const error of errors) {
        const pathStr = StringUtil.arrayPathToString(error.path);
        state.inspector.backendValidation.errors[pathStr] = error;
      }
      state.inspector.backendValidation.numberOfErrors = errors.length;
    },
    pushKeyAction(state, keyAction) {
      state.status.keyActions = [...state.status.keyActions, keyAction];
    },
    pushInspectorEvent(state, payload) {
      state.inspector.event = payload;
    },
    pushNotification(state, content) {
      const date = new Date();
      state.status.notifications = [
        ...state.status.notifications,
        {
          ...content,
          id: StringUtil.getHash(`${date.getSeconds()}${date.getMilliseconds()}`),
        },
      ];
    },
    removeNotification(state, id) {
      state.status.notifications = state.status.notifications.filter(((notification) => notification.id !== id));
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
    setBulkChangeInitData(state, data) {
      state.directoryCare.bulkChange.initData = data;
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
    saveLangTagSearch(state, data) {
      state.inspector.langTagSearch = data;
    },
    addToQuoted(state, data) {
      const quoted = state.inspector.data.quoted ? cloneDeep(state.inspector.data.quoted) : {};

      const things = Array.isArray(data) ? data : [data];
      things.forEach(thing => {
        quoted[thing['@id']] = thing;
        (thing.sameAs || []).forEach((sameAs) => {
          if (sameAs.hasOwnProperty('@id')) {
            quoted[sameAs['@id']] = thing;
          }
        });
      })

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
          if (node.path === DELETE_ON_SAVE) {
            state.inspector.otherRecordsToDeleteOnSave.push({ id: node.id, type: node.type });
            changes.push(node);
            return;
          }

          let oldValue;
          if (node.path === '') {
            oldValue = inspectorData;
          } else {
            oldValue = cloneDeep(get(inspectorData, node.path));
          }
          const historyNode = { path: node.path, value: oldValue };
          changes.push(historyNode);
        });
        state.inspector.changeHistory = [
          ...state.inspector.changeHistory,
          changes,
        ];
      }
      // Set the new values
      each(payload.changeList, (node) => {
        if (node.path === '') {
          inspectorData = node.value;
        } else {
          set(inspectorData, node.path, node.value);
        }
      });
      // Check if we should remove work node (if it went from local to being linked)
      if (inspectorData.mainEntity && inspectorData.mainEntity.hasOwnProperty('instanceOf') && (inspectorData.mainEntity.instanceOf === null || (inspectorData.mainEntity.instanceOf.hasOwnProperty('@id') && inspectorData.mainEntity.instanceOf['@id'].indexOf('#work') === -1))) {
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
      if (data !== null) {
        state.inspector.data.quoted = assign(data.quoted, state.inspector.data.quoted);
      }
      state.enrichment.data.source = data;
    },
    setEnrichmentResult(state, data) {
      state.enrichment.data.result = data;
    },
    setEnrichmentChanges(state, data) {
      state.enrichment.data.changes = data;
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
      state.inspector.otherRecordsToDeleteOnSave = [];
    },
    setChangeHistory(state, data) {
      state.inspector.changeHistory = data;
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
      state.inspector.magicShelfMarks = [...state.inspector.magicShelfMarks, path];
    },
    removeMagicShelfMark(state, path) {
      state.inspector.magicShelfMarks = state.inspector.magicShelfMarks.filter((p) => p !== path);
    },
    addTagAsSupported(state, tag) {
      state.inspector.supportedTags.promises[tag] = undefined;
      if (!state.inspector.supportedTags.data.includes(tag)) {
        state.inspector.supportedTags.data = [...state.inspector.supportedTags.data, tag];
      }
    },
    setLanguageTagPromise(state, payload) {
      state.inspector.supportedTags.promises[payload.tag] = payload.promise;
    },
    setExtractItemsOnSave(state, data) {
      state.inspector.extractItemsOnSave = data;
    },
    addExtractItemOnSave(state, path) {
      state.inspector.extractItemsOnSave = [
        ...new Set([...state.inspector.extractItemsOnSave, path]),
      ];
    },
    removeExtractItemOnSave(state, path) {
      state.inspector.extractItemsOnSave = state.inspector.extractItemsOnSave.filter((key) => key !== path);
    },
  },
  getters: {
    inspector: (state) => state.inspector,
    resources: (state) => state.resources,
    resourcesLoaded: (state) => state.resources.resourcesLoaded,
    resourcesLoadingError: (state) => state.resources.loadingError,
    templates: (state) => state.resources.templates,
    settings: (state) => state.settings,
    oauth2Client: (state) => state.oauth2Client,
    user: (state) => state.user,
    userStorage: (state) => state.userStorage,
    enrichment: (state) => state.enrichment,
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
    userChangeCategories: (state) => {
      if (state.userDatabase == null || state.userDatabase.notificationCategories == null) {
        return [];
      }
      return state.userDatabase.notificationCategories.map(c => c['@id']);
    },
    userChangeCollections: (state) => {
      if (state.userDatabase == null || state.userDatabase.notificationCollections == null) {
        return [];
      }
      return state.userDatabase.notificationCollections.map(c => c['@id']);
    },
    userDatabase: (state) => state.userDatabase,
    status: (state) => state.status,
    directoryCare: (state) => state.directoryCare,
    vocab: (state) => state.resources.vocab,
    display: (state) => state.resources.display,
    context: (state) => state.resources.context,
    supportedTags: (state) => state.inspector.supportedTags.data,
  },
  actions: {
    addExtractItemOnSave({ commit, dispatch, state }, { path, item }) {
      commit('addExtractItemOnSave', path);

      if (!item.hasOwnProperty('hasTitle') && state.inspector.data.mainEntity.hasOwnProperty('hasTitle')) {
        /**
         * Add formatted/refined title from mainEntity if title is missing on item to be extracted
         */
        const mainEntityHasTitle = state.inspector.data.mainEntity.hasTitle.find((titleItem) => titleItem['@type'] === 'Title');

        const extractedTitleParts = mainEntityHasTitle?.hasPart?.length === 1 ? [
          ...mainEntityHasTitle.hasPart[0].partNumber || '',
          ...mainEntityHasTitle.hasPart[0].partName || '',
        ].join(', ') : '';

        const extractedMainTitle = extractedTitleParts
          ? `${mainEntityHasTitle.mainTitle.replace(/\.$/, '')}. ${extractedTitleParts}`.trim()
          : mainEntityHasTitle.mainTitle;

        const extractedHasTitle = [{
          '@type': 'Title',
          mainTitle: extractedMainTitle,
          'marc:nonfilingChars': mainEntityHasTitle['marc:nonfilingChars'] || undefined,
        }];

        commit('updateInspectorData', {
          changeList: [
            {
              path: `${path}.${EXTRACT_ON_SAVE}`,
              value: undefined,
            },
            {
              path: `${path}.hasTitle`,
              value: extractedHasTitle,
            },
          ],
          addToHistory: true,
        });

        dispatch('pushNotification', {
          type: 'success',
          message: `${StringUtil.getUiPhraseByLang(
            'Link was created and title was copied from instance',
            state.settings.language,
            state.resources.i18n,
          )}.`,
        });
      } else {
        dispatch('pushNotification', { type: 'success',
          message: `${StringUtil.getUiPhraseByLang(
            'Link was created',
            state.settings.language,
            state.resources.i18n,
          )}.` });
      }
    },
    removeExtractItemOnSave({ commit, state }, { path }) {
      // Remove references to extraction in change history
      const newChangeHistroy = state.inspector.changeHistory.reduce((acc, currentChangeHistoryItem) => {
        return [
          ...acc,
          currentChangeHistoryItem.filter((change) => change.path !== `${path}.${EXTRACT_ON_SAVE}`),
        ];
      }, []);

      commit('setChangeHistory', newChangeHistroy);
      commit('removeExtractItemOnSave', path);
    },
    flushExtractItemsOnSave({ commit }) {
      commit('setExtractItemsOnSave', []);
    },
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
    setNotificationEmail({ dispatch, state }, { userEmail }) {
      const notificationEmail = cloneDeep(state.userDatabase.notificationEmail);
      if (userEmail !== notificationEmail) {
        dispatch('modifyUserDatabase', { property: 'notificationEmail', value: userEmail });
      }
    },
    updateSubscribedSigel({ dispatch, state }, { libraryId, checked }) {
      let collections = cloneDeep(state.userDatabase.notificationCollections) || [];
      collections = collections.filter(c => c['@id'] !== libraryId);
      if (checked) {
        collections.push({'@id': libraryId});
      }
      dispatch('modifyUserDatabase', { property: 'notificationCollections', value: collections });
    },
    updateSubscribedChangeCategory({ dispatch, state }, { categoryId, checked }) {
      let categories = cloneDeep(state.userDatabase.notificationCategories) || [];
      categories = categories.filter(c => c['@id'] !== categoryId);
      if (checked) {
        categories.push({'@id': categoryId});
      }
      dispatch('modifyUserDatabase', { property: 'notificationCategories', value: categories });
    },
    purgeChangeCategories({ dispatch }) {
      dispatch('modifyUserDatabase', { property: 'notificationCategories', value: [] });
      dispatch('modifyUserDatabase', { property: 'notificationCollections', value: [] });
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
          dispatch('setNotificationEmail', { userEmail: state.user.email });
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
    setEnrichmentChanges({ commit }, data) {
      commit('setEnrichmentChanges', data);
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
          }).then((response) => response.json()).then((result) => {
            if (!result.user) {
              throw new Error(result.message);
            }
            userObj = User.getUserObject(result.user);
            userObj.token = token;
            userObj.token_expires_at = result.expires_at;
            userObj.loadUserData(state.settings.apiPath).then(() => {
              commit('setUser', userObj);
              resolve(userObj);
            });
          }, (error) => {
            throw new Error(error);
          }).catch((error) => {
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
    setBackendValidationErrors({ commit }, errors) {
      commit('setBackendValidationErrors', errors);
    },
    flushChangeHistory({ commit }) {
      commit('flushChangeHistory');
    },
    undoInspectorChange({ dispatch, commit, state }) {
      const lastChange = state.inspector.changeHistory[state.inspector.changeHistory.length - 1];

      const undoChanges = lastChange.reduce((acc, node) => {
        if (node.path.includes(EXTRACT_ON_SAVE)) {
          dispatch('removeExtractItemOnSave', { path: node.path.replace(`.${EXTRACT_ON_SAVE}`, '') });
        }

        if (node.path === DELETE_ON_SAVE) {
          state.inspector.otherRecordsToDeleteOnSave = state.inspector.otherRecordsToDeleteOnSave
            .filter((i) => i.id !== node.id);
          return acc;
        }

        // It had a value
        if (typeof node.value !== 'undefined') {
          return [...acc, node];
        }

        // It did not have a value (ie key did not exist)
        const pathArray = node.path.split('.')
        const key = pathArray[pathArray.length - 1];
        const parentPath = pathArray.slice(0, -1);
        const parentData = cloneDeep(get(state.inspector.data, parentPath));

        if (parentData) {
          const { [key]: _removedData, ...restData } = parentData;

          return [
            ...acc, {
              path: parentPath,
              value: restData,
            }
          ]
        }

        return acc;
      }, []);

      commit("updateInspectorData", {
        addToHistory: false,
        changeList: undoChanges
      });

      commit('setChangeHistory', state.inspector.changeHistory.slice(0, -1));
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
    setBulkChangeInitData({ commit }, data) {
      commit('setBulkChangeInitData', data);
    },
    setCompositeHistoryData({ commit }, data) {
      commit('setCompositeHistoryData', data);
    },
    updateInspectorData({ commit }, payload) {
      commit('updateInspectorData', payload);
    },
    addToLanguageCache({ commit }, data) {
      commit('addToLanguageCache', data);
    },
    saveLangTagSearch({ commit }, data) {
      commit('saveLangTagSearch', data);
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
      const vocabMap = new Map(vocabJson.map((entry) => [entry['@id'], entry]));
      commit('setVocab', vocabMap);
    },
    setVocabClasses({ commit, state }, vocabJson) {
      const classTerms = [].concat(
        VocabUtil.getTermByType('Class', vocabJson, state.resources.context, state.settings),
        VocabUtil.getTermByType('marc:CollectionClass', vocabJson, state.resources.context, state.settings),
      );
      const classes = new Map(classTerms.map((entry) => [entry['@id'], entry]));
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
      const vocabProperties = new Map(props.map((entry) => [entry['@id'], entry]));

      commit('setVocabProperties', vocabProperties);
    },
    async getIsTagRomanizable({ commit, state }, tag) {
      if (tag == null || tag === '') {
        return false;
      }

      if (state.inspector.supportedTags.promises[tag]) {
        return state.inspector.supportedTags.promises[tag];
      }

      const promise = httpUtil.get({
        url: `${state.settings.apiPath}/_transliterate/language/${tag}`,
        token: state.user.token,
      }).then((response) => {
        if (response != null && response.status > 200) {
          commit('addTagAsSupported', tag);
        }
      });

      commit('setLanguageTagPromise', {
        promise,
        tag,
      });

      return promise;
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
