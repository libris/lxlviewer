export const syncData = function ({ dispatch, state }, data) {
  dispatch('SYNCPOST', data);
};
export const updateForm = function ({ dispatch, state }, form, data, oldData) {
  dispatch('UPDATE_FORM', form, data, oldData);
};
export const loadVocab = function ({ dispatch, state }, data) {
  dispatch('LOADVOCAB', data);
};
export const loadContext = function ({ dispatch, state }, data) {
  dispatch('LOADCONTEXT', data);
};
export const loadVocabMap = function ({ dispatch, state }, data) {
  dispatch('LOADVOCABMAP', data);
};
export const loadForcedListTerms = function ({ dispatch, state }, data) {
  dispatch('LOADFORCEDLISTTERMS', data);
};
export const loadDisplayDefs = function ({ dispatch, state }, data) {
  dispatch('LOADDISPLAYDEFS', data);
};
export const changeSettings = function ({ dispatch, state }, data) {
  dispatch('CHANGESETTINGS', data);
};
export const changeSavedStatus = function ({ dispatch, state }, property, data) {
  dispatch('CHANGESAVEDSTATUS', property, data);
};
export const changeStatus = function ({ dispatch, state }, property, data) {
  dispatch('CHANGESTATUS', property, data);
};
export const changeNotification = function ({ dispatch, state }, property, data) {
  dispatch('CHANGENOTIFICATION', property, data);
};
export const changeResultListStatus = function ({ dispatch, state }, property, data) {
  dispatch('CHANGERESULTLISTSTATUS', property, data);
};
export const navigateChangeHistory = function ({ dispatch, state }, form, direction) {
  dispatch('NAVIGATE_CHANGE_HISTORY', form, direction);
};
