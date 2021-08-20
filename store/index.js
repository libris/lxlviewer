export const state = () => ({
  vocab: null,
  vocabMap: null
})

export const mutations = {
  SET_VOCAB(state, data) {
    state.vocab = data;
    state.vocabMap = {};
    data['@graph'].forEach(item => {
      state.vocabMap[item['@id']] = item;
    });
  }
}

export const actions = {
  async nuxtServerInit({ commit }) {
    const vocabPath = `${process.env.API_PATH}/vocab/data.jsonld`;
    const body = await fetch(
      vocabPath
    ).then(res => res.json())

    // console.log("Fetching vocab from", vocabPath);
    // const { body } = await fetch(vocabPath)
    //   .then(response => response.json());
    commit('SET_VOCAB', body);
}}

export const getters = {
  vocab: state => {
    return state.vocab;
  },
  vocabMap: state => {
    return state.vocabMap;
  }
};
