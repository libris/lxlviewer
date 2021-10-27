import { each } from 'lodash-es';
import * as VocabUtil from 'lxljs/vocab';
import * as DisplayUtil from 'lxljs/display';
import * as StringUtil from 'lxljs/string';
import envComputer from '@/plugins/env';
import translationsFile from '@/resources/json/i18n.json';

export const state = () => ({
  vocab: null,
  vocabClasses: null,
  vocabProperties: null,
  display: null,
  vocabContext: null,
  currentDocument: null,
  entityReferences: {},
  collections: null,
  appState: {
    navigatingWithFacetColumn: false,
    navigatingFromSearchBar: false,
    domain: null,
  },
  settings: {
    language: 'sv',
    hostPath: envComputer(process.env.ENV),
    version: process.env.APP_VERSION,
    gitDescribe: process.env.GIT_DESCRIBE,
    idPath: process.env.API_PATH,
    dataPath: process.env.API_PATH,
    environment: process.env.ENV || 'local',
    filteredCategories: [
      'pending',
      'shorthand',
      'unstable',
    ],
    removableBaseUris: [
      'http://libris.kb.se/',
      'https://libris.kb.se/',
      'http://id.kb.se/vocab/',
      'https://id.kb.se/vocab/',
      'http://id.kb.se/',
      'https://id.kb.se/',
    ],
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
          order: 8,
        },
      },
      'language.@id': {
        sv: 'Språk',
        en: 'Language',
        facet: {
          order: 9,
        },
      },
      'genreForm.@id': {
        sv: 'Genre/form',
        en: 'Genre/form',
        facet: {
          order: 10,
        },
      },
      'instanceOf.genreForm.@id': {
        sv: 'Genre/form på verket',
        en: 'Genre/form of work',
        facet: {
          order: 11,
        },
      },
      'contribution.agent.@id': {
        sv: 'Medverkan eller primär medverkan',
        en: 'Contribution or primary contribution',
        facet: {
          order: 12,
        },
      },
      'contentType.@id': {
        sv: 'Innehållstyp',
        en: 'Content type',
        facet: {
          order: 13,
        },
      },
      'carrierType.@id': {
        sv: 'Bärartyp',
        en: 'Carrier type',
        facet: {
          order: 14,
        },
      },
      'instanceOf.subject.@id': {
        sv: 'Ämne',
        en: 'Subject',
        facet: {
          order: 15,
        },
      },
      'meta.bibliography.@id': {
        sv: 'Ingår i bibliografi',
        en: 'In bibliography',
        facet: {
          order: 16,
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
  },
})

export const mutations = {
  SET_APP_STATE(state, payload) {
    const property = payload.property;
    if (state.appState.hasOwnProperty(property)) {
      state.appState[property] = payload.value;
    } else {
      throw new Error(`Trying to set an app state property that does not exist. Has it been setup in store? Trying to modify: ${property}`);
    }
  },
  SET_LANGUAGE(state, langCode) {
    state.settings.language = langCode;
  },
  SET_COLLECTIONS(state, data) {
    state.collections = data;
  },
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
  SET_MARCFRAME_DATA(state, data) {
    state.marcframe = data;
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
  async nuxtServerInit({ commit, dispatch }, { req }) {
    if (process.server) {
      const headerHost = req.headers['x-forwarded-host'];
      if (headerHost.startsWith('id') === false) {
        dispatch('setAppState', { property: 'domain', value: 'libris' });
      } else {
        dispatch('setAppState', { property: 'domain', value: 'id' });
      }
    }

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
  
    const marcframePath = 'https://raw.githubusercontent.com/libris/librisxl/master/whelk-core/src/main/resources/ext/marcframe.json';
    const marcframe = await fetch(
      marcframePath
    ).then(res => res.json());
    commit('SET_MARCFRAME_DATA', marcframe);
  },
  setCollections(data) {
    commmit('SET_COLLECTIONS', data);
  },
  setAppState({ commit }, payload) {
    commit('SET_APP_STATE', payload);
  },
  setLanguage({ commit }, langCode) {
    commit('SET_LANGUAGE', langCode);
  },
};

export const getters = {
  appState: state => {
    return state.appState;
  },
  settings: state => {
    return state.settings;
  },
  resources: state => {
    return {
      vocab: state.vocab,
      display: state.display,
      context: state.vocabContext,
      marcframe: state.marcframe,
      i18n: translationsFile,
    };
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
  collections: state => {
    return state.collections;
  },
};
