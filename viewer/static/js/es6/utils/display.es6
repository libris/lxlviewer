import * as _ from 'lodash';
import * as httpUtil from './http';
import * as DataUtil from './data';
import * as VocabUtil from './vocab';
import * as StringUtil from './string';
import * as displayGroups from '../displayGroups.json';
import moment from 'moment';
import 'moment/locale/sv';
moment.locale('sv');

export function getDisplayDefinitions() {
  return new Promise((resolve, reject) => {
    httpUtil.getResourceFromCache('/https://id.kb.se/vocab/display').then((result) => {
      resolve(result);
    }, (error) => {
      reject(error);
    });
  });
}

function getValueByLang(item, propertyId, displayDefs, langCode) {
  if (!langCode || typeof langCode === 'undefined') {
    throw new Error('getValueByLang was called with an undefined language code.');
  }

  // TODO: REMOVE FAKED CONTEXT, SHOULD BE PICKED UP FROM DISPLAYDEFS (see next line)
  // const context = displayDefs['@context'];
  const context = {
    "fresnel": "http://www.w3.org/2004/09/fresnel#",
      "skos": "http://www.w3.org/2004/02/skos/core#",
      "owl": "http://www.w3.org/2002/07/owl#",
      "@base": "https://id.kb.se/vocab/display",
      "@vocab": "https://id.kb.se/vocab/",
      "marc": "https://id.kb.se/marc/",
      "lensGroups": {"@id": "@graph", "@container": "@index"},
      "lenses": {"@reverse": "fresnel:group", "@container": "@index"},
      "showProperties": {"@id": "fresnel:showProperties", "@container": "@list", "@type": "@vocab"},
      "classLensDomain": {"@reverse": "displayLens", "@type": "@vocab"},
      "inverseOf": {"@id": "owl:inverseOf", "@type": "@vocab"},
      "labelByLang": {"@id": "label", "@container": "@language"},
      "commentByLang": {"@id": "comment", "@container": "@language"},
      "prefLabelByLang": {"@id": "prefLabel", "@container": "@language"},
      "altLabelByLang": {"@id": "altLabel", "@container": "@language"},
      "noteByLang": {"@id": "note", "@container": "@language"},
      "titleByLang": {"@id": "title", "@container": "@language"},
      "descriptionByLang": {"@id": "description", "@container": "@language"}
  };
  let translatedValue = item[propertyId];
  let byLangKey = '';
  for (const key in context) {
    if (context[key]['@id'] === propertyId) {
      byLangKey = key;
    }
  }
  if (item[byLangKey] && item[byLangKey][langCode]) {
    translatedValue = item[byLangKey][langCode];
  }
  return translatedValue;
}

export function getProperties(typeInput, level, displayDefs, settings) {
  if (!typeInput || typeof typeInput === 'undefined') {
    throw new Error('getProperties was called with an undefined type.');
  }
  if (_.isObject(typeInput) && !_.isArray(typeInput)) {
    throw new Error(
      'getProperties was called with an object as type parameter (should be a string or an array of strings).'
    );
  }
  const typeList = [].concat(typeInput);
  for (const type of typeList) {
    const lenses = displayDefs.lensGroups[level].lenses;
    let props = [];
    if (typeof lenses[type] !== 'undefined') {
      props = lenses[type].showProperties;
    }
    props = [].concat(props);
    _.remove(props, (x) => _.isObject(x));
    if (props.length > 0) {
      return props;
    } else if (level === 'cards') { // Try fallback to chip level
      props = getProperties(type, 'chips', displayDefs, settings);
      if (props.length > 0) {
        return props;
      }
    }
  }
  return [];
}

