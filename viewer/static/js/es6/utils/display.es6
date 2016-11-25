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
  let displayObject = {};

  // If item is a link reference, get the true item
  let trueItem = item;
  if (trueItem.hasOwnProperty('@id') && !trueItem.hasOwnProperty('@type')) {
    trueItem = EditUtil.getLinked(trueItem['@id'], linked);
  }
  if (!trueItem.hasOwnProperty('@type') && trueItem.hasOwnProperty('@id')) {
    console.warn('Tried to get linked but failed', 'id was', trueItem['@id']);
    return trueItem;
  }

  // Get the list of properties we want to show
  let properties = getProperties(trueItem['@type'], level, displayDefs);
  let baseClassUsed = trueItem['@type'];
  if (properties.length === 0) { // If none were found, traverse up inheritance tree
    const baseClasses = VocabUtil.getBaseClassesFromArray(trueItem['@type'], vocab, vocabPfx);
    for (let i = 0; i < baseClasses.length; i++) {
      if (typeof baseClasses[i] !== 'undefined') {
        properties = getProperties(baseClasses[i].replace(vocabPfx, ''), level, displayDefs);
        if (properties.length > 0) {
          baseClassUsed = `${baseClasses[i].replace(vocabPfx, '')} (through ${trueItem['@type']})`;
          break;
        }
      }
    }
    if (properties.length === 0) {
      properties = getProperties('Resource', 'chips', displayDefs);
    }
  }

  // For each property, get the value from original item
  if (level === 'cards') {
    properties = ['@type'].concat(properties);
  }

  for (let i = 0; i < properties.length; i++) {
    if (!_.isObject(properties[i])) {
      if (typeof trueItem[properties[i]] !== 'undefined') {
        let value = trueItem[properties[i]];
        if (_.isObject(value) && !_.isArray(value)) {
          if (level === 'cards') {
            value = getDisplayObject(value, 'chips', displayDefs, linked, vocab, vocabPfx);
          }
        }
        if (_.isArray(value)) {
          let arrString = '';
          for (let x = 0; x < value.length; x++) {
            if (_.isObject(value[x])) {
              arrString += JSON.stringify(value[x]);
            } else {
              arrString += value[x];
            }
          }
          value = arrString;
        }
        displayObject[properties[i]] = value;
      }
    }
  }
  if (_.isEmpty(displayObject)) {
    displayObject = item;
  }
  return displayObject;
}

export function getChip(item, displayDefs, linked, vocab, vocabPfx) {
  return getDisplayObject(item, 'chips', displayDefs, linked, vocab, vocabPfx);
}

export function getCard(item, displayDefs, linked, vocab, vocabPfx) {
  return getDisplayObject(item, 'cards', displayDefs, linked, vocab, vocabPfx);
}
