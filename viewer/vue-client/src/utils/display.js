import { cloneDeep, each, isObject, uniq, remove, isArray, isEmpty } from 'lodash-es';
import moment from 'moment';
import * as httpUtil from './http';
import * as DataUtil from './data';
import * as VocabUtil from './vocab';
import * as StringUtil from './string';
import 'moment/locale/sv';

moment.locale('sv');

export function getDisplayDefinitions(baseUri) {
  return new Promise((resolve, reject) => {
    httpUtil.getResourceFromCache(`${baseUri}/vocab/display/data.jsonld`).then((result) => {
      const clonedResult = cloneDeep(result);
      each(clonedResult.lensGroups, (lensGroup) => {
        each(lensGroup.lenses, (lens) => {
          if (lens.hasOwnProperty('fresnel:extends')) {
            const [extendLens, extendLevel] = lens['fresnel:extends']['@id'].split('-');
            lens.showProperties.splice(
              lens.showProperties.indexOf('fresnel:super'),
              1,
              ...result.lensGroups[extendLevel].lenses[extendLens].showProperties,
            );
          }
        });
      });
      resolve(clonedResult);
    }, (error) => {
      reject(error);
    });
  });
}

function getValueByLang(item, propertyId, displayDefs, langCode, context) {
  if (!langCode || typeof langCode === 'undefined') {
    throw new Error('getValueByLang was called with an undefined language code.');
  }
  let translatedValue = item[propertyId]; // Set original value
  const contextKey = VocabUtil.getContextProperty(propertyId, context);
  const langPropObject = VocabUtil.getContextWithContainer(contextKey, '@language', context);
  let byLangKey = '';
  if (typeof langPropObject !== 'undefined') {
    byLangKey = langPropObject['@id'];
  }
  if (item[byLangKey] && item[byLangKey][langCode]) {
    translatedValue = item[byLangKey][langCode];
  }
  return translatedValue;
}

export function getLensById(id, displayDefs) {
  if (!displayDefs) {
    throw new Error('getLensById was called without display resource');
  }
  if (!id) {
    throw new Error('getLensById was called without lens id');
  }
  for (const collection in displayDefs.lensGroups) {
    if (Object.prototype.hasOwnProperty.call(displayDefs.lensGroups, collection)) {
      for (const lens in displayDefs.lensGroups[collection].lenses) {
        if (Object.prototype.hasOwnProperty.call(displayDefs.lensGroups[collection].lenses, lens)) {
          const obj = displayDefs.lensGroups[collection].lenses[lens];
          if (obj.hasOwnProperty('@id') && obj['@id'] === id) {
            return obj;
          }
        }
      }
    }
  }
  return {};
}

/* eslint-disable no-use-before-define */
export function getLensPropertiesDeep(className, displayDefinitions, vocab, settings, context, level, depth) {
  let props = [];
  const lensGroups = displayDefinitions.lensGroups;
  if (lensGroups.hasOwnProperty(level) && lensGroups[level].lenses.hasOwnProperty(className)) {
    props = lensGroups[level].lenses[className].showProperties;
  } else {
    const termObj = VocabUtil.getTermObject(className, vocab, context);
    if (termObj.hasOwnProperty('subClassOf')) {
      const ownClasses = VocabUtil.filterOwnClasses(termObj.subClassOf, context);
      if (ownClasses.length > 0) {
        props = getDisplayProperties(ownClasses[0]['@id'], displayDefinitions, vocab, settings, context, level, depth + 1);
      }
    }
  }
  return props;
}

