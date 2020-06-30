import { cloneDeep, each, isObject, uniq, includes, remove, isArray, isEmpty } from 'lodash-es';
import moment from 'moment';
import * as httpUtil from './http';
import * as DataUtil from './data';
import * as VocabUtil from './vocab';
import * as StringUtil from './string';
import 'moment/locale/sv';

moment.locale('sv');

export function getDisplayDefinitions(settings) {
  const baseUri = settings.idPath;
  return new Promise((resolve, reject) => {
    if (settings.mockDisplay === true) {
      window.lxlInfo('🎭 MOCKING DISPLAY FILE - Using file from local definitions repository');
      resolve(require('@/../../../../definitions/source/vocab/display.jsonld'));
    } else {
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
    }
  });
}

function getValueByLang(item, propertyId, displayDefs, langCode, context) {
  const translatedValue = tryGetValueByLang(item, propertyId, langCode, context);
  return translatedValue != null ? translatedValue : item[propertyId];
}

function tryGetValueByLang(item, propertyId, langCode, context) {
  if (!langCode || typeof langCode === 'undefined') {
    throw new Error('tryGetValueByLang was called with an undefined language code.');
  }
  const byLangKey = VocabUtil.getMappedPropertyByContainer(propertyId, '@language', context);
  
  return byLangKey && item[byLangKey] && item[byLangKey][langCode]
    ? item[byLangKey][langCode]
    : null;
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
    // Add extensions
    let extension = [];
    for (let i = 0; i < props.length; i++) {
      if (props[i] === 'fresnel:super') {
        if (lensGroups[level].lenses.hasOwnProperty(className) && lensGroups[level].lenses[className].hasOwnProperty('fresnel:extends')) {
          const extensionLensId = lensGroups[level].lenses[className]['fresnel:extends']['@id'];
          const extensionLens = getLensById(extensionLensId, displayDefinitions);
          extension = extensionLens.showProperties;
          // window.lxlWarning(`👁️ Lens for class '${className}' (${level}) was extended from '${extensionLensId}' with properties: ${extension}`);
          props.splice(i, 1, ...extension);
        } else {
          window.lxlWarning(`👁️ Lens for class '${className}' was asked to extend another lens with 'fresnel:super', but is missing the 'fresnel:extends' property.`);
        }
        break;
      }
    }
  } else {
    const termObj = VocabUtil.getTermObject(className, vocab, context);
    if (typeof termObj !== 'undefined' && termObj.hasOwnProperty('subClassOf')) {
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
  // Add @type
  if (level === 'cards') {
    props = ['@type'].concat(props);
  }
  props = uniq(props);
  const propsWithTranslatedObjects = [];
  for (let i = 0; i < props.length; i++) {
    if (isObject(props[i])) {
      const translated = translateObjectProp(props[i], context);
      if (translated !== null) {
        propsWithTranslatedObjects[i] = translated;
      }
    } else {
      propsWithTranslatedObjects[i] = props[i];
    }
  }
  return propsWithTranslatedObjects;
}

export function translateObjectProp(object) {
  if (object.hasOwnProperty('inverseOf')) {
    return `@reverse/${object.inverseOf}`;
  }
  return null;
}

/* eslint-disable no-use-before-define */
export function getItemLabel(item, displayDefs, quoted, vocab, settings, context, inClass = '') {
  const displayObject = getChip(item, displayDefs, quoted, vocab, settings, context);
  if (Object.keys(displayObject).length === 0) {
    return JSON.stringify(item);
  }
  let rendered = StringUtil.formatLabel(displayObject).trim();
  if (item['@type'] && VocabUtil.isSubClassOf(item['@type'], 'Identifier', vocab, context)) {
    if (inClass.toLowerCase() !== item['@type'].toLowerCase()) {
      const translatedType = StringUtil.getLabelByLang(item['@type'], settings.language, vocab, context);
      rendered = `${translatedType} ${rendered}`;
    }
  }
  return rendered;
}

export function getSortedProperties(formType, formObj, settings, resources) {
  const propertyList = getDisplayProperties(
    formType,
    resources.display,
    resources.vocab,
    settings,
    resources.context,
    'full',
  );
  each(formObj, (v, k) => {
    if (!includes(propertyList, k)) {
      propertyList.push(k);
    }
  });
  remove(propertyList, k => (settings.hiddenProperties.indexOf(k) !== -1));
  return propertyList;
}

export function getItemToken(item, displayDefs, quoted, vocab, settings, context) {
  const displayObject = getToken(item, displayDefs, quoted, vocab, settings, context);
  let rendered = StringUtil.formatLabel(displayObject).trim();
  if (item['@type'] && VocabUtil.isSubClassOf(item['@type'], 'Identifier', vocab, context)) {
    const translatedType = StringUtil.getLabelByLang(item['@type'], settings.language, vocab, context);
    rendered = `${translatedType} ${rendered}`;
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
  const displayType = isArray(trueItem['@type']) ? trueItem['@type'][0] : trueItem['@type']; // If more than one type, choose the first
  const properties = getDisplayProperties(displayType, displayDefs, vocab, settings, context, level);
  // Start filling the object with the selected properties
  if (properties.length === 2 && properties.indexOf('label') > -1 && properties.indexOf('prefLabel') > -1) {
    const labelValue = getValueByLang(trueItem, 'label', displayDefs, settings.language, context);
    const prefLabelValue = getValueByLang(trueItem, 'prefLabel', displayDefs, settings.language, context);
    if (typeof prefLabelValue !== 'undefined') {
      result.prefLabel = prefLabelValue;
    } else if (labelValue !== 'undefined') {
      result.label = labelValue;
    }
  } else {
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
          result[property] = `{${StringUtil.getLabelByLang(trueItem['@type'], settings.language, vocab, context)} ${StringUtil.getUiPhraseByLang('without', settings.language)} ${expectedClassName.toLowerCase()}}`;
        }
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
  const token = { rendered: '' };
  Object.keys(tokenObj).forEach((key) => {
    token.rendered += ` ${tokenObj[key]}`;
  });
  return token;
}

export function getCard(item, displayDefs, quoted, vocab, settings, context) {
  return getDisplayObject(item, 'cards', displayDefs, quoted, vocab, settings, context);
}
/* eslint-enable no-use-before-define */

export function getItemSummary(item, displayDefs, quoted, vocab, settings, context, excludeProperties = []) {
  const card = getCard(item, displayDefs, quoted, vocab, settings, context);
  if (excludeProperties.length > 0) {
    for (let i = 0; i < excludeProperties.length; i++) {
      delete card[excludeProperties[i]];
    }
  }
  const cardDisplayGroups = require('@/resources/json/displayGroups.json').card;
  const summary = {
    categorization: [],
    header: [],
    info: [],
  };
  each(card, (value, key) => {
    if (value !== null) {
      const v = isArray(value) ? value : [value];
      if (cardDisplayGroups.header.indexOf(key) !== -1) {
        summary.header.push({ property: key, value: v });
      } else if (cardDisplayGroups.categorization.indexOf(key) !== -1) {
        summary.categorization.push({ property: key, value: v });
      } else {
        const translated = tryGetValueByLang(item, key, settings.language, context);
        const itemValue = translated !== null ? translated : item[key];
        summary.info.push({ property: key, value: isArray(itemValue) ? itemValue : [itemValue] });
      }
    }
  });
  if (summary.header.length === 0) {
    summary.header.push({ property: 'error', value: `{${StringUtil.getUiPhraseByLang('Unnamed', settings.language)}}` });
  }
  return summary;
}

export function getLabelWithTreeDepth(term, settings, vocab, context) {
  const maxLength = 43;
  let labelByLang = StringUtil.getLabelByLang(term.id, settings.language, vocab, context);
  if (labelByLang.length > maxLength) {
    labelByLang = `${labelByLang.substr(0, maxLength - 2)}...`;
  }
  const abstractIndicator = ` {${StringUtil.getUiPhraseByLang('Abstract', settings.language)}}`;
  const indent = Array(term.depth + 1).join('- ');
  return `${indent}${labelByLang} ${term.abstract ? abstractIndicator : ''}`;
}
