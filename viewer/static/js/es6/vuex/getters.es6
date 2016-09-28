export function getEditorData (state) {
  console.log("getting editordata");
  return state.editor.data;
}
export function getVocabulary (state) {
  console.log("getting vocab");
  return state.vocab;
}
export function getSettings (state) {
  console.log("getting settings");
  return state.settings;
}
