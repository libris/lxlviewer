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
  let displayObject = {};

  // If item is a link reference, get the true item
  let trueItem = item;
  if (trueItem.hasOwnProperty('@id') && !trueItem.hasOwnProperty('@type')) {
    trueItem = EditUtil.getLinked(trueItem['@id'], linked);
  }
  // console.log("Generating displayObject for:", JSON.stringify(trueItem));

  // Get the list of properties we want to show
  let properties = getProperties(trueItem['@type'], level, displayDefs);
  let baseClassUsed = trueItem['@type'];
  if (properties.length === 0) { // If none were found, traverse up inheritance tree
    const baseClasses = VocabUtil.getBaseClassesFromArray(trueItem['@type'], vocab, vocabPfx);
    for (let i = 0; i < baseClasses.length; i++) {
      properties = getProperties(baseClasses[i].replace(vocabPfx, ''), level, displayDefs);
      if (properties.length > 0) {
        // console.log('Used card definition for', JSON.stringify(baseClasses[i]));
        baseClassUsed = `${baseClasses[i].replace(vocabPfx, '')} (through ${trueItem['@type']})`;
        break;
      }
    }
    if (properties.length === 0) {
      // console.log('Used card definition for', "Resource", "(Fallback)");
      properties = getProperties('Resource', 'chips', displayDefs);
      // console.log(JSON.stringify(properties));
    }
  } else {
    // console.log('Used card definition for', JSON.stringify(baseClassUsed));
  }

  // For each property, get the value from original item
  // console.log("Checking if present on item:");
  for (let i = 0; i < properties.length; i++) {
    if (typeof trueItem[properties[i]] !== 'undefined') {
      // console.log("✔ ", properties[i]);
      displayObject[properties[i]] = trueItem[properties[i]];
    } else {
      // console.log("x ", properties[i]);
    }
  }


  for (const key in displayObject) {
    if (level === 'chips') {
      // TODO: Fix language bug
      break;
    }
    if (_.isArray(displayObject[key])) {
      for (let i = 0; i < displayObject[key].length; i++) {
        if (_.isObject(displayObject[key][i])) {
          // console.log("in", displayObject[key][i]);
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
  // console.log("getDisplayObject is returning:", JSON.stringify(displayObject));
  return displayObject;
}

export function getChip(item, displayDefs, linked, vocab, vocabPfx) {
  let obj = getDisplayObject(item, 'chips', displayDefs, linked, vocab, vocabPfx);
  // if (!_.isObject(obj)) {
  //   obj = { 'label' : item[0] };
  // }
  return obj;
}

export function getCard(item, displayDefs, linked, vocab, vocabPfx) {
  return getDisplayObject(item, 'cards', displayDefs, linked, vocab, vocabPfx);
}
