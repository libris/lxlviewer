import { isObject, isArray, uniqBy, isNumber, each, remove } from 'lodash-es';
import * as VocabUtil from './vocab';

export function removeDomain(string, removableBaseUriArray) {
  const removable = removableBaseUriArray;
  let newValue = string;
  for (let i = 0; i < removable.length; i++) {
    newValue = newValue.replace(removable[i], '');
  }
  return newValue;
}

export async function digestMessage(message) {
  try {
    const msgUint8 = new TextEncoder().encode(message); // encode as (utf-8) Uint8Array
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8); // hash the message
    const hashArray = Array.from(new Uint8Array(hashBuffer)); // convert buffer to byte array
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join(''); // convert bytes to hex string
    return hashHex;
  } catch (e) {
    // crypto.subtle is only available on https sites and localhost but not e.g. http://kblocalhost.kb.se
    // eslint-disable-next-line
    const sjcl = await import('sjcl');
    const hashArray = sjcl.hash.sha256.hash(message);
    const hashHex = sjcl.codec.hex.fromBits(hashArray);
    return hashHex;
  }
}

export function convertToPrefix(uri, context) {
  if (typeof context === 'undefined') {
    throw new Error('convertToPrefix was called without context');
  }
  const hashParts = uri.split('#');
  let suffix = '';
  let baseUri = '';
  if (hashParts.length > 1) {
    suffix = hashParts[1];
    baseUri = `${hashParts[0]}#`;
  } else {
    const uriParts = uri.split('/');
    suffix = uriParts[uriParts.length - 1];
    uriParts.splice(uriParts.length - 1, 1);
    baseUri = `${uriParts.join('/')}/`;
  }
  const prefix = VocabUtil.getPrefixFromBaseUri(baseUri, context);
  const withPrefix = prefix !== '' ? `${prefix}:${suffix}` : suffix;
  return withPrefix;
}

export function getCompactUri(uri, context) {
  const singleUri = Array.isArray(uri) ? uri[0] : uri;
  if (typeof context === 'undefined') {
    throw new Error('getCompactUri was called without context.');
  }
  if (typeof singleUri !== 'string') {
    throw new Error('getCompactUri was called with an URI that was not a string (should be a string).');
  }
  let compactUri = '';
  const vocabBase = context[0]['@vocab'];
  if (singleUri.startsWith(vocabBase)) {
    compactUri = singleUri.replace(vocabBase, '');
  } else {
    compactUri = convertToPrefix(singleUri, context);
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

export function convertToVocabKey(str, context) {
  if (typeof context === 'undefined') {
    throw new Error('convertVocabGettableId was called without context');
  }
  if (str.indexOf('://') > -1) {
    return str;
  }
  return `${context[0]['@vocab']}${str}`;
}

export function getUiPhraseByLang(phrase, langcode, translationsFile) {
  if (translationsFile === null || typeof translationsFile === 'undefined') return phrase; // Fallback if no translations

  if (typeof phrase === 'string') {
    if (translationsFile[langcode] && translationsFile[langcode][phrase]) {
      return translationsFile[langcode][phrase];
    }
  } else if (Array.isArray(phrase)) {
    const translated = phrase.map((el) => {
      if (translationsFile[langcode] && translationsFile[langcode][el]) {
        return translationsFile[langcode][el];
      } return el;
    });
    return translated.join(' ');
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
  let hash = 0; let i; let 
    chr;
  if (str.length === 0) return hash;
  for (i = 0; i < str.length; i++) {
    chr = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr; // eslint-disable-line no-bitwise
    // Convert to 32bit integer
    hash |= 0; // eslint-disable-line no-bitwise
  }
  return hash;
}

export function isNumeric(num) {
  return !Number.isNaN(num);
}

export function getNumberOfVowels(str) {
  const m = str.match(/[aeiouy]/gi);
  return m === null ? 0 : m.length;
}

export function isLibrisResourceUri(uri, settings) {
  const baseUri = settings.dataPath;
  
  let translatedUri = uri;
  if (uri && uri.startsWith('https://id.kb.se')) {
    translatedUri = uri.replace('https://id.kb.se', settings.idPath);
  }

  if (translatedUri) {
    if (translatedUri.startsWith(baseUri)) {
      const uriWithoutPath = uri.replace(`${baseUri}/`, '');
      const uriWithoutEnd = uriWithoutPath.split('/')[0].split('#')[0];
      if (uriWithoutEnd.length > 10 && getNumberOfVowels(uriWithoutEnd) === 0) {
        return true;
      }
    }
  }
  return false;
}

export function arrayPathToString(arrayPath) {
  let path = '';
  for (let i = 0; i < arrayPath.length; i++) {
    if (isNumber(arrayPath[i])) {
      path += `[${arrayPath[i]}]`;
    } else {
      if (i !== 0) {
        path += '.';
      }
      path += arrayPath[i];
    }
  }
  path = path.replace('@graph[0]', 'record');
  path = path.replace('@graph[1]', 'mainEntity');
  path = path.replace('@graph[2]', 'mainEntity.instanceOf');
  return path;
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

export function getLabelByLang(string, lang, resources) {
  if (!string) {
    return null;
  }
  if (isObject(string)) {
    throw new Error(
      'getLabelByLang was called with an object (should be a string).',
      JSON.stringify(string),
    );
  }
  const vocab = resources.vocab;
  const context = resources.context;
  let item = VocabUtil.getTermObject(string, vocab, context);
  
  if (string.indexOf('@reverse/') >= 0) {
    const reverseLabel = string.split('/').pop();
    const reverseItem = VocabUtil.getTermObject(reverseLabel, vocab, context);

    if (reverseItem.hasOwnProperty('inverseOf') && reverseItem.inverseOf.hasOwnProperty('@id')) {
      item = VocabUtil.getTermObject(reverseItem.inverseOf['@id'], vocab, context);
    }
  }

  let labelByLang = '';
  if (typeof item !== 'undefined') {
    if (item.labelByLang) {
      labelByLang = item.labelByLang[lang];
    } else if (item.prefLabelByLang) {
      labelByLang = item.prefLabelByLang[lang];
    } else if (item.label) {
      labelByLang = item.label;
    }
  }
  // Check if we have something of value
  if (isArray(labelByLang)) {
    labelByLang = uniqBy(labelByLang, i => i.toLowerCase());
    labelByLang = labelByLang.join(', ');
  }

  if (labelByLang && labelByLang.length > 0) {
    return labelByLang;
  }
  return string;
}

function translateable(type) {
  if (type === '@type' || type === 'issuanceType') {
    return true;
  }
  return false;
}

export function extractStrings(obj) {
  if (obj == null || typeof obj === 'undefined') {
    throw new Error('StringUtil.extractStrings was called with a null/undefined object');
  }
  let label = '';
  each(obj, (value) => {
    if (!isObject(value)) {
      label += value;
    } else {
      label += extractStrings(value);
    }
    label += ' ';
  });
  return label;
}

export function formatLabel(obj) {
  if (obj == null || typeof obj === 'undefined') {
    throw new Error('StringUtil.formatLabel was called with a null/undefined object');
  }
  let label = [];
  each(obj, (value) => {
    if (!isObject(value)) {
      label.push(value);
    } else {
      label.push(extractStrings(value));
    }
  });
  label = [].concat.apply([], label).filter(el => el && el.length > 0); // eslint-disable-line prefer-spread
  label = label.join(' · ');
  return label;
}

export function getFormattedEntries(list, vocab, language, context) {
  let formatted = [];
  for (const entry of list) {
    if (translateable(entry.property)) {
      formatted = formatted.concat(entry.value.map(obj => getLabelByLang(obj, language, { vocab, context })));
    } else {
      formatted = formatted.concat(entry.value);
    }
  }
  remove(formatted, value => value === '' || value === null); // Remove empty strings
  return formatted;
}

export function getSigelLabel(sigel, len) {
  if (!sigel.friendly_name) {
    return sigel.code;
  }

  const sigelPart = ` (${sigel.code})`;
  const fName = sigel.friendly_name.length + sigelPart.length > len
      ? `${sigel.friendly_name.substr(0, len - sigelPart.length - 3)}...`
      : sigel.friendly_name;

  return `${fName}${sigelPart}`;
}

export function getLibraryUri(sigel) {
  return `https://libris.kb.se/library/${sigel}`;
}
