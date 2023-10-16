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

export const convertResourceLink = (uri) => {
  if (uri === null || typeof uri === 'undefined' || uri.length === 0) {
    throw new Error('Filter "convertResourceLink" was called without input');
  }

  return DataUtil.translateAliasedUri(uri);
};