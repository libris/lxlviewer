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
  const lenses = displayDefs.lensGroups[level].lenses;
  let props = [];
  if (typeof lenses[type] !== 'undefined') {
    props = lenses[type].showProperties;
  }
  return props;
}

export function getDisplayObject(item, level, displayDefs, linked, vocab, vocabPfx) {
  let trueItem = item;
  let displayObject = {};
  if (trueItem.hasOwnProperty('@id') && !trueItem.hasOwnProperty('@type')) {
    trueItem = EditUtil.getLinked(trueItem['@id'], linked);
  }
  let properties = getProperties(trueItem['@type'], level, displayDefs);
  let baseClassUsed = trueItem['@type'];
  if (properties.length === 0) {
    const baseClasses = VocabUtil.getBaseClasses(trueItem['@type'], vocab, vocabPfx);
    for (let i = 0; i < baseClasses.length; i++) {
      properties = getProperties(baseClasses[i].replace(vocabPfx, ''), level, displayDefs);
      if (properties.length > 0) {
        baseClassUsed = baseClasses[i].replace(vocabPfx, '') + ' (through ' + trueItem['@type'] + ')';
        break;
      }
    }
  }
  for (let i = 0; i < properties.length; i++) {
    if (typeof trueItem[properties[i]] !== 'undefined') {
      displayObject[properties[i]] = trueItem[properties[i]];
    }
  }

  for (const key in displayObject) {
    if (_.isArray(displayObject[key])) {
      for (let i = 0; i < displayObject[key].length; i++) {
        if (_.isObject(displayObject[key][i])) {
          displayObject[key][i] = getChip(displayObject[key][i], displayDefs, linked, vocab, vocabPfx);
        }
      }
    } else if (_.isEmpty(displayObject[key]) || _.isObject(displayObject[key])) {
      displayObject[key] = getChip(trueItem[key], displayDefs, linked, vocab, vocabPfx);
    }
  }
  if (_.isEmpty(displayObject)) {
    displayObject = 'CHIP(type is ' + baseClassUsed + ',' + JSON.stringify(properties) + ')';
  }
  return displayObject;
}

export function getChip(item, displayDefs, linked, vocab, vocabPfx) {
  let obj = getDisplayObject(item, 'chips', displayDefs, linked, vocab, vocabPfx);
  return obj;
}

export function getCard(item, displayDefs, linked, vocab, vocabPfx) {
  return getDisplayObject(item, 'cards', displayDefs, linked, vocab, vocabPfx);
}
