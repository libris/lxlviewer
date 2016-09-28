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
    // console.log('Before', JSON.stringify(state.editor.data));
    state.editor.data = data;
    // console.log('After', JSON.stringify(state.editor.data));
  },
  LOADVOCAB (state, data) {
    state.vocab = data;
    console.log('vocab loaded:', state.vocab);
  },
  CHANGESETTINGS (state, data) {
    state.settings = data;
    // console.log('settings changed:', JSON.stringify(state.settings));
  },
};

export default new Vuex.Store({
  state,
  mutations,
});
