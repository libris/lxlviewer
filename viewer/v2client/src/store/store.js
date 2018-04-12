import Vue from 'vue';
import Vuex from 'vuex';
Vue.use(Vuex);
import * as _ from 'lodash';
import * as VocabUtil from '@/utils/vocab';
import * as StringUtil from '@/utils/string';
import * as User from '@/models/user';
import { navigateChangeHistory } from '../../../client/static/js/es6/vuex/actions.es6';

const store = new Vuex.Store({
  state: {
    resources: {
      resourcesLoaded: false,
      loadingError: false,
      vocab: {},
      display: {},
      forcedListTerms: {},
      context: {},
    },
    inspector: {
      data: {},
      insertData: {},
      title: '',
      status: {
        dirty: false,
        saving: false,
        opening: false,
        lastAdded: '',
        editing: false,
        focus: 'mainEntity',
        removing: false,
      },
      changeHistory: [],
    },
    status: {
      keybindState: '',
      keyActions: [],
      resultList: {
        loading: false
      },
      notifications: [],
      helpSection: 'none',
    },
    user: {
      settings: {
        language: 'sv'
      }
    },
    settings: {
      title: 'Libris Katalogisering',
      language: 'sv',
      vocabPfx: 'https://id.kb.se/vocab/',
      environment: process.env.NODE_ENV,
      version: process.env.VERSION,
      apiPath: process.env.API_PATH,
      authPath: process.env.AUTH_PATH,
      appPaths: {
        '/find?': '/search/libris/',
      },
      embeddedTypes: [
        'StructuredValue',
        'QualifiedRole',
      ],
      removableBaseUris: [
        'http://libris.kb.se/',
        'https://libris.kb.se/',
        'http://id.kb.se/vocab/',
        'https://id.kb.se/vocab/',
        'http://id.kb.se/',
        'https://id.kb.se/',
      ],
      specialProperties: [
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
        'technicalNote',
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
    setInspectorData(state, data) {
      state.inspector.data = data;
    },
    setInsertData(state, data) {
      state.inspector.insertData = data;
    },
    updateInspectorData(state, payload) {
      // Clone inspectorData so we can manipulate it before setting it
      const inspectorData = _.cloneDeep(state.inspector.data);
      
      // Push old value to history
      if (payload.addToHistory) {
        const oldValue = _.cloneDeep(_.get(inspectorData, payload.path));
        const historyNode = { path: payload.path, value: oldValue };
        console.log(JSON.stringify(historyNode));
        state.inspector.changeHistory.push(historyNode);
      }
      
      // Set the new value
      console.log("DATA_UPDATE:", payload);
      _.set(inspectorData, payload.path, payload.value);
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
    undoInspectorChange({ commit, state }) {
      const history = state.inspector.changeHistory;
      const lastNode = history[history.length-1];
      let payload = {};
      if (typeof lastNode.value !== 'undefined') {
        // It had a value
        payload = {
          path: lastNode.path,
          value: lastNode.value,
          addToHistory: false,
        }
      } else {
        // It did not have a value (ie key did not exist)
        const pathParts = lastNode.path.split('.');
        const key = pathParts[pathParts.length-1];
        pathParts.splice(pathParts.length-1, 1);
        const path = pathParts.join('.');
        const data = _.cloneDeep(_.get(state.inspector.data, path));
        delete data[key];
        payload = {
          path: path,
          value: data,
          addToHistory: false,
        }
      }
      history.splice(history.length-1, 1);
      commit('updateInspectorData', payload);
    },
    pushKeyAction({ commit }, keyAction) {
      commit('pushKeyAction', keyAction);
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
    setInspectorData({ commit }, data) {
      commit('setInspectorData', data);
    },
    setInsertData({ commit }, data) {
      commit('setInsertData', data);
    },
    updateInspectorData({ commit }, payload) {
      commit('updateInspectorData', payload);
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
      const classes = new Map(VocabUtil.getTermByType('Class', vocabJson).map(entry => [entry['@id'], entry]));
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
    setVocabProperties({ commit }, vocabJson) {
      let props = [];
      props = props.concat(VocabUtil.getTermByType('Property', vocabJson));
      props = props.concat(VocabUtil.getTermByType('DatatypeProperty', vocabJson));
      props = props.concat(VocabUtil.getTermByType('ObjectProperty', vocabJson));
      props = props.concat(VocabUtil.getTermByType('owl:SymmetricProperty', vocabJson));
      const vocabProperties = new Map(props.map((entry) => [entry['@id'], entry]));

      commit('setVocabProperties', vocabProperties)
    },
  }
})

export default store;