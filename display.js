import { cloneDeep, each, isObject, uniq, includes, remove, isArray, isEmpty, uniqWith, isEqual } from 'lodash-es';
import * as VocabUtil from './vocab';
import * as StringUtil from './string';
import { lxlLog, lxlWarning } from './debug';

export function expandInherited(display) {
  const cloned = cloneDeep(display);

  const lensesById = {};
  each(cloned.lensGroups, (lensGroup) => {
    each(lensGroup.lenses, (lens) => {
      if (lens.hasOwnProperty('@id')) {
        lensesById[lens['@id']] = lens;
      }
    });
  });

  const flattenedProps = (lens, hierarchy) => {
    if (lens['@id'] && hierarchy.indexOf(lens['@id']) !== -1) {
      throw new Error(`fresnel:extends inheritance loop: ${hierarchy}`);
    }

    if (lens.showProperties.indexOf('fresnel:super') === -1) {
      return lens.showProperties;
    }
    
    if (!lens['fresnel:extends'] || !lens['fresnel:extends']['@id']) {
      lxlWarning(`👁️ Use of 'fresnel:super' without 'fresnel:extends': ${JSON.stringify(lens)}.`);
      return lens.showProperties;
    }
    const extendId = lens['fresnel:extends']['@id'];
    if (!lensesById[extendId]) {
      lxlWarning(`👁️ Could not find lens with id '${extendId}' used in 'fresnel:extends': ${JSON.stringify(lens)}.`);
      return lens.showProperties;
    }
      
    if (lens['@id']) {
      hierarchy.push(lens['@id']);
    }
    lens.showProperties.splice(
      lens.showProperties.indexOf('fresnel:super'),
      1,
      ...flattenedProps(lensesById[extendId], hierarchy),
    );
    return lens.showProperties;
  };

  each(cloned.lensGroups, (lensGroup) => {
    each(lensGroup.lenses, (lens) => {
      lens.showProperties = uniqWith(flattenedProps(lens, []), isEqual);
    });
  });
  return cloned;
}

