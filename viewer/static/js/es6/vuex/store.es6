import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

const state = {
  editor: {
    data: {},
  },
  vocab: {},
  settings: {},
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
  CHANGESETTINGS (state, data) {
    state.settings = data;
  },
};

export default new Vuex.Store({
  state,
  mutations,
});
