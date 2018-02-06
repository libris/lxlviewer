import Vue from 'vue';
import Vuex from 'vuex';
Vue.use(Vuex);
import * as VocabUtil from '@/utils/vocab';
import * as StringUtil from '@/utils/string';

const store = new Vuex.Store({
  state: {
    resources: {
      resourcesLoaded: false,
      vocab: {},
      display: {},
      forcedSetTerms: {},
      context: {},
    },
    editor: {
      data: {}
    },
    status: {
      resultList: {
        loading: false
      }
    },
    user: {
      settings: {
        language: 'sv'
      }
    },
    settings: {
      language: 'sv',
      vocabPfx: 'https://id.kb.se/vocab/',
      removableBaseUris: [
        'http://libris.kb.se/',
        'https://libris.kb.se/',
        'http://id.kb.se/vocab/',
        'https://id.kb.se/vocab/',
        'http://id.kb.se/',
        'https://id.kb.se/',
      ]
    }
  },
  mutations: {
    changeResourcesStatus(state, status) {
      state.resources.resourcesLoaded = status;
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
    setForcedSetTerms(state, data) {
      state.resources.forcedSetTerms = data;
    },
    setDisplay(state, data) {
      state.resources.display = data;
    },
  },
  getters: {
    editor: state => {
      return state.editor;
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
    changeResourcesStatus( { commit }, status ) {
      commit('changeResourcesStatus', status);
    },
    setContext( { commit }, contextJson) {
      commit('setContext', contextJson);
    },
    setDisplay( { commit }, displayJson) {
      commit('setDisplay', displayJson);
    },
    setForcedSetTerms( { commit }, forcedSetTermsJson) {
      commit('setForcedSetTerms', forcedSetTermsJson);
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
    }
  }
})

export default store;