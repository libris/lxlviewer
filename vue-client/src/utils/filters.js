import * as StringUtil from 'lxljs/string';
import * as LayoutUtil from '@/utils/layout';
import * as DataUtil from '@/utils/data';

import { useResourcesStore } from '@/stores/resources';
import { useSettingsStore } from '@/stores/settings';

export const labelByLang = (label) => {
  const settings = useSettingsStore();
  const resources = useResourcesStore();
  return StringUtil.getLabelByLang(label, settings.language, resources.resources);
};

export const asAppPath = (path) => {
  const settings = useSettingsStore();
  const appPaths = settings.appPaths;
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
};

export const removeDomain = (value) => {
  const settings = useSettingsStore();
  return StringUtil.removeDomain(value, settings.removableBaseUris);
};

export const translatePhrase = (string) => {
	const settings = useSettingsStore();
	const resources = useResourcesStore();
	return StringUtil.getUiPhraseByLang(string, settings.language, resources.i18n);
};

export const capitalize = (value) => {
  if (!value) return '';
  let newValue = value;
  newValue = newValue.toString();
  return newValue.charAt(0).toUpperCase() + newValue.slice(1);
};

export const lowercase = (value) => value.toLowerCase();
export const uppercase = (value) => value.toUpperCase();