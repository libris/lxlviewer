export function getEditorData(state) {
  return state.editor.data;
}
export function getVocabulary(state) {
  return state.vocab;
}
export function getVocabMap(state) {
  return state.vocabMap;
}
export function getVocabularyClasses(state) {
  return state.vocabClasses;
}
export function getVocabularyProperties(state) {
  return state.vocabProperties;
}
export function getDisplayDefinitions(state) {
  return state.display;
}
export function getSettings(state) {
  return state.settings;
}
export function getStatus(state) {
  return state.status;
}
export function getKeybindState(state) {
  return state.status.keybindState;
}
export function getNotification(state) {
  return state.notification;
}
