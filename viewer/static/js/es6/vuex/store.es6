import Vue from 'vue';
import Vuex from 'vuex';
import * as UserUtil from '../utils/user';

Vue.use(Vuex);

const state = {
  editor: {
    data: {},
  },
  vocab: {},
  display: {},
  settings: {},
  notification: {
    message: '',
    color: 'grey',
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
    state.vocab = data;
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
    state.notification[property] = data;
  },
};

export default new Vuex.Store({
  state,
  mutations,
});
