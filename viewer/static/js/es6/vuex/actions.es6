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
