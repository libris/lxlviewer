import Vue from 'vue';
import Vuex from 'vuex';

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
    lastAdded: '',
    level: 'it',
    dirty: true,
    isDev: false,
    keybindState: '',
    saved: {
      loading: false,
      error: false,
      info: '',
    },
  },
};

const mutations = {
  SYNCPOST (state, data) {
    state.editor.data = data;
  },
  UPDATE_FORM (state, form, data) {
    state.editor.data[form] = data;
  },
  LOADVOCAB (state, data) {
    state.vocab = data;
  },
  LOADDISPLAYDEFS (state, data) {
    state.display = data;
  },
  CHANGESETTINGS (state, data) {
    state.settings = data;
  },
  CHANGESAVEDSTATUS (state, property, data) {
    state.status.saved[property] = data;
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