export function getDisplayObject(item, level, displayDefs, quoted, vocab, settings) {
  if (!item || typeof item === 'undefined') {
    throw new Error('getDisplayObject was called with an undefined object.');
  }
  if (!_.isObject(item)) {
    throw new Error('getDisplayObject was called with a non-object.');
  }
  let result = {};
  let trueItem = Object.assign({}, item);

  if (trueItem.hasOwnProperty('@id') && !trueItem.hasOwnProperty('@type')) {
    trueItem = DataUtil.getLinked(trueItem['@id'], quoted);
    if (!trueItem.hasOwnProperty('@type') && trueItem.hasOwnProperty('@id')) {
      return { 'label': StringUtil.removeDomain(trueItem['@id'], settings.removableBaseUris) };
    }
  }

  // Get the list of properties we want to show
  let properties = [];
  if (trueItem['@type'] && typeof trueItem['@type'] !== 'undefined') {
    properties = getProperties(trueItem['@type'], level, displayDefs, settings);
  } else {
    return {};
  }
  if (properties.length === 0) { // If none were found, traverse up inheritance tree
    const baseClasses = VocabUtil.getBaseClassesFromArray(trueItem['@type'], vocab, settings.vocabPfx);
    for (let i = 0; i < baseClasses.length; i++) {
      if (typeof baseClasses[i] !== 'undefined') {
        properties = getProperties(baseClasses[i].replace(settings.vocabPfx, ''), level, displayDefs, settings);
        if (properties.length > 0) {
          break;
        }
      }
    }
    if (properties.length === 0) {
      properties = getProperties('Resource', level, displayDefs, settings);
    }
  }

  if (level === 'cards') {
    properties = ['@type'].concat(properties);
  }

  for (let i = 0; i < properties.length; i++) {
    if (!_.isObject(properties[i])) {
      let valueOnItem = '';
      if (properties[i] === 'created' || properties[i] === 'modified') {
        valueOnItem = moment(item[properties[i]]).format('lll');
      } else {
        valueOnItem = getValueByLang(trueItem, properties[i], displayDefs, settings.language);
      }
      if (typeof valueOnItem !== 'undefined') {
        let value = valueOnItem;
        if (_.isObject(value) && !_.isArray(value)) {
          value = getItemLabel(value, displayDefs, quoted, vocab, settings);
          // value = getDisplayObject(value, 'chips', displayDefs, quoted, vocab, vocabPfx);
        } else if (_.isArray(value)) {
          const newArray = [];
          for (const arrayItem of value) {
            if (_.isObject(arrayItem)) {
              newArray.push(getItemLabel(arrayItem, displayDefs, quoted, vocab, settings));
            } else {
              newArray.push(arrayItem);
            }
          }
          value = newArray;
        }
        result[properties[i]] = value;
      } else if (properties.length < 3 && i === 0) {
        const rangeOfMissingProp = VocabUtil.getRange(properties[i], vocab, settings.vocabPfx);
        const expectedClassName = StringUtil.labelByLang(
          rangeOfMissingProp[0], // Get the first one just to show something
          settings.lang,
          vocab,
          settings.vocabPfx
        );
        result[properties[i]] = `[${expectedClassName} saknas]`;
      }
    }
  }
  if (_.isEmpty(result)) {
    result = { 'label': '[Unknown]' };
  }
  return result;
}

function extractStrings(obj) {
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

export function getItemSummary(item, displayDefs, quoted, vocab, settings) {

  const card = getCard(item, displayDefs, quoted, vocab, settings);
  const summary = {
    categorization: [],
    header: [],
    info: [],
    identifiers: [],
    sub: [],
  };
  _.each(card, (value, key) => {
    if (displayGroups['header'].indexOf(key) !== -1) {
      if (_.isArray(value)) {
        summary['header'] = summary['header'].concat(value);
      } else {
        summary['header'].push(value);
      }
    } else if (displayGroups['info'].indexOf(key) !== -1) {
      summary['info'].push(value);
    } else if (displayGroups['identifiers'].indexOf(key) !== -1) {
      if (_.isArray(value)) {
        summary['identifiers'] = summary['identifiers'].concat(value);
      } else {
        summary['identifiers'].push(value);
      }
    } else if (displayGroups['categorization'].indexOf(key) !== -1) {
      if (_.isArray(value)) {
        summary['categorization'] = summary['categorization'].concat(value);
      } else {
        summary['categorization'].push(value);
      }
    } else {
      if (_.isArray(value)) {
        summary['sub'] = summary['sub'].concat(value);
      } else {
        summary['sub'].push(value);
      }
    }
  });
  return summary;
}

export function getItemLabel(item, displayDefs, quoted, vocab, settings) {
  const displayObject = getChip(item, displayDefs, quoted, vocab, settings);
  const rendered = extractStrings(displayObject).trim();
  return rendered;
}

export function getChip(item, displayDefs, quoted, vocab, settings) {
  return getDisplayObject(item, 'chips', displayDefs, quoted, vocab, settings);
}

export function getCard(item, displayDefs, quoted, vocab, settings) {
  return getDisplayObject(item, 'cards', displayDefs, quoted, vocab, settings);
}
