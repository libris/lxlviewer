import * as _ from 'lodash';
import * as httpUtil from './http';
import * as EditUtil from './edit';
import * as VocabUtil from './vocab';

function fetchDisplayDefinitions() {
  return new Promise((resolve, reject) => {
    httpUtil.get({ url: 'https://id.kb.se/vocab/display', accept: 'application/ld+json' }).then((response) => {
      resolve(response);
    }, (error) => {
      reject(`Couldn't fetch display definitions: ${error}`);
    });
  });
}

export function getDisplayDefinitions() {
  // 8 hours
  const cacheTTL = 28800000;

  return new Promise((resolve, reject) => {
    const displayDefs = JSON.parse(localStorage.getItem('display'));

    let isFresh = false;
    if (displayDefs) {
      isFresh = (new Date().getTime() - displayDefs.cacheTime < cacheTTL);
    }

    if (displayDefs && isFresh) {
      resolve(displayDefs);
    } else {
      fetchDisplayDefinitions().then((result) => {
        const fetchedDisplayDefs = result;
        fetchedDisplayDefs.cacheTime = new Date().getTime();
        localStorage.setItem('display', JSON.stringify(fetchedDisplayDefs));
        resolve(fetchedDisplayDefs);
      }, (error) => {
        reject(error);
      });
    }
  });
}

export function getProperties(type, level, displayDefs) {
  if (!type || typeof type === 'undefined') {
    throw new Error('getProperties was called with an undefined type.');
  }
  if (_.isObject(type)) {
    throw new Error(
      'getProperties was called with an object as type parameter (should be a string).'
    );
  }
  const lenses = displayDefs.lensGroups[level].lenses;
  let props = [];
  if (typeof lenses[type] !== 'undefined') {
    props = lenses[type].showProperties;
  }
  props = [].concat(props);
  _.remove(props, (x) => _.isObject(x));
  return props;
}

export function getDisplayObject(item, level, displayDefs, linked, vocab, vocabPfx) {
  if (!item || typeof item === 'undefined') {
    throw new Error('getDisplayObject was called with an undefined object.');
  }
  if (!_.isObject(item)) {
    throw new Error('getDisplayObject was called with a non-object.');
  }
  let result = {};
  let trueItem = Object.assign({}, item);

  if (trueItem.hasOwnProperty('@id') && !trueItem.hasOwnProperty('@type')) {
    trueItem = EditUtil.getLinked(trueItem['@id'], linked);
  }
  if (!trueItem.hasOwnProperty('@type') && trueItem.hasOwnProperty('@id')) {
    console.warn('Tried to get linked but failed', 'id was', trueItem['@id']);
    return { 'label': 'N/A' };
  }

  // Get the list of properties we want to show
  let properties = getProperties(trueItem['@type'], level, displayDefs);
  if (properties.length === 0) { // If none were found, traverse up inheritance tree
    const baseClasses = VocabUtil.getBaseClassesFromArray(trueItem['@type'], vocab, vocabPfx);
    for (let i = 0; i < baseClasses.length; i++) {
      if (typeof baseClasses[i] !== 'undefined') {
        properties = getProperties(baseClasses[i].replace(vocabPfx, ''), level, displayDefs);
        if (properties.length > 0) {
          break;
        }
      }
    }
    if (properties.length === 0) {
      properties = getProperties('Resource', 'chips', displayDefs);
    }
  }

  if (level === 'cards') {
    properties = ['@type'].concat(properties);
  }

  for (let i = 0; i < properties.length; i++) {
    if (!_.isObject(properties[i])) {
      if (typeof trueItem[properties[i]] !== 'undefined') {
        let value = trueItem[properties[i]];
        if (_.isObject(value) && !_.isArray(value)) {
          value = getChip(value, displayDefs, linked, vocab, vocabPfx);
          // value = getDisplayObject(value, 'chips', displayDefs, linked, vocab, vocabPfx);
        } else if (_.isArray(value)) {
          const newArray = [];
          for (const arrayItem of value) {
            if (_.isObject(arrayItem)) {
              newArray.push(getChip(arrayItem, displayDefs, linked, vocab, vocabPfx));
            } else {
              newArray.push(arrayItem);
            }
          }
          value = newArray;
        }
        result[properties[i]] = value;
      }
    }
  }
  if (_.isEmpty(result)) {
    result = { 'label': 'N/A' };
  }
  if (Object.keys(result).length === 1) {
    result = {
      'label' : result[Object.keys(result)[0]]
    }
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

export function getChip(item, displayDefs, linked, vocab, vocabPfx) {
  const displayObject = getDisplayObject(item, 'chips', displayDefs, linked, vocab, vocabPfx);
  const rendered = extractStrings(displayObject);
  return rendered;
}

export function getCard(item, displayDefs, linked, vocab, vocabPfx) {
  return getDisplayObject(item, 'cards', displayDefs, linked, vocab, vocabPfx);
}
