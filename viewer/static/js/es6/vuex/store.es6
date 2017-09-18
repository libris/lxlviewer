import Vue from 'vue';
import Vuex from 'vuex';
import * as UserUtil from '../utils/user';
import * as VocabUtil from '../utils/vocab';

Vue.use(Vuex);

const state = {
  editor: {
    data: {},
  },
  vocab: {},
  vocabClasses: [],
  vocabProperties: [],
  forcedListTerms: [],
  display: {},
  settings: {},
  notification: {
    message: '',
    color: 'grey',
    active: false,
  },
  status: {
    showHelp: false,
    helpSection: 'none',
    lastAdded: '',
    lastSavedData: {},
    level: 'mainEntity',
    dirty: true,
    isDev: false,
    keybindState: '',
    inEdit: false,
    isNew: false,
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
  },
};

const mutations = {
  SYNCPOST (state, data) {
    Vue.set(state.editor, 'data', data);
  },
  UPDATE_FORM (state, form, data) {
    Vue.set(state.editor.data, form, data);
  },
  LOADVOCAB (state, data) {
    // state.vocabMap = new Map(data.map((entry) => [entry['@id'], entry]));

    state.vocabClasses = VocabUtil.getTermByType('Class', data);

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
  LOADFORCEDLISTTERMS(state, data) {
    state.forcedListTerms = data;
  },
  LOADDISPLAYDEFS (state, data) {
    state.display = data;
  },
  CHANGESETTINGS (state, data) {
    state.settings = data;
    UserUtil.saveUserSettings(data.userSettings);
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