export function getDisplayProperties(className, displayDefinitions, vocab, settings, context, inputLevel, depth = 0) {
  if (!className || typeof className === 'undefined') {
    throw new Error('getDisplayProperties was called with an undefined type.');
  }
  if (isObject(className) && !isArray(className)) {
    throw new Error(
      'getDisplayProperties was called with an object as type parameter (should be a string).',
    );
  }
  const cn = StringUtil.getCompactUri(className, context);
  let level = inputLevel;
  let props = [];
  const lensGroups = displayDefinitions.lensGroups;

  // If we want tokens, we traverse them first, since they can "fail"
  if (level === 'tokens') {
    props = getLensPropertiesDeep(cn, displayDefinitions, vocab, settings, context, level, depth);
    if (props.length === 0 && depth === 0) {
      // If we wanted tokens and got nothing, change level to "chips"
      // We only want to "sidestep" if depth is 0.
      level = 'chips';
    }
  }
  // If level is not tokens 
  if (level !== 'tokens') {
    props = getLensPropertiesDeep(cn, displayDefinitions, vocab, settings, context, level, depth);
  }
  // Add extensions
  let extension = [];
  for (let i = 0; i < props.length; i++) {
    if (props[i] === 'fresnel:super') {
      extension = getLensById(lensGroups[level].lenses[cn]['fresnel:extends']['@id'], displayDefinitions).showProperties;
      props.splice(i, 1, ...extension);
      break;
    }
  }
  props = uniq(props);
  remove(props, x => isObject(x));
  return props;
}

/* eslint-disable no-use-before-define */
export function getItemLabel(item, displayDefs, quoted, vocab, settings, context, inProp = '') {
  const displayObject = getChip(item, displayDefs, quoted, vocab, settings, context);
  let rendered = StringUtil.formatLabel(displayObject).trim();
  if (item['@type'] && VocabUtil.isSubClassOf(item['@type'], 'Identifier', vocab, context)) {
    if (inProp.toLowerCase() !== item['@type'].toLowerCase()) {
      const translatedType = StringUtil.getLabelByLang(item['@type'], settings.language, vocab, context);
      rendered = `${translatedType} ${rendered}`;
    }
  }
  return rendered;
}

export function getItemToken(item, displayDefs, quoted, vocab, settings, context) {
  const displayObject = getToken(item, displayDefs, quoted, vocab, settings, context);
  let rendered = StringUtil.formatLabel(displayObject).trim();
  if (item['@type'] && VocabUtil.isSubClassOf(item['@type'], 'Identifier', vocab, context)) {
    rendered = `${item['@type']} ${rendered}`;
  }
  return rendered;
}

export function getDisplayObject(item, level, displayDefs, quoted, vocab, settings, context) {
  if (!item || typeof item === 'undefined') {
    throw new Error('getDisplayObject was called with an undefined object.');
  }
  if (!isObject(item)) {
    throw new Error('getDisplayObject was called with a non-object.');
  }
  let result = {};
  let trueItem = Object.assign({}, item);

  if (trueItem.hasOwnProperty('@id') && !trueItem.hasOwnProperty('@type')) {
    trueItem = DataUtil.getEmbellished(trueItem['@id'], quoted);
    if (!trueItem.hasOwnProperty('@type') && trueItem.hasOwnProperty('@id')) {
      return { label: StringUtil.removeDomain(trueItem['@id'], settings.removableBaseUris) };
    }
  }
  if (!trueItem.hasOwnProperty('@type') || typeof trueItem['@type'] === 'undefined') {
    return {}; // Early fail
  }
  // Get the list of properties we want to show
  const displayType = isArray(trueItem['@type']) ? trueItem['@type'][0] : trueItem['@type'];
  const properties = getDisplayProperties(displayType, displayDefs, vocab, settings, context, level);
  // Start filling the object with the selected properties
  for (let i = 0; i < properties.length; i++) {
    const property = properties[i];
    if (!isObject(property)) {
      let valueOnItem = '';
      if (property === 'created' || property === 'modified') {
        valueOnItem = moment(item[property]).format('lll');
      } else {
        valueOnItem = getValueByLang(trueItem, property, displayDefs, settings.language, context);
      }
      if (typeof valueOnItem !== 'undefined') {
        let value = valueOnItem;
        if (isObject(value) && !isArray(value)) {
          if (level === 'chips') {
            value = getItemToken(value, displayDefs, quoted, vocab, settings, context);
          } else {
            value = getItemLabel(value, displayDefs, quoted, vocab, settings, context, property);
          }
        } else if (isArray(value)) {
          const newArray = [];
          for (const arrayItem of value) {
            if (typeof arrayItem === 'undefined' || arrayItem === null) {
              throw new Error('getDisplayObject encountered an undefined or null item in an array.');
            }
            if (isObject(arrayItem) && (Object.keys(arrayItem).length > 1 || arrayItem[Object.keys(arrayItem)[0]] !== '')) {
              if (level === 'chips') {
                newArray.push(getItemToken(arrayItem, displayDefs, quoted, vocab, settings, context));
              } else {
                newArray.push(getItemLabel(arrayItem, displayDefs, quoted, vocab, settings, context, property));
              }
            } else if (arrayItem.length > 0) {
              newArray.push(arrayItem);
            } else {
              // console.warn("Array contained unknown item", arrayItem);
            }
          }
          value = newArray;
        }
        result[property] = value;
      } else if (properties.length < 3 && i === 0) {
        const rangeOfMissingProp = VocabUtil.getRange(property, vocab, context);
        let propMissing = property;
        if (
          rangeOfMissingProp.length > 1
          || (rangeOfMissingProp.length === 1 && rangeOfMissingProp[0] !== 'http://www.w3.org/2000/01/rdf-schema#Literal')
        ) {
          propMissing = rangeOfMissingProp[0];
        }
        const expectedClassName = StringUtil.getLabelByLang(
          propMissing, // Get the first one just to show something
          settings.language,
          vocab,
          context,
        );
        result[property] = `{${expectedClassName} saknas}`;
      }
    }
  }
  if (isEmpty(result)) {
    window.lxlWarning(`🏷️ DisplayObject was empty. @type was ${trueItem['@type']}.`, 'Item data:', trueItem);
    result = { label: `{${StringUtil.getUiPhraseByLang('Unnamed', settings.language)}}` };
  }
  return result;
}

