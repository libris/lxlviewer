import * as StringUtil from 'lxljs/string';
import store from '@/store';
import * as DataUtil from '@/utils/data';

export const translatePhrase = (string) => {
  return StringUtil.getUiPhraseByLang(
    string,
    store.getters.settings.language,
    store.getters.resources.i18n
  );
};

export const labelByLang = (label) =>
  StringUtil.getLabelByLang(label, store.getters.user.settings.language, store.getters.resources);

export const asAppPath = (path) => {
  const appPaths = store.getters.settings.appPaths;
  let newPath = '';
  for (const key of Object.keys(appPaths)) {
    newPath = path.replace(key, appPaths[key]);
  }
  return newPath;
};

export const convertResourceLink = (uri) => {
  if (uri === null || typeof uri === 'undefined' || uri.length === 0) {
    throw new Error('Filter "convertResourceLink" was called without input');
  }

  return DataUtil.translateAliasedUri(uri);
};

export const asFnurgelLink = (id) => {
  if (!id || typeof id === 'undefined') {
    return '';
  }
  const parts = id.split('/');
  const fnurgel = `/${parts[parts.length - 1]}`;
  return fnurgel;
}
