import * as _ from 'lodash';

export function removeDomain(string, removableBaseUriArray) {
  const removable = removableBaseUriArray;
  let newValue = string;
  for (let i = 0; i < removable.length; i++) {
    newValue = newValue.replace(removable[i], '');
  }
  return newValue;
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
  const item = _.find(vocab, (d) => { return d['@id'] === `${pfx}${lbl}`; });
  let note = '';
  let labelByLang = '';
  if (typeof item !== 'undefined' && item.labelByLang) {
    labelByLang = item.labelByLang[lang];
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