export function getChip(item, displayDefs, quoted, vocab, settings, context) {
  return getDisplayObject(item, 'chips', displayDefs, quoted, vocab, settings, context);
}

export function getToken(item, displayDefs, quoted, vocab, settings, context) {
  const tokenObj = getDisplayObject(item, 'tokens', displayDefs, quoted, vocab, settings, context);
  let token = { rendered: '' };
  Object.keys(tokenObj).forEach((key) => {
    token.rendered += ` ${tokenObj[key]}`;
  });
  return token;
}

export function getCard(item, displayDefs, quoted, vocab, settings, context) {
  return getDisplayObject(item, 'cards', displayDefs, quoted, vocab, settings, context);
}
/* eslint-enable no-use-before-define */

export function getItemSummary(item, displayDefs, quoted, vocab, settings, context) {
  const card = getCard(item, displayDefs, quoted, vocab, settings, context);
  const displayGroups = require('@/resources/json/displayGroups.json');
  const summary = {
    categorization: [],
    header: [],
    info: [],
    identifiers: [],
    sub: [],
  };
  each(card, (value, key) => {
    let v = value;
    if (!isArray(value)) {
      v = [value];
    }
    if (displayGroups.header.indexOf(key) !== -1) {
      summary.header.push({ property: key, value: v });
    } else if (displayGroups.info.indexOf(key) !== -1) {
      summary.info.push({ property: key, value: v });
    } else if (displayGroups.identifiers.indexOf(key) !== -1) {
      summary.identifiers.push({ property: key, value: v });
    } else if (displayGroups.categorization.indexOf(key) !== -1) {
      summary.categorization.push({ property: key, value: v });
    } else {
      summary.sub.push({ property: key, value: v });
    }
  });
  if (summary.header.length === 0) {
    summary.header.push({ property: 'error', value: `{${StringUtil.getUiPhraseByLang('Unnamed', settings.language)}}` });
  }
  return summary;
}

export function getFormattedSelectOption(term, settings, vocab, context) {
  const maxLength = 43;
  let labelByLang = StringUtil.getLabelByLang(term.id, settings.language, vocab, context);
  if (labelByLang.length > maxLength) {
    labelByLang = `${labelByLang.substr(0, maxLength - 2)}...`;
  }
  const abstractIndicator = ` {${StringUtil.getUiPhraseByLang('Abstract', settings.language)}}`;
  const indent = Array(term.depth + 1).join('- ');
  return `${indent}${labelByLang} ${term.abstract ? abstractIndicator : ''}`;
}
