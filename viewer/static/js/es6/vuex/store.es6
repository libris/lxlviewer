import Vue from 'vue';
import Vuex from 'vuex';
import * as VocabUtil from '../utils/vocab';
import * as RecordUtil from '../utils/record';
import _ from 'lodash';

Vue.use(Vuex);

const state = {
  editor: {
    data: {},
  },
  vocab: {},
  context: {},
  vocabClasses: [],
  vocabProperties: [],
  forcedListTerms: [],
  display: {},
  settings: {},
  user: {},
  notification: {
    message: '',
    color: 'grey',
    active: false,
  },
  status: {
    showHelp: false,
    editorFocus: 'mainEntity',
    helpSection: 'none',
    lastAdded: '',
    lastSavedData: {},
    level: 'mainEntity',
    isDev: false,
    keybindState: '',
    inEdit: false,
    isNew: true,
    saved: {
      loading: false,
      error: false,
      info: '',
    },
    resultList: {
      loading: false,
      error: false,
      info: '',
    },
    removing: false,
    changeHistory: {
      mainEntity: [],
      record: [],
    },
  },
};

const mutations = {
  SYNCPOST (state, data) {
    Vue.set(state.editor, 'data', RecordUtil.insertWorkIntoLocal(data));
  },
  UPDATE_FORM (state, form, data, oldData) {
    if (!_.isEqual(data, state.editor.data[form])) {
      state.status.changeHistory[form].unshift(_.cloneDeep(oldData));
      Vue.set(state.editor.data, form, data);
    }
  },
  NAVIGATE_CHANGE_HISTORY (state, form, direction) {
    if (state.status.changeHistory[form].length > 0 && state.status.inEdit) {
      if (direction === 'back') {
        const test = state.status.changeHistory[form].shift();
        Vue.set(state.editor.data, form, test);
      }
    }
  },
  LOADVOCAB (state, data) {
    // state.vocabMap = new Map(data.map((entry) => [entry['@id'], entry]));
    const classes = new Map(VocabUtil.getTermByType('Class', data).map(entry => [entry['@id'], entry]));
    classes.forEach(classObj => {
      if (classObj.hasOwnProperty('subClassOf')) {
        _.each(classObj.subClassOf, baseClass => {
          const baseClassObj = classes.get(baseClass['@id']);
          if (typeof baseClassObj !== 'undefined') {
            if (baseClassObj.hasOwnProperty('baseClassOf')) {
              baseClassObj.baseClassOf.push(classObj['@id']);
            } else {
              baseClassObj.baseClassOf = [classObj['@id']];
            }
          }
        });
      }
    });
    state.vocabClasses = classes;

    let props = [];
    props = props.concat(VocabUtil.getTermByType('Property', data));
    props = props.concat(VocabUtil.getTermByType('DatatypeProperty', data));
    props = props.concat(VocabUtil.getTermByType('ObjectProperty', data));
    props = props.concat(VocabUtil.getTermByType('owl:SymmetricProperty', data));
    state.vocabProperties = new Map(props.map((entry) => [entry['@id'], entry]));
  },
  LOADVOCABMAP (state, data) {
    state.vocab = data;
  },
  LOADCONTEXT (state, data) {
    state.context = data;
  },
  LOADFORCEDLISTTERMS(state, data) {
    state.forcedListTerms = data;
  },
  LOADDISPLAYDEFS (state, data) {
    state.display = data;
  },
  UPDATE_USER (state, data) {
    state.user = data;
    state.user.saveSettings();
  },
  CHANGESETTINGS (state, data) {
    state.settings = data;
  },
  CHANGESAVEDSTATUS (state, property, data) {
    state.status.saved[property] = data;
  },
  CHANGERESULTLISTSTATUS (state, property, data) {
    state.status.resultList[property] = data;
  },
  CHANGESTATUS (state, property, data) {
    state.status[property] = data;
  },
  CHANGENOTIFICATION (state, property, data) {
    if (property === 'message') {
      state.notification.active = true;
    }
    state.notification[property] = data;
  },
};

export default new Vuex.Store({
  state,
  mutations,
});
