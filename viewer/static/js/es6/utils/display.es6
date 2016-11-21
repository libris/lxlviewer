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
  //
  // If item is a link reference, get the true item
  let trueItem = item;
  if (trueItem.hasOwnProperty('@id') && !trueItem.hasOwnProperty('@type')) {
    trueItem = EditUtil.getLinked(trueItem['@id'], linked);
  }
  if (!trueItem.hasOwnProperty('@type') && trueItem.hasOwnProperty('@id')) {
    console.warn('Tried to get linked but failed', 'id was', trueItem['@id']);
    return trueItem;
  }
  // displayObject = trueItem;
  // console.log("-------------------------------------------------");
  // console.log("Generating displayObject for:", JSON.stringify(trueItem));

  // Get the list of properties we want to show
  let properties = getProperties(trueItem['@type'], level, displayDefs);
  let baseClassUsed = trueItem['@type'];
  if (properties.length === 0) { // If none were found, traverse up inheritance tree
    const baseClasses = VocabUtil.getBaseClassesFromArray(trueItem['@type'], vocab, vocabPfx);
    for (let i = 0; i < baseClasses.length; i++) {
      if (typeof baseClasses[i] !== 'undefined') {
        properties = getProperties(baseClasses[i].replace(vocabPfx, ''), level, displayDefs);
        if (properties.length > 0) {
          // console.log('Used card definition for', JSON.stringify(baseClasses[i]));
          baseClassUsed = `${baseClasses[i].replace(vocabPfx, '')} (through ${trueItem['@type']})`;
          break;
        }
      }
    }
    if (properties.length === 0) {
      // console.log('Used card definition for', "Resource", "(Fallback)");
      properties = getProperties('Resource', 'chips', displayDefs);
    }
  } else {
    // console.log('Used card definition for', JSON.stringify(baseClassUsed));
  }
  // console.log(JSON.stringify(properties));

  // For each property, get the value from original item
  // console.log("Checking if present on item:");
  if (level === 'cards') {
    properties = ['@type'].concat(properties);
  }

  for (let i = 0; i < properties.length; i++) {
    if (!_.isObject(properties[i])) {
      if (typeof trueItem[properties[i]] !== 'undefined') {

        // console.log("✔ ", properties[i], trueItem[properties[i]]);
        let value = trueItem[properties[i]];
        if (_.isObject(value) && !_.isArray(value)) {
          // console.log("Encountered object in value", JSON.stringify(value));
          if (level === 'cards') {
            value = getDisplayObject(value, 'chips', displayDefs, linked, vocab, vocabPfx);
          } else {
            value = value;
          }
        }
        if (_.isArray(value)) {
          // console.log("Encountered array in value", JSON.stringify(value));
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

      } else {
        // console.log("x ", properties[i]);
      }
    }
  }
  // console.log('displayObj is now', JSON.stringify(displayObject));
  if (_.isEmpty(displayObject)) {
    displayObject = item;
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
