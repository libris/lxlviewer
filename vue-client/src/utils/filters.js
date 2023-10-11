import store from '@/store';
import * as StringUtil from 'lxljs/string';

export const translatePhrase = (string) => {
  return StringUtil.getUiPhraseByLang(
    string,
    store.getters.settings.language,
    store.getters.resources.i18n
  );
};
