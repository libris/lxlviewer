export const syncData = function ({ dispatch, state }, data) {
  dispatch('SYNCPOST', data);
};
export const loadVocab = function ({ dispatch, state }, data) {
  dispatch('LOADVOCAB', data);
};
export const changeSettings = function ({ dispatch, state }, data) {
  dispatch('CHANGESETTINGS', data);
};
