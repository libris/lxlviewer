import { cloneDeep, each, isObject, uniq, includes, remove, isArray, isEmpty, uniqWith, isEqual, get, indexOf, map, flatten, sortBy, filter, toPairs, first } from 'lodash-es';
import * as VocabUtil from './vocab';
import * as StringUtil from './string';
import { lxlLog, lxlWarning } from './debug';

const TRANSLITERATION_SEPARATOR = '◦';

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

function getValueByLang(item, propertyId, langCode, resources) {
  const translatedValue = tryGetValueByLang(item, propertyId, langCode, resources);
  return translatedValue != null ? translatedValue : item[propertyId];
}

function tryGetValueByLang(item, propertyId, langCode, resources) {
  if (!langCode || typeof langCode === 'undefined') {
    throw new Error('tryGetValueByLang was called with an undefined language code.');
  }
  if (!item || typeof item === 'undefined') {
    throw new Error('tryGetValueByLang was called with an undefined object.');
  }
  
  if (typeof propertyId === 'string' && propertyId.startsWith('@reverse/') && propertyId !== '@reverse/itemOf') {
    return get(item, propertyId.replace(/\//g, '.'));
  }

  if (propertyId === 'rdf:type') {
    return StringUtil.getLabelByLang(get(item, '@type'), langCode, resources);
  }

  const byLangKey = VocabUtil.getMappedPropertyByContainer(propertyId, '@language', resources.context);
  
  if (byLangKey && item[byLangKey]) {
    if (item[byLangKey][langCode]) {
      return item[byLangKey][langCode];
    }
    
    // TODO: refactor language handling in lxlviewer completely
    if (!item[propertyId] && Object.keys(item[byLangKey]).length === 1) {
      const k = Object.keys(item[byLangKey])[0];
      return item[byLangKey][k];
    }

    const transliterated = first(toPairs(item[byLangKey]).filter(e => e[0].includes('Latn-t-')).sort());
    if (transliterated) {
      return transliterated[1];
    }
  }
  
  return null;
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

function formatLabel(item, type, resources) {
  const label = [];
  const formatters = resources.display.lensGroups.formatters;
  const replaceInnerDot = s => (s.replace ? s.replace(/ · /g, ', ') : s); // TODO: handle nested chips properly

  // FIXME: this should be driven by display.jsonld
  // We don't want Library and Bibliography. Could do isSubclassOf('Agent') && !isSubclassOf('Collection') but hardcode the list for now
  const isAgent = ['Person', 'Organization', 'Jurisdiction', 'Meeting', 'Family'].includes(type);
  // We don't want to touch commas inside property values when doing the final cleanup. 
  // Use a private use character as a temporary stand in for comma.
  const separator = isAgent ? '\uE000 ' : ' · ';

  const objKeys = Object.keys(item);
  for (let i = 0; i < objKeys.length; i++) {
    const key = objKeys[i];
    const value = item[key];
    
    if (value != null) {
      if (i > 0 && value.length > 0) {
        label.push(separator);
      }
      const formatter = formatters ? formatters[`${key}-format`] : null;
      if (isArray(value)) {
        if (formatter && formatter['fresnel:valueFormat'] && formatter['fresnel:valueFormat']['fresnel:contentAfter']) {
          label.push(value.join(formatter['fresnel:valueFormat']['fresnel:contentAfter']));
          if (formatter['fresnel:contentLast']) {
            label.push(formatter['fresnel:contentLast']);
          }
        } else {
          label.push(value.map(replaceInnerDot).join('\uE000 '));
        }
      } else {
        label.push(replaceInnerDot(value));
      }
    }
  }
  let labelStr = label.join('');
  // TODO: lots of punctuation for MARC going on inside some of these fields
  labelStr = labelStr.replace(/([:.\uE000])\uE000/g, '$1');
  labelStr = labelStr.replace(/\(\uE000\s?/g, '(');
  labelStr = labelStr.replace(/\uE000/g, ',');
  labelStr = labelStr.replace(/\uE001/g, '·');
  return labelStr;
}

function isStructuredValue(item, resources) {
  if (item['@type']) {
    return VocabUtil.isSubClassOf(
      item['@type'], 
      'StructuredValue', 
      resources.vocab,  
      resources.context,
    );
  }
  return false;
}

function getTransliteratedLanguages(item) {
  return Object.entries(item).reduce((acc, itemEntry) => {
    if (itemEntry[0] && itemEntry[0].includes('ByLang')) {
      const transliteratedKeys = Object.keys(itemEntry[1]).filter(key => key.includes('Latn-t-'));
      if (transliteratedKeys.length) {
        return {
          from: Object.keys(itemEntry[1]).find(key => !transliteratedKeys.includes(key)),
          to: transliteratedKeys,
        };
      }
      return {};
    }
    return acc;
  }, {});
}

/* eslint-disable no-use-before-define */
export function getItemLabel(item, resources, quoted, settings, inClass = '') {
  if (typeof item === 'string') {
    // Assume this is already a label.
    return item;
  }
  if (typeof item === 'number') {
    return `${item}`;
  }
  if (!item || typeof item === 'undefined') {
    throw new Error('getItemLabel was called with an undefined object.');
  }
  if (!isObject(item)) {
    throw new Error(`getItemLabel was called with a non-object. Type: ${typeof item}. Value: ${item}`);
  }

  const displayObject = getChip(item, resources, quoted, settings);
  const { from: transliteratedFrom, to: transliteratedTo } = isStructuredValue(item, resources) && getTransliteratedLanguages(item);
  const transliteratedFromDisplayObject = transliteratedFrom && getChip(item, resources, quoted, { ...settings, language: transliteratedFrom });
  const transliteratedToDisplayObjects = transliteratedTo && transliteratedTo.map(language => getChip(item, resources, quoted, { ...settings, language }));

  if (Object.keys(displayObject).length === 0) {
    lxlWarning('getItemLabel returned an empty string for item:', item);
    return '';
  }

  let rendered = (transliteratedFromDisplayObject && transliteratedToDisplayObjects)
    ? `${transliteratedToDisplayObjects.map(ttdo => formatLabel(ttdo, item['@type'], resources)).join(` ${TRANSLITERATION_SEPARATOR} `)} ${TRANSLITERATION_SEPARATOR} ${formatLabel(transliteratedFromDisplayObject, item['@type'], resources)}`
    : formatLabel(displayObject, item['@type'], resources);

  // let rendered = StringUtil.formatLabel(displayObject).trim();
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

// TODO: it's probably better to display type coerced properties in the same 
// way as e.g. language containers (prefLabelByLang etc) instead of as separate properties
export function getSortedProperties(formType, formObj, settings, resources) {
  let propertyList = getDisplayProperties(
    formType,
    resources,
    settings,
    'full',
  );
  
  propertyList = map(propertyList, k => get(k, 'alternateProperties', k));
  propertyList = map(propertyList, k => get(k, ['alternateProperties', 'subPropertyOf'], k));
  propertyList = uniq(flatten(propertyList));
  
  const realKey = k => get(resources, ['context', '1', k, '@id'], k); 
  each(formObj, (v, k) => {
    if (!includes(propertyList, k)) {
      const ix = indexOf(propertyList, realKey(k));
      if (ix > -1) {
        propertyList.splice(ix + 1, 0, k);
      } else {
        propertyList.push(k);  
      }
    }
  });
  
  remove(propertyList, k => (settings.hiddenProperties.indexOf(k) !== -1));

  // Sort type coerced property "groups" internally on their type label
  const rdfTypeLabel = k => StringUtil.getLabelByLang(rdfDisplayType(k, resources), settings.language, resources);
  const withLabel = map(propertyList, k => ({ k: k, l: rdfTypeLabel(k), rk: realKey(k) }));
  let ix = 0;
  let last = null;
  withLabel.forEach((m) => {
    m.ix = m.rk !== last ? ix++ : ix;
    last = m.rk;
  });
  propertyList = map(sortBy(withLabel, ['ix', 'l']), m => m.k);
  
  return propertyList;
}

export function rdfDisplayType(property, resources) {
  const type = get(resources, ['context', '1', property, '@type'], '');
  // Types such as xsd:string and @vocab don't make sense as field labels, skip them 
  return type.match(/^[^:@]*$/) ? type : '';
}

export function getItemToken(item, resources, quoted, settings) {
  if (typeof item === 'string') return item;

  const displayObject = getToken(item, resources, quoted, settings);

  const { from: transliteratedFrom, to: transliteratedTo } = isStructuredValue(item, resources) && getTransliteratedLanguages(item);
  const transliteratedFromDisplayObject = transliteratedFrom && getToken(item, resources, quoted, { ...settings, language: transliteratedFrom });
  const transliteratedToDisplayObjects = transliteratedTo && transliteratedTo.map(language => getToken(item, resources, quoted, { ...settings, language }));

  let rendered = (transliteratedFromDisplayObject && transliteratedToDisplayObjects)
    ? `${transliteratedToDisplayObjects.map(ttdo => StringUtil.formatLabel(ttdo).trim()).join(` ${TRANSLITERATION_SEPARATOR} `)} ${TRANSLITERATION_SEPARATOR} ${StringUtil.formatLabel(transliteratedFromDisplayObject).trim()}`
    : StringUtil.formatLabel(displayObject).trim();

  if (item['@type'] && VocabUtil.isSubClassOf(item['@type'], 'Identifier', resources.vocab, resources.context)) {
    const translatedType = StringUtil.getLabelByLang(item['@type'], settings.language, resources);
    rendered = `${translatedType} ${rendered}`;
  }
  return rendered;
}

export function getDisplayObject(item, level, resources, quoted, settings) {
  if (!item || typeof item === 'undefined') {
    throw new Error('getDisplayObject was called with an undefined object.');
  }
  if (!isObject(item)) {
    throw new Error(`getDisplayObject was called with a non-object. (Was ${typeof item})`);
  }

  // Setup
  let result = {};
  let trueItem = Object.assign({}, item);

  // Is this a link?
  if (trueItem.hasOwnProperty('@id') && !trueItem.hasOwnProperty('@type')) {
    if (trueItem['@id'] === 'https://id.kb.se/vocab/') {
      return {};
    }
    const termObj = VocabUtil.getTermObject(trueItem['@id'], resources.vocab, resources.context);
    if (termObj != null) {
      const label = termObj.labelByLang ? termObj.labelByLang[settings.language] : termObj.label;
      return label ? { label } : trueItem;
    }
    // If we have the entity in quoted, replace our link-object with the entity
    if (quoted && quoted.hasOwnProperty(trueItem['@id'])) {
      trueItem = quoted[trueItem['@id']];
    }

    // If the item lacks a type, just return it as an anonymous object with a label
    if (!trueItem.hasOwnProperty('@type') && trueItem.hasOwnProperty('@id')) {
      return { label: StringUtil.removeDomain(trueItem['@id'], settings.removableBaseUris || []) };
    }
  }

  if (!trueItem.hasOwnProperty('@type') || typeof trueItem['@type'] === 'undefined') {
    return {}; // Early fail
  }

  // Get the list of properties we want to show
  const displayType = isArray(trueItem['@type']) ? trueItem['@type'][0] : trueItem['@type']; // If more than one type, choose the first
  const properties = getDisplayProperties(displayType, resources, settings, level);

  // Start filling the object with the selected properties
  properties.forEach((property) => {
    if (!isObject(property)) {
      let valueOnItem = '';
      valueOnItem = getValueByLang(trueItem, property, settings.language, resources);

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
        result[property] = `{${StringUtil.getLabelByLang(displayType, settings.language, resources)} ${StringUtil.getUiPhraseByLang('without', settings.language, resources.i18n)} ${expectedClassName.toLowerCase()}}`;
      }
    } else {
      // Property is object, lets calculate that
      if (property.hasOwnProperty('alternateProperties')) {
        // Handle alternateProperties
        let foundProperty;
        for (let p of property.alternateProperties) {
          if (typeof p === 'object' && p.subPropertyOf && p.range) {
            // alternateProperties with locally defined subProperty with narrower range.
            // Example: {"subPropertyOf": "hasTitle", "range": "KeyTitle"},
            // The correct RDF semantics would be to match range against all subclasses. That is the commented out version.
            // For our current use cases we have no need for that. But we have a need to match against exactly Title without 
            // any subclasses (e.g. VariantTitle) which is actually not possible to express with this construct. 
            // So we use this broken implementation for now.
            const k = p.subPropertyOf;
            if (trueItem[k] && typeof trueItem[k] === 'object'
                // && trueItem[k]['@type'] && VocabUtil.isSubClassOf(trueItem[k]['@type'], p.range, resources.vocab, resources.context)) {
                && trueItem[k]['@type'] === p.range) {
              p = k;
            } else if (isArray(trueItem[k])) {
              // const matching = filter(trueItem[k], it => it['@type'] && VocabUtil.isSubClassOf(it['@type'], p.range, resources.vocab, resources.context));
              const matching = filter(trueItem[k], it => it['@type'] && it['@type'] === p.range);
              if (matching.length > 0) {
                if (level === 'chips') {
                  result[k] = matching.map(arrayItem => getItemToken(arrayItem, resources, quoted, settings));
                } else {
                  result[k] = matching.map(arrayItem => getItemLabel(arrayItem, resources, quoted, settings, p));
                }
                foundProperty = p;
                break;
              }
            }
          }
          
          if (typeof p === 'string') {
            if (trueItem.hasOwnProperty(p)) {
              if (typeof trueItem[p] === 'string') {
                result[p] = trueItem[p];
              } else if (level === 'chips') {
                if (isArray(trueItem[p])) {
                  result[p] = trueItem[p].map(arrayItem => getItemToken(arrayItem, resources, quoted, settings));
                } else {
                  result[p] = getItemToken(trueItem[p], resources, quoted, settings);
                }
              } else {
                if (isArray(trueItem[p])) {
                  result[p] = trueItem[p].map(arrayItem => getItemLabel(arrayItem, resources, quoted, settings, p));
                } else {
                  result[p] = getItemLabel(trueItem[p], resources, quoted, settings, p);
                }
              }
              foundProperty = p;
              break;
            } else if (trueItem.hasOwnProperty(`${p}ByLang`)) {
              result[p] = tryGetValueByLang(trueItem, p, settings.language, resources);
              foundProperty = `${p}ByLang`;
              break;
            }
          }
        }
        const str = s => JSON.stringify(s || '<nothing>').replace(/"/g, '');
        lxlLog(`Computed alternateProperties for ${trueItem['@type']}. Looked for: ${property.alternateProperties.map(str).join(', ')} | Settled on: ${str(foundProperty)}`);
      }
    }
  });

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
    // TODO: Fix handling of nested lenses. They should be rendered to strings one time in one place
    // Private use character \uE001 is replaced by '·' in formatLabel()
    const v = tokenObj[key];
    token.rendered += token.rendered ? ` \uE001 ${v}` : v;
  });
  return token;
}

export function getCard(item, resources, quoted, settings) {
  return getDisplayObject(item, 'cards', resources, quoted, settings);
}
/* eslint-enable no-use-before-define */

export function getItemSummary(item, resources, quoted, settings, displayGroups, excludeProperties = []) {
  const card = getCard(item, resources, quoted, settings);
  if (excludeProperties.length > 0) {
    for (let i = 0; i < excludeProperties.length; i++) {
      delete card[excludeProperties[i]];
    }
  }
  const cardDisplayGroups = displayGroups.card;
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
        const translated = tryGetValueByLang(item, key, settings.language, resources);
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
