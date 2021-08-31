import { each } from 'lodash-es';
import * as VocabUtil from '@/utils/vocab';
import * as DisplayUtil from '@/utils/display';
import * as StringUtil from '@/utils/string';

export const state = () => ({
  vocab: null,
  vocabClasses: null,
  vocabProperties: null,
  display: null,
  vocabContext: null,
  currentDocument: null,
  entityReferences: {},
  settings: {
    language: 'sv',
    idPath: process.env.API_PATH,
    dataPath: process.env.API_PATH,
    filteredCategories: [
      'pending',
      'shorthand',
      'unstable',
    ],
  }
})

export const mutations = {
  SET_VOCAB(state, data) {
    const vocabMap = new Map(data['@graph'].map(entry => [entry['@id'], entry]));
    state.vocab = vocabMap;
  },
  SET_VOCAB_CLASSES(state, data) {
    const vocabJson = data['@graph'];
    const classTerms = [].concat(
      VocabUtil.getTermByType('Class', vocabJson, state.vocabContext, state.settings),
      VocabUtil.getTermByType('marc:CollectionClass', vocabJson, state.vocabContext, state.settings),
    );
    const classes = new Map(classTerms.map(entry => [entry['@id'], entry]));
    classes.forEach((classObj) => {
      if (classObj.hasOwnProperty('subClassOf')) {
        each(classObj.subClassOf, (baseClass) => {
          const baseClassObj = classes.get(baseClass['@id']);
          if (typeof baseClassObj !== 'undefined') {
            if (baseClassObj.hasOwnProperty('baseClassOf')) {
              baseClassObj.baseClassOf.push(StringUtil.convertToPrefix(classObj['@id'], state.vocabContext));
            } else {
              baseClassObj.baseClassOf = [StringUtil.convertToPrefix(classObj['@id'], state.vocabContext)];
            }
          }
        });
      }
    });
    state.vocabClasses = classes;
  },
  SET_VOCAB_PROPERTIES(state, data) {
    const vocabJson = data['@graph'];
    let props = [];
    props = props.concat(VocabUtil.getTermByType('Property', vocabJson, state.vocabContext, state.settings));
    props = props.concat(VocabUtil.getTermByType('DatatypeProperty', vocabJson, state.vocabContext, state.settings));
    props = props.concat(VocabUtil.getTermByType('ObjectProperty', vocabJson, state.vocabContext, state.settings));
    props = props.concat(VocabUtil.getTermByType('owl:SymmetricProperty', vocabJson, state.vocabContext, state.settings));
    const vocabProperties = new Map(props.map(entry => [entry['@id'], entry]));
    state.vocabProperties = vocabProperties;
  },
  SET_DISPLAY(state, data) {
    state.display = data;
  },
  SET_VOCAB_CONTEXT(state, data) {
    state.vocabContext = data;
  },
  SET_CURRENT_DOCUMENT(state, data) {
    state.currentDocument = data;
    const entityReferences = {};
    if (data.hasOwnProperty('@graph')) {
      data['@graph'].forEach(item => {
        if (item['@graph']) {
          entityReferences[item['@graph'][1]['@id']] = item['@graph'][1];
        } else {
          entityReferences[item['@id']] = item;
        }
      });
    }
    state.entityReferences = entityReferences;
  },
}

export const actions = {
  async nuxtServerInit({ commit }) {
    const contextPath = `${process.env.API_PATH}/context.jsonld`;
    const contextData = await fetch(
      contextPath
    ).then(res => res.json());
    const processed = VocabUtil.preprocessContext(contextData);
    commit('SET_VOCAB_CONTEXT', processed['@context']);

    const vocabPath = `${process.env.API_PATH}/vocab/data.jsonld`;
    const vocab = await fetch(
      vocabPath
    ).then(res => res.json());
    commit('SET_VOCAB', vocab);
    commit('SET_VOCAB_CLASSES', vocab);
    commit('SET_VOCAB_PROPERTIES', vocab);

    const displayPath = `${process.env.API_PATH}/vocab/display/data.jsonld`;
    const display = await fetch(
      displayPath
    ).then(res => res.json());

    const expanded = DisplayUtil.expandInherited(display);
    commit('SET_DISPLAY', expanded);
  },
};

export const getters = {
  settings: state => {
    return state.settings;
  },
  display: state => {
    return state.display;
  },
  vocabContext: state => {
    return state.vocabContext;
  },
  vocab: state => {
    return state.vocab;
  },
  vocabClasses: state => {
    return state.vocabClasses;
  },
  vocabProperties: state => {
    return state.vocabProperties;
  },
  currentDocument: state => {
    return state.currentDocument;
  },
  entityReferences: state => {
    return state.entityReferences;
  },
};
