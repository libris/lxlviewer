import * as _ from 'lodash';
import * as httpUtil from './http';
import * as DataUtil from './data';
import * as VocabUtil from './vocab';
import * as StringUtil from './string';
import * as displayGroups from '@/resources/json/displayGroups.json';
import * as display from '@/resources/json/display.json'; // TODO: REMOVE HARDCODED
import moment from 'moment';
import 'moment/locale/sv';
moment.locale('sv');

export function getDisplayDefinitions(baseUri) {
  return new Promise((resolve, reject) => {
    httpUtil.getResourceFromCache(`${baseUri}/vocab/display/data.jsonld`).then((result) => {
      const clonedResult = _.cloneDeep(result);
      _.each(clonedResult.lensGroups, lensGroup => {
        _.each(lensGroup.lenses, lens => {
          if (lens.hasOwnProperty('fresnel:extends')) {
            const [extendLens, extendLevel] = lens['fresnel:extends']['@id'].split('-');
            lens.showProperties.splice(
              lens.showProperties.indexOf('fresnel:super'),
              1,
              ...result.lensGroups[extendLevel].lenses[extendLens].showProperties
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
    for (const lens in displayDefs.lensGroups[collection].lenses) {
      const obj = displayDefs.lensGroups[collection].lenses[lens];
      if (obj.hasOwnProperty('@id') && obj['@id'] === id) {
        return obj;
      }
    }
  }
  return {};
}

export function getProperties(typeInput, level, displayDefs) {
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
    
    let extension = [];
    for (let i = 0;i < props.length; i++) {
      if (props[i] === 'fresnel:super') {
        extension = getLensById(lenses[type]['fresnel:extends']['@id'], displayDefs).showProperties;
        props.splice(i, 1, ...extension);
        break;
      }
    }
    props = _.uniq(props);
    _.remove(props, (x) => _.isObject(x));

    if (props.length > 0) {
      return props;
    } else if (level === 'full') { // Try fallback to card level
      props = getProperties(type, 'cards', displayDefs);
    }
    if (props.length > 0) {
      return props;
    } else if (level === 'cards') { // Try fallback to chip level
      props = getProperties(type, 'chips', displayDefs);
      if (props.length > 0) {
        return props;
      }
    }
  }
  return [];
}

export function getDisplayObject(item, level, displayDefs, quoted, vocab, settings, context) {
  if (!item || typeof item === 'undefined') {
    throw new Error('getDisplayObject was called with an undefined object.');
  }
  if (!_.isObject(item)) {
    throw new Error('getDisplayObject was called with a non-object.');
  }
  let result = {};
  let trueItem = Object.assign({}, item);

  if (trueItem.hasOwnProperty('@id') && !trueItem.hasOwnProperty('@type')) {
    trueItem = DataUtil.getEmbellished(trueItem['@id'], quoted);
    if (!trueItem.hasOwnProperty('@type') && trueItem.hasOwnProperty('@id')) {
      return { 'label': StringUtil.removeDomain(trueItem['@id'], settings.removableBaseUris) };
    }
  }

  // Get the list of properties we want to show
  let properties = [];
  let usedLensType;
  if (trueItem['@type'] && typeof trueItem['@type'] !== 'undefined') {
    usedLensType = trueItem['@type'];
    properties = getProperties(trueItem['@type'], level, displayDefs, settings);
  } else {
    return {};
  }
  if (properties.length === 0) { // If none were found, traverse up inheritance tree
    const baseClasses = VocabUtil.getBaseClassesFromArray(trueItem['@type'], vocab, context);
    for (let i = 0; i < baseClasses.length; i++) {
      if (typeof baseClasses[i] !== 'undefined') {
        properties = getProperties(StringUtil.getCompactUri(baseClasses[i], context), level, displayDefs, settings);
        if (properties.length > 0) {
          usedLensType = baseClasses[i];
          break;
        }
      }
    }
    if (properties.length === 0) {
      // No props found, default to Resource class and get those
      usedLensType = 'Resource';
      properties = getProperties('Resource', level, displayDefs, settings);
    }
  }

  if (level === 'cards') {
    properties = ['@type'].concat(properties);
  }

  // Start filling the object with the selected properties
  for (let i = 0; i < properties.length; i++) {
    if (!_.isObject(properties[i])) {
      let valueOnItem = '';
      if (properties[i] === 'created' || properties[i] === 'modified') {
        valueOnItem = moment(item[properties[i]]).format('lll');
      } else {
        valueOnItem = getValueByLang(trueItem, properties[i], displayDefs, settings.language, context);
      }
      if (typeof valueOnItem !== 'undefined') {
        let value = valueOnItem;
        if (_.isObject(value) && !_.isArray(value)) {
          value = getItemLabel(value, displayDefs, quoted, vocab, settings, context);
        } else if (_.isArray(value)) {
          const newArray = [];
          for (const arrayItem of value) {
            if (typeof arrayItem === 'undefined' || arrayItem === null) {
              throw new Error('getDisplayObject encountered an undefined or null item in an array.');
            }
            if (_.isObject(arrayItem) && (Object.keys(arrayItem).length > 1 || arrayItem[Object.keys(arrayItem)[0]] !== '')) {
              newArray.push(getItemLabel(arrayItem, displayDefs, quoted, vocab, settings, context));
            } else if (arrayItem.length > 0) {
              newArray.push(arrayItem);
            } else {
              // console.warn("Array contained unknown item", arrayItem);
            }
          }
          value = newArray;
        }
        result[properties[i]] = value;
      } else if (properties.length < 3 && i === 0) {
        const rangeOfMissingProp = VocabUtil.getRange(trueItem['@type'], properties[i], vocab, context);
        let propMissing = properties[i];
        if (
          rangeOfMissingProp.length > 1 ||
          (rangeOfMissingProp.length === 1 && rangeOfMissingProp[0] !== 'http://www.w3.org/2000/01/rdf-schema#Literal')
        ) {
          propMissing = rangeOfMissingProp[0];
        }
        const expectedClassName = StringUtil.getLabelByLang(
          propMissing, // Get the first one just to show something
          settings.language,
          vocab,
          context
        );
        result[properties[i]] = `{${expectedClassName} saknas}`;
      }
    }
  }
  if (_.isEmpty(result)) {
    window.lxlWarning(`🏷️ DisplayObject was empty. @type was ${trueItem['@type']}. Used lens: "${usedLensType}".`, 'Item data:', trueItem);
    result = { 'label': `{${StringUtil.getUiPhraseByLang('Unnamed', settings.language)}}` };
  }
  return result;
}

export function getItemSummary(item, displayDefs, quoted, vocab, settings, context) {
  const card = getCard(item, displayDefs, quoted, vocab, settings, context);
  const summary = {
    categorization: [],
    header: [],
    info: [],
    identifiers: [],
    sub: [],
  };
  _.each(card, (value, key) => {
    let v = value;
    if (!_.isArray(value)) {
      v = [value];
    }
    if (displayGroups['header'].indexOf(key) !== -1) {
      summary['header'].push({ 'property': key, value: v });
    } else if (displayGroups['info'].indexOf(key) !== -1) {
      summary['info'].push({ 'property': key, value: v });
    } else if (displayGroups['identifiers'].indexOf(key) !== -1) {
      summary['identifiers'].push({ 'property': key, value: v });
    } else if (displayGroups['categorization'].indexOf(key) !== -1) {
      summary['categorization'].push({ 'property': key, value: v });
    } else {
      summary['sub'].push({ 'property': key, value: v });
    }
  });
  if (summary['header'].length === 0) {
    summary['header'].push({ property: 'error', value: `{${StringUtil.getUiPhraseByLang('Unnamed', settings.language)}}` });
  }
  return summary;
}

export function getItemLabel(item, displayDefs, quoted, vocab, settings, context) {
  const displayObject = getChip(item, displayDefs, quoted, vocab, settings, context);
  let rendered = StringUtil.formatLabel(displayObject).trim();
  if (item['@type'] && VocabUtil.isSubClassOf(item['@type'], 'Identifier', vocab, context)) {
    rendered = `${item['@type']} ${rendered}`;
  }
  return rendered;
}

export function getChip(item, displayDefs, quoted, vocab, settings, context) {
  return getDisplayObject(item, 'chips', displayDefs, quoted, vocab, settings, context);
}

export function getCard(item, displayDefs, quoted, vocab, settings, context) {
  return getDisplayObject(item, 'cards', displayDefs, quoted, vocab, settings, context);
}

export function getFormattedSelectOption(term, settings, vocab, context) {
  const maxLength = 43;
  let labelByLang = StringUtil.getLabelByLang(term.id, settings.language, vocab, context);
  if (labelByLang.length > maxLength) {
    labelByLang = labelByLang.substr(0, maxLength-2) + '...';
  }
  const abstractIndicator = ` {${StringUtil.getUiPhraseByLang('Abstract', settings.language)}}`;
  const prefix = Array((term.depth) + 1).join(' •');
  return `${prefix} ${labelByLang} ${term.abstract ? abstractIndicator : ''}`;
}
