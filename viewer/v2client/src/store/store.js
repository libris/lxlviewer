import Vue from 'vue';
import Vuex from 'vuex';
Vue.use(Vuex);
import * as _ from 'lodash';
import * as VocabUtil from '@/utils/vocab';
import * as StringUtil from '@/utils/string';
import * as User from '@/models/user';
import { navigateChangeHistory } from '../../../client/static/js/es6/vuex/actions.es6';

function getEnvironment() {
  switch(window.location.host.split('.')[0]) {
    case 'libris-dev':
      return 'dev';
    case 'localhost:8080':
      return 'local'
    case 'libris-qa':
      return 'qa';
    case 'libris-stg':
      return 'stg';
    default:
      return ''
  }
}

const store = new Vuex.Store({
  state: {
    resources: {
      resourcesLoaded: false,
      loadingError: false,
      vocab: {},
      display: {},
      context: {},
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
        editing: false,
        focus: 'mainEntity',
        removing: false,
        updating: false,
        isNew: false,
      },
      changeHistory: [],
      event: [],
    },
    status: {
      keybindState: '',
      keyActions: [],
      resultList: {
        loading: false
      },
      notifications: [],
      helpSection: 'none',
      remoteDatabases: [],
    },
    user: {
      settings: {
        language: 'sv'
      }
    },
    settings: {
      title: 'Libris Katalogisering',
      language: 'sv',
      environment: getEnvironment(),
      version: process.env.VERSION,
      apiPath: process.env.API_PATH,
      authPath: process.env.AUTH_PATH,
      idPath: process.env.ID_PATH,
      piwikID: process.env.PIWIK_ID,
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
        'Identity',
      ],
      removableBaseUris: [
        'http://libris.kb.se/',
        'https://libris.kb.se/',
        'http://id.kb.se/vocab/',
        'https://id.kb.se/vocab/',
        'http://id.kb.se/',
        'https://id.kb.se/',
      ],
      hiddenProperties: [
        '@id',
        '@type',
        'created',
        'modified',
        'mainEntity'
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
        'descriptionCreator'
      ],
      dataSetFilters: {
        libris: [
          'https://id.kb.se/vocab/Instance',
          'https://id.kb.se/vocab/Work',
          'https://id.kb.se/vocab/Agent',
          'https://id.kb.se/vocab/Concept',
        ],
      },
      propertyChains: {
        '@type': {
          sv: 'Typ',
          en: 'Type',
        },
        'carrierType': {
          sv: 'Bärartyp',
          en: 'Carrier type',
        },
        'issuanceType': {
          sv: 'Utgivningssätt',
          en: 'Issuance type',
        },
        'instanceOf.@type': {
          sv: 'Verkstyp',
          en: 'Type of work',
        },
        'instanceOf.contentType': {
          sv: 'Verksinnehållstyp',
          en: 'Content type of work',
        },
        'instanceOf.language': {
          sv: 'Verksspråk',
          en: 'Language of work',
        },
        'publication.date': {
          sv: 'Utgivningsdatum',
          en: 'Publication date',
        },
      },
      availableUserSettings: {
        languages: [
          {
            'label': 'Swedish',
            'value': 'sv',
          },
          {
            'label': 'English (experimental)',
            'value': 'en',
          },
        ],
        appTechs: [
          {
            'label': 'On',
            'value': 'on',
          },
          {
            'label': 'Off',
            'value': 'off',
          },
        ],
      }
    }
  },
  mutations: {
    pushKeyAction(state, keyAction) {
      state.status.keyActions.push(keyAction);
    },
    pushInspectorEvent(state, payload) {
      state.inspector.event = payload;
    },
    pushNotification(state, content) {
      const date = new Date();
      content['id'] = StringUtil.getHash(`${date.getSeconds()}${date.getMilliseconds()}`);
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
      const quoted = _.cloneDeep(state.inspector.data.quoted);
      quoted[data['@id']] = data;
      state.inspector.data.quoted = quoted;
    },
    updateInspectorData(state, payload) {
      state.inspector.status.updating = true;
      // Clone inspectorData so we can manipulate it before setting it
      const inspectorData = _.cloneDeep(state.inspector.data);
      // Push old value to history
      if (payload.addToHistory) {
        const changes = [];
        _.each(payload.changeList, (node) => {
          const oldValue = _.cloneDeep(_.get(inspectorData, node.path));
          const historyNode = { path: node.path, value: oldValue };
          changes.push(historyNode);
        });
        state.inspector.changeHistory.push(changes);
      }

      // Set the new values
      _.each(payload.changeList, (node) => {
        console.log("DATA_UPDATE:", JSON.stringify(node));
        _.set(inspectorData, node.path, node.value);
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
  },
  getters: {
    inspector: state => {
      return state.inspector;
    },
    resources: state => {
      return state.resources;
    },
    settings: state => {
      return state.settings;
    },
    user: state => {
      return state.user;
    },
    status: state => {
      return state.status;
    },
    vocab: state => {
      return state.resources.vocab;
    },
    display: state => {
      return state.resources.display;
    },
    forcedSetTerms: state => {
      return state.resources.forcedSetTerms;
    },
    context: state => {
      return state.resources.context;
    }
  },
  actions: {
    flushChangeHistory({commit}) {
      commit('flushChangeHistory');
    },
    undoInspectorChange({ commit, state }) {
      const history = state.inspector.changeHistory;
      const lastNode = history[history.length-1];

      let payload = { addToHistory: false, changeList: [] };
      _.each(lastNode, (node) => {
        if (typeof node.value !== 'undefined') {
          // It had a value
          payload.changeList.push({
            path: node.path,
            value: node.value,
          });
        } else {
          // It did not have a value (ie key did not exist)
          const pathParts = node.path.split('.');
          const key = pathParts[pathParts.length-1];
          pathParts.splice(pathParts.length-1, 1);
          const path = pathParts.join('.');
          const data = _.cloneDeep(_.get(state.inspector.data, path));
          delete data[key];
          payload.changeList.push({
            path: path,
            value: data,
          });
        }
      });
      history.splice(history.length-1, 1);
      commit('updateInspectorData', payload);
    },
    pushKeyAction({ commit }, keyAction) {
      commit('pushKeyAction', keyAction);
    },
    pushInspectorEvent({ commit }, payload) {
      commit('pushInspectorEvent', payload);
    },
    setUser({ commit }, userObj) {
      commit('setUser', userObj);
    },
    logoutUser({ commit }) {
      commit('logoutUser');
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
    pushNotification( { commit }, content ) {
      commit('pushNotification', content);
    },
    changeResourcesStatus( { commit }, status ) {
      commit('changeResourcesStatus', status);
    },
    changeResourcesLoadingError( { commit }, bool) {
      commit('changeResourcesLoadingError', bool);
    },
    setContext( { commit }, contextJson) {
      commit('setContext', contextJson);
    },
    setDisplay( { commit }, displayJson) {
      commit('setDisplay', displayJson);
    },
    setForcedListTerms( { commit }, forcedSetTermsJson) {
      commit('setForcedListTerms', forcedSetTermsJson);
    },
    setupVocab( { dispatch }, vocabJson) {
      dispatch('setVocab', vocabJson)
      dispatch('setVocabClasses', vocabJson)
      dispatch('setVocabProperties', vocabJson)
    },
    setVocab({ commit }, vocabJson) {
      const vocabMap = new Map(vocabJson.map((entry) => [entry['@id'], entry]));
      commit('setVocab', vocabMap)
    },
    setVocabClasses({ commit, state }, vocabJson) {
      let classTerms = [].concat(
            VocabUtil.getTermByType('Class', vocabJson, state.resources.context),
            VocabUtil.getTermByType('marc:CollectionClass', vocabJson, state.resources.context)
          );
      const classes = new Map(classTerms.map(entry => [entry['@id'], entry]));
      classes.forEach(classObj => {
        if (classObj.hasOwnProperty('subClassOf')) {
          _.each(classObj.subClassOf, baseClass => {
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
      commit('setVocabClasses', classes)
    },
    setVocabProperties({ commit, state }, vocabJson) {
      let props = [];
      props = props.concat(VocabUtil.getTermByType('Property', vocabJson, state.resources.context));
      props = props.concat(VocabUtil.getTermByType('DatatypeProperty', vocabJson, state.resources.context));
      props = props.concat(VocabUtil.getTermByType('ObjectProperty', vocabJson, state.resources.context));
      props = props.concat(VocabUtil.getTermByType('owl:SymmetricProperty', vocabJson, state.resources.context));
      const vocabProperties = new Map(props.map((entry) => [entry['@id'], entry]));

      commit('setVocabProperties', vocabProperties)
    },
  }
})

export default store;