export const syncData = function ({ dispatch, state }, data) {
  dispatch('SYNCPOST', data);
};
export const updateForm = function ({ dispatch, state }, form, data) {
  dispatch('UPDATE_FORM', form, data);
};
export const loadVocab = function ({ dispatch, state }, data) {
  dispatch('LOADVOCAB', data);
};
export const loadDisplayDefs = function ({ dispatch, state }, data) {
  dispatch('LOADDISPLAYDEFS', data);
};
export const changeSettings = function ({ dispatch, state }, data) {
  dispatch('CHANGESETTINGS', data);
};