function getValueByLang(item, propertyId, langCode, context) {
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
export function getLensPropertiesDeep(className, resources, settings, level, depth) {
  let props = [];
  const lensGroups = resources.display.lensGroups;
  if (lensGroups.hasOwnProperty(level) && lensGroups[level].lenses.hasOwnProperty(className)) {
    props = lensGroups[level].lenses[className].showProperties;
  } else {
    const termObj = VocabUtil.getTermObject(className, resources.vocab, resources.context);
    if (typeof termObj !== 'undefined' && termObj.hasOwnProperty('subClassOf')) {
      const ownClasses = VocabUtil.filterOwnClasses(termObj.subClassOf, resources.context);
      if (ownClasses.length > 0) {
        props = getDisplayProperties(ownClasses[0]['@id'], resources, settings, level, depth + 1);
      }
    }
  }
  return props;
}

export function getDisplayProperties(className, resources, settings, inputLevel, depth = 0) {
  if (!className || typeof className === 'undefined') {
    throw new Error('getDisplayProperties was called with an undefined type.');
  }
  if (isObject(className) && !isArray(className)) {
    throw new Error(
      'getDisplayProperties was called with an object as type parameter (should be a string).',
    );
  }
  const cn = StringUtil.getCompactUri(className, resources.context);
  let level = inputLevel;
  let props = [];

  // If we want tokens, we traverse them first, since they can "fail"
  if (level === 'tokens') {
    props = getLensPropertiesDeep(cn, resources, settings, level, depth);
    if (props.length === 0 && depth === 0) {
      // If we wanted tokens and got nothing, change level to "chips"
      // We only want to "sidestep" if depth is 0.
      level = 'chips';
    }
  }
  // If level is not tokens 
  if (level !== 'tokens') {
    props = getLensPropertiesDeep(cn, resources, settings, level, depth);
  }
  props = uniq(props);
  const propsWithTranslatedObjects = [];
  for (let i = 0; i < props.length; i++) {
    if (isObject(props[i])) {
      const translated = translateObjectProp(props[i]);
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
  if (object.hasOwnProperty('alternateProperties')) {
    return object;
  }
  return null;
}

/* eslint-disable no-use-before-define */
export function getItemLabel(item, resources, quoted, settings, inClass = '') {
  if (typeof item === 'string') {
    // Assume this is already a label.
    return item;
  }
  if (!item || typeof item === 'undefined') {
    throw new Error('getItemLabel was called with an undefined object.');
  }
  if (!isObject(item)) {
    throw new Error(`getItemLabel was called with a non-object. Type: ${typeof item}. Value: ${item}`);
  }
  const displayObject = getChip(item, resources, quoted, settings);
  if (Object.keys(displayObject).length === 0) {
    return JSON.stringify(item);
  }
  let rendered = StringUtil.formatLabel(displayObject).trim();
  if (item['@type'] && VocabUtil.isSubClassOf(item['@type'], 'Identifier', resources.vocab, resources.context)) {
    if (item['@type'] === 'ISNI' || item['@type'] === 'ORCID') { 
      rendered = formatIsni(rendered);
    }

    if (inClass.toLowerCase() !== item['@type'].toLowerCase()) {
      const translatedType = StringUtil.getLabelByLang(item['@type'], settings.language, resources);
      rendered = `${translatedType} ${rendered}`;
    }
  }
  return rendered;
}

export function formatIsni(isni) {
  return typeof isni === 'string' && isni.length === 16
    ? `${isni.slice(0, 4)} ${isni.slice(4, 8)} ${isni.slice(8, 12)} ${isni.slice(12, 16)}`
    : isni;
}

export function getSortedProperties(formType, formObj, settings, resources) {
  const propertyList = getDisplayProperties(
    formType,
    resources,
    settings,
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

export function getItemToken(item, resources, quoted, settings) {
  const displayObject = getToken(item, resources, quoted, settings);
  let rendered = StringUtil.formatLabel(displayObject).trim();
  if (item['@type'] && VocabUtil.isSubClassOf(item['@type'], 'Identifier', resources.vocab, resources.context)) {
    const translatedType = StringUtil.getLabelByLang(item['@type'], settings.language, resources);
    rendered = `${translatedType} ${rendered}`;
  }
  return rendered;
}

export function getDisplayObject(item, level, resources, quoted, settings) {
  // Some checks before we even start
  if (!item || typeof item === 'undefined') {
    throw new Error('getDisplayObject was called with an undefined object.');
  }
  if (!isObject(item)) {
    throw new Error(`getDisplayObject was called with a non-object. (Was ${typeof item})`);
  }

  // Setup
  let result = {};
  let trueItem = Object.assign(...item);

  // Is this a link?
  if (trueItem.hasOwnProperty('@id') && !trueItem.hasOwnProperty('@type')) {
    if (trueItem['@id'] === 'https://id.kb.se/vocab/') {
      return {};
    }
    // If we have the entity in quoted, replace our link-object with the entity
    if (quoted && quoted.hasOwnProperty(trueItem['@id'])) {
      trueItem = quoted[trueItem['@id']];
    }

    // Plan to try and fetch missing data?
    // trueItem = DataUtil.getEmbellished(trueItem['@id'], quoted);

    // If the item lacks a type, just return it as an anonymous object with a label
    if (!trueItem.hasOwnProperty('@type') && trueItem.hasOwnProperty('@id')) {
      return { label: StringUtil.removeDomain(trueItem['@id'], settings.removableBaseUris) };
    }
  }

  if (!trueItem.hasOwnProperty('@type') || typeof trueItem['@type'] === 'undefined') {
    return {}; // Early fail
  }

  // Get the list of properties we want to show
  const displayType = isArray(trueItem['@type']) ? trueItem['@type'][0] : trueItem['@type']; // If more than one type, choose the first
  const properties = getDisplayProperties(displayType, resources, settings, level);

  // Start filling the object with the selected properties
  if (properties.length === 2 && properties.indexOf('label') > -1 && properties.indexOf('prefLabel') > -1) {
    // This first block can probably be replace by alternateProperties at some point
    const labelValue = getValueByLang(trueItem, 'label', settings.language, resources.context);
    const prefLabelValue = getValueByLang(trueItem, 'prefLabel', settings.language, resources.context);
    if (typeof prefLabelValue !== 'undefined') {
      result.prefLabel = prefLabelValue;
    } else if (labelValue !== 'undefined') {
      result.label = labelValue;
    }
  } else {
    properties.forEach((property) => {
      if (!isObject(property)) {
        let valueOnItem = '';
        valueOnItem = getValueByLang(trueItem, property, settings.language, resources.context);

        if (typeof valueOnItem !== 'undefined') {
          let value = valueOnItem;
          if (isObject(value) && !isArray(value)) {
            if (level === 'chips') {
              value = getItemToken(value, resources, quoted, settings);
            } else {
              value = getItemLabel(value, resources, quoted, settings, property);
            }
          } else if (isArray(value)) {
            const newArray = [];
            for (const arrayItem of value) {
              if (typeof arrayItem === 'undefined' || arrayItem === null) {
                throw new Error('getDisplayObject encountered an undefined or null item in an array.');
              }
              if (isObject(arrayItem) && (Object.keys(arrayItem).length > 1 || arrayItem[Object.keys(arrayItem)[0]] !== '')) {
                if (level === 'chips') {
                  newArray.push(getItemToken(arrayItem, resources, quoted, settings));
                } else {
                  newArray.push(getItemLabel(arrayItem, resources, quoted, settings, property));
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
        } else if (properties.length < 3 && properties.indexOf(property) === 0) {
          const rangeOfMissingProp = VocabUtil.getRange(property, resources.vocab, resources.context);
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
            resources,
          );
          result[property] = `{${StringUtil.getLabelByLang(trueItem['@type'], settings.language, resources)} ${StringUtil.getUiPhraseByLang('without', settings.language)} ${expectedClassName.toLowerCase()}}`;
        }
      } else {
        // Property is object, lets calculate that
        if (property.hasOwnProperty('alternateProperties')) {
          // Handle alternateProperties
          for (const p of property.alternateProperties) {
            if (typeof p === 'string' && trueItem.hasOwnProperty(p)) {
              result[p] = trueItem[p];
              lxlLog('Calculating alternate properties for', trueItem['@type'], 'choosing between', property.alternateProperties, 'and found', p);
              break;
            }
          }
        }
      }
    });
  }

  const itemKeys = Object.keys(result);
  if (isEmpty(result) || (itemKeys.length === 1 && (typeof result[itemKeys[0]] === 'undefined' || result[itemKeys[0]] === null || result[itemKeys[0]].length === 0))) {
    lxlWarning(`🏷️ DisplayObject was empty. @type was ${trueItem['@type']}.`, 'Item data:', trueItem);
    if (trueItem.hasOwnProperty('@id')) {
      const idParts = item['@id'].split('/');
      result = { label: idParts[idParts.length - 1] };
    } else {
      result = { label: `{${StringUtil.getUiPhraseByLang('Unnamed', settings.language, resources.i18n)}}` };
    }
  }
  return result;
}

export function getChip(item, resources, quoted, settings) {
  return getDisplayObject(item, 'chips', resources, quoted, settings);
}

export function getToken(item, resources, quoted, settings) {
  const tokenObj = getDisplayObject(item, 'tokens', resources, quoted, settings);
  const token = { rendered: '' };
  Object.keys(tokenObj).forEach((key) => {
    token.rendered += ` ${tokenObj[key]}`;
  });
  return token;
}

export function getCard(item, resources, quoted, settings) {
  return getDisplayObject(item, 'cards', resources, quoted, settings);
}
/* eslint-enable no-use-before-define */

export function getItemSummary(item, resources, quoted, settings, excludeProperties = []) {
  const card = getCard(item, resources, quoted, settings);
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
      if (cardDisplayGroups.header.includes(key)) {
        summary.header.push({ property: key, value: v });
      } else if (cardDisplayGroups.categorization.includes(key)) {
        summary.categorization.push({ property: key, value: v });
      } else if (cardDisplayGroups.hidden.includes(key)) {
        // drop it
      } else {
        const translated = tryGetValueByLang(item, key, settings.language, resources.context);
        const itemValue = translated !== null ? translated : item[key];
        summary.info.push({ property: key, value: isArray(itemValue) ? itemValue : [itemValue] });
      }
    }
  });
  if (summary.header.length === 0) {
    summary.header.push({ property: 'error', value: `{${StringUtil.getUiPhraseByLang('Unnamed', settings.language, resources.i18n)}}` });
  }
  return summary;
}

export function getLabelWithTreeDepth(term, settings, resources) {
  const maxLength = 43;
  let labelByLang = StringUtil.getLabelByLang(term.id, settings.language, resources);
  if (labelByLang.length > maxLength) {
    labelByLang = `${labelByLang.substr(0, maxLength - 2)}...`;
  }
  const abstractIndicator = ` {${StringUtil.getUiPhraseByLang('Abstract', settings.language, resources.i18n)}}`;
  const indent = Array(term.depth + 1).join('- ');
  return `${indent}${labelByLang} ${term.abstract ? abstractIndicator : ''}`;
}
