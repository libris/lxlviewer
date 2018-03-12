import Vue from 'vue';
import Vuex from 'vuex';
Vue.use(Vuex);
import * as _ from 'lodash';
import * as VocabUtil from '@/utils/vocab';
import * as StringUtil from '@/utils/string';
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
      title: '',
      status: {
        dirty: false,
        saving: false,
        opening: false,
        lastAdded: '',
        editing: false,
        focus: 'mainEntity',
      },
      changeHistory: {
        mainEntity: [],
        record: [],
      },
    },
    status: {
      keybindState: '',
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
    navigateChangeHistory(state, form, direction) {
      if (state.inspector.changeHistory[form].length > 0 && state.inspector.status.inEdit) {
        if (direction === 'back') {
          const test = state.inspector.changeHistory[form].shift();
          Vue.set(state.inspector.data, form, test);
        }
      }
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
    updateInspectorData(state, payload) {
      console.log("DATA_UPDATE:", payload);
      const inspectorData = _.cloneDeep(state.inspector.data);
      // const formData = _.cloneDeep(state.inspector.data[payload.focus]);
      const modified = _.cloneDeep(inspectorData);
      _.set(modified, payload.path, payload.value);
      state.inspector.data = modified;

      // if (typeof payload.path !== 'undefined' && typeof payload.key !== 'undefined') {
      //   _.set(modified, `${payload.path}.${payload.key}`, payload.value);
      // } else if (typeof payload.path !== 'undefined') {
      //   _.set(modified, payload.path, payload.value);
      // } else {
      //   const newItem = {};
      //   newItem[payload.key] = payload.value;
      //   modified = Object.assign({}, formData, newItem);
      // }
      // console.log("Modified is", modified);
      // state.inspector.data[payload.focus] = modified;
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
    navigateChangeHistory({ commit }, form, direction) {
      commit('navigateChangeHistory', form, direction);
    },
    setUser({ commit }, userObj) {
      commit('setUser', userObj);
    },
    setSettings({ commit }, settingsObj) {
      commit('setSettings', settingsObj);
    },
    setInspectorData({ commit }, data) {
      commit('setInspectorData', data);
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