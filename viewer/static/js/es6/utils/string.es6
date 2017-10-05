import * as _ from 'lodash';
import * as translationsFile from '../i18n';

export function removeDomain(string, removableBaseUriArray) {
  const removable = removableBaseUriArray;
  let newValue = string;
  for (let i = 0; i < removable.length; i++) {
    newValue = newValue.replace(removable[i], '');
  }
  return newValue;
}

export function getUiPhraseByLang(phrase, langcode) {
  if (translationsFile[langcode] && translationsFile[langcode][phrase]) {
    return translationsFile[langcode][phrase];
  }
  return phrase;
}

export function getParamValueFromUrl(url, param) {
  const splitUrl = url.split('&');
  let paramString;
  for (let i = 0; i < splitUrl.length; i++) {
    if (splitUrl[i].indexOf(param) !== -1) {
      paramString = splitUrl[i];
      break;
    }
  }
  const value = paramString.split('=')[1];
  return value;
}

export function isNumeric(num) {
  return !isNaN(num);
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

export function labelByLang(string, lang, vocab, vocabPfx) {
  if (!string) {
    return '[FAILED LABEL]';
  }
  const pfx = vocabPfx;
  // Filter for fetching labels from vocab
  let lbl = string.toString();
  if (lbl && lbl.indexOf(pfx) !== -1) {
    lbl = lbl.replace(pfx, '');
  }
  let item = vocab.get(`${pfx}${lbl}`);

  // Handle marc:
  if (typeof item === 'undefined') {
    if (lbl.indexOf('marc/') !== -1) {
      item = vocab.get(lbl);
    } else {
      item = vocab.get(`https://id.kb.se/${lbl.replace('marc:', 'marc/')}`);
    }
  }

  let note = '';
  let labelByLang = '';
  if (typeof item !== 'undefined' && item.labelByLang) {
    labelByLang = item.labelByLang[lang];
  } else if (typeof item !== 'undefined' && item.prefLabelByLang) {
    labelByLang = item.prefLabelByLang[lang];
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
  return `${lbl}${note}`;
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

export function getFormattedEntries(list, vocab, settings) {
  let formatted = [];
  for (const entry of list) {
    if (translateable(entry.property)) {
      formatted = formatted.concat(entry.value.map((obj) => {
        return labelByLang(obj, settings.language, vocab, settings.vocabPfx);
      }));
    } else {
      formatted = formatted.concat(entry.value);
    }
  }
  return formatted;
}
