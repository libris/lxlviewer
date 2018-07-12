import * as _ from 'lodash';
import translationsFile from '@/resources/json/i18n.json';
import * as VocabUtil from './vocab';

export function removeDomain(string, removableBaseUriArray) {
  const removable = removableBaseUriArray;
  let newValue = string;
  for (let i = 0; i < removable.length; i++) {
    newValue = newValue.replace(removable[i], '');
  }
  return newValue;
}

export function getCompactUri(uri, context) {
  if (typeof context === 'undefined') {
    throw new Error('getCompactUri was called without context.');
  }
  let compactUri = '';
  const vocabBase = context[0]['@vocab'];
  if (uri.startsWith(vocabBase)) {
    compactUri = uri.replace(vocabBase, '');
  } else {
    compactUri = convertToPrefix(uri, context);
  }
  return compactUri;
}

export function convertToBaseUri(str, context) {
  if (typeof context === 'undefined') {
    throw new Error('convertToBaseUri was called without context.');
  }
  if (str.indexOf('://') > -1) {
    return str;
  }
  let prefix = '';
  if (str.indexOf(':') > -1) {
    prefix = str.split(':')[0];
  } else {
    prefix = 'kbv';
  }
  const uri = str.replace(`${prefix}:`, '');
  const baseUri = VocabUtil.getBaseUriFromPrefix(prefix, context);
  const withBaseUri = `${baseUri}${uri}`;
  return withBaseUri;
}

export function convertToPrefix(uri, context) {
  if (typeof context === 'undefined') {
    throw new Error('convertToPrefix was called without context');
  }
  let hashParts = uri.split('#');
  let suffix = '';
  let baseUri = '';
  if (hashParts.length > 1) {
    suffix = hashParts[1];
    baseUri = hashParts[0] + '#';
  } else {
    const uriParts = uri.split('/');
    suffix = uriParts[uriParts.length-1];
    uriParts.splice(uriParts.length-1, 1);
    baseUri = uriParts.join('/') + '/';
  }
  const prefix = VocabUtil.getPrefixFromBaseUri(baseUri, context);
  const withPrefix = prefix !== '' ? `${prefix}:${suffix}` : suffix;
  return withPrefix;
}

export function convertToVocabKey(str, context) {
  if (typeof context === 'undefined') {
    throw new Error('convertVocabGettableId was called without context');
  }
  if (str.indexOf('://') > -1) {
    return str;
  }
  return `${context[0]['@vocab']}${str}`;
}

export function getUiPhraseByLang(phrase, langcode) {
  if (translationsFile[langcode] && translationsFile[langcode][phrase]) {
    return translationsFile[langcode][phrase];
  }
  return phrase;
}

export function getParamValueFromUrl(url, param) {
  if (!url || url.length === 0) {
    return null;
  }

  const splitUrl = url.split('&');
  let paramString;
  for (let i = 0; i < splitUrl.length; i++) {
    if (splitUrl[i].indexOf(param) !== -1) {
      paramString = splitUrl[i];
      break;
    }
  }
  if (typeof paramString === 'undefined') {
    return null;
  }
  const value = paramString.split('=')[1];
  return value;
}

export function getHash(str) {
  let hash = 0, i, chr;
  if (str.length === 0) return hash;
  for (i = 0; i < str.length; i++) {
    chr   = str.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};

export function isNumeric(num) {
  return !isNaN(num);
}

export function getNumberOfVowels(str) {
  var m = str.match(/[aeiouy]/gi);
  return m === null ? 0 : m.length;
}

export function isLibrisResourceUri(uri, apiPath) {
  if (uri) {
    if (uri.startsWith(apiPath)) {
      const uriWithoutPath = uri.replace(apiPath + '/', '');
      const uriWithoutEnd = uriWithoutPath.split('/')[0].split('#')[0];
      if (uriWithoutEnd.length > 10 && getNumberOfVowels(uriWithoutEnd) === 0) {
        return true;
      }
    }
  }
  return false;
}

export function getLabelFromObject(object, language) {
  let label = '';
  if (object.hasOwnProperty('titleByLang')) {
    label = object.titleByLang[language] || object.titleByLang[Object.keys(object.titleByLang)[0]];
  } else if (object.hasOwnProperty('labelByLang')) {
    label = object.labelByLang[language] || object.labelByLang[Object.keys(object.labelByLang)[0]];
  } else if (object.hasOwnProperty('prefLabelByLang')) {
    label = object.prefLabelByLang[language] || object.prefLabelByLang[Object.keys(object.prefLabelByLang)[0]];
  } else if (object.hasOwnProperty('label')) {
    label = object.label;
  } else if (object.hasOwnProperty('notation')) {
    label = object.notation.join(', ');
  } else {
    label = object['@id'];
  }
  return label;
}

export function getLabelByLang(string, lang, vocab, context) {
  if (!string) {
    return '{FAILED LABEL}';
  }
  if (_.isObject(string)) {
    throw new Error(
      'getLabelByLang was called with an object (should be a string).',
      JSON.stringify(string)
    );
  }
  let item = VocabUtil.getTermObject(string, vocab, context);
  let note = '';
  let labelByLang = '';
  if (typeof item !== 'undefined') {
    if (item.labelByLang) {
      labelByLang = item.labelByLang[lang];
    } else if (item.prefLabelByLang) {
      labelByLang = item.prefLabelByLang[lang];
    } else if (item.label) {
      labelByLang = item.label;
    }
  } else {
    note = ' (unhandled term)';
  }
  // Check if we have something of value
  if (_.isArray(labelByLang)) {
    labelByLang = _.uniqBy(labelByLang, (i) => {
      return i.toLowerCase();
    });
    labelByLang = labelByLang.join(', ');
  }

  if (labelByLang && labelByLang.length > 0) {
    return labelByLang;
  }
  return `${string}${note}`;
}

function translateable(type) {
  if (type === '@type' || type === 'issuanceType') {
    return true;
  }
  return false;
}

export function extractStrings(obj) {
  let label = '';
  _.each(obj, (value, key) => {
    if (!_.isObject(value)) {
      label += value;
    } else {
      label += extractStrings(value);
    }
    label += ' ';
  });
  return label;
}

export function getFormattedEntries(list, vocab, settings, context) {
  let formatted = [];
  for (const entry of list) {
    if (translateable(entry.property)) {
      formatted = formatted.concat(entry.value.map((obj) => {
        return getLabelByLang(obj, settings.language, vocab, context);
      }));
    } else {
      formatted = formatted.concat(entry.value);
    }
  }
  _.remove(formatted, value => value === ''); // Remove empty strings
  return formatted;
}
