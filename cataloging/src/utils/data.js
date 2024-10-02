import { isEmpty, cloneDeep, isArray, isObject, forEach, uniq, difference, each } from 'lodash-es';
import * as VocabUtil from 'lxljs/vocab';
import * as DisplayUtil from 'lxljs/display';
import * as HttpUtil from '@/utils/http';
import settings from '../settings';

export function getDisplayDefinitions() {
  const baseUri = settings.idPath;
  return new Promise((resolve, reject) => {
    if (settings.mockDisplay === true) {
      window.lxlInfo('🎭 MOCKING DISPLAY FILE - Using file from local definitions repository');
      // eslint-disable-next-line import/no-extraneous-dependencies
      const displayGlob = import.meta.glob('../../../../definitions/source/vocab/display.jsonld', {
        query: '?raw',
        import: 'default',
        eager: true,
      });
      const displayJson = JSON.parse(displayGlob['../../../../definitions/source/vocab/display.jsonld']);
      resolve(DisplayUtil.expandInherited(displayJson));
    } else {
      HttpUtil.getResourceFromCache(`${baseUri}/vocab/display/data.jsonld`).then((result) => {
        resolve(DisplayUtil.expandInherited(result));
      }, (error) => {
        reject(error);
      });
    }
  });
}

export function getVocab(apiPath) {
  return new Promise((resolve, reject) => {
    HttpUtil.getResourceFromCache(`${apiPath}/vocab/data.jsonld`).then((result) => {
      resolve(result);
    }, (error) => {
      reject(error);
    });
  });
}

export function getContext(apiPath) {
  return new Promise((resolve, reject) => {
    HttpUtil.getResourceFromCache(`${apiPath}/context.jsonld`).then((result) => {
      resolve(VocabUtil.preprocessContext(result));
    }, (error) => {
      reject(error);
    });
  });
}

export function getEmbellished(id, quotedIndex = {}) {
  if (typeof id === 'undefined' || id === '') {
    throw new Error('getEmbellished was called with an undefined or empty Id.');
  }
  let obj = null;
  if (!isEmpty(quotedIndex) && typeof quotedIndex[id] !== 'undefined') {
    obj = quotedIndex[id];
  }
  if (obj === null) {
    window.lxlWarning(`🔍 Couldn't find embellished data for: ${id}`);
    obj = { '@id': id };
  }
  if (obj !== null && !obj.hasOwnProperty('@type')) {
    window.lxlWarning('👽 Embellished entity has an unknown type (missing @type). ID:', id);
  }
  return cloneDeep(obj);
}

export function getMergedItems(record, mainEntity, work, quoted) {
  const obj = { '@graph': [] };
  obj['@graph'].push(record);
  obj['@graph'].push(mainEntity);
  if (!isEmpty(work)) {
    obj['@graph'].push(work);
  }
  for (const graph in quoted) {
    if (Object.prototype.hasOwnProperty.call(quoted, graph)) {
      obj['@graph'].push(quoted[graph]);
    }
  }
  return obj;
}

export function removeNullValues(inputObj) {
  const obj = cloneDeep(inputObj);
  // Strips away all null value keys
  let cleanObj;
  if (isArray(obj)) {
    cleanObj = [];
    for (let i = 0; i < obj.length; i++) {
      const item = removeNullValues(obj[i]);
      if (typeof item !== 'undefined' && item !== null) {
        cleanObj.push(item);
      }
    }
  } else if (isObject(obj)) {
    cleanObj = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key) && key !== '_uid') {
        cleanObj[key] = removeNullValues(obj[key]);
        if (cleanObj[key] === null || typeof cleanObj[key] === 'undefined' || cleanObj[key].length === 0) {
          delete cleanObj[key];
        }
      }
    }
    if (Object.keys(cleanObj).length === 1 && cleanObj.hasOwnProperty('@type')) {
      cleanObj = null;
    }
  } else if (typeof obj !== 'undefined' && obj !== null && obj !== '') {
    cleanObj = obj;
  }
  return cleanObj;
}

export function rewriteValueOfKey(obj, key, newValue, deep = false) {
  const newObj = cloneDeep(obj);
  const keys = Object.keys(newObj);
  for (let i = 0; i < keys.length; i++) {
    const value = newObj[keys[i]];
    if (keys[i] === key) {
      newObj[keys[i]] = newValue;
    } else if (deep === true) {
      if (isObject(value) && deep === true) {
        newObj[keys[i]] = rewriteValueOfKey(value, key, newValue, true);
      }
      if (isArray(value)) {
        for (let x = 0; x < value.length; x++) {
          newObj[keys[i]][x] = rewriteValueOfKey(newObj[keys[i]][x], key, newValue, true);
        }
      }
    }
  }
  return newObj;
}

export function appendIds(obj) {
  if (!isArray(obj) && !isObject(obj)) {
    return obj;
  }
  let idCount = 1;
  const stack = [];
  stack.push(obj);
  let o;
  while (o = stack.pop()) {
    if (isObject(o) && !isArray(o) && !o['@id']) {
      o['_id'] = `#${idCount++}`;
    }
    forEach(o, (child) => {
      if (isArray(child) || isObject(child)) {
        stack.push(child);
      }
    });
  }
  return obj;
}

export function getExternalLinks(obj) {
  if (!isArray(obj) && !isObject(obj)) {
    return [];
  }

  const links = [];
  const entities = [];
  const stack = [];
  stack.push(obj);
  let o;
  while (o = stack.pop()) {
    if (o['@id']) {
      (Object.keys(o).length > 1 ? entities : links).push(o['@id']);
    }
    forEach(o, (child) => {
      if (isArray(child) || isObject(child)) {
        stack.push(child);
      }
    });
  }
  return difference(uniq(links), entities);
}

export async function fetchMissingLinkedToQuoted(obj, store) {
  const quoted = store.state.inspector.data.quoted || {};
  const missingLinks = getExternalLinks(obj)
    .filter((l) => !quoted.hasOwnProperty(l))
    .filter((l) => {
      const uri = translateAliasedUri(l);
      return uri.startsWith(settings.apiPath) || uri.startsWith(settings.idPath);
    });
  const embellished = false;
  return Promise
    .allSettled(missingLinks.map((l) => HttpUtil.getDocument(l, undefined, embellished)))
    .then((results) => {
      results.filter((r) => r.status === 'fulfilled').map((r) => r.value.data).forEach((doc) => {
        if (doc) {
          doc['@graph'].forEach((o) => store.commit('addToQuoted', o));
        }
      });
    })
    .catch((e) => console.log(e));
}

export function moveWorkToInstance(data) {
  const oldWork = data.work;
  if (oldWork !== undefined) {
    delete oldWork['@id']; // Get rid of <record-id>#work
    data.mainEntity.instanceOf = oldWork;
  }
  return data;
}

// Changes XML to JSON
// Modified version from here: http://davidwalsh.name/convert-xml-json
export function xmlToJson(xml) {
  // Create the return object
  let obj = {};

  if (xml.nodeType === 1) { // element
    // do attributes
    if (xml.attributes.length > 0) {
      obj['@attributes'] = {};
      for (let j = 0; j < xml.attributes.length; j++) {
        const attribute = xml.attributes.item(j);
        obj['@attributes'][attribute.nodeName] = attribute.nodeValue;
      }
    } else if (xml.nodeType === 3) { // text
      obj = xml.nodeValue;
    }
  }

  // do children
  // If just one text node inside
  if (xml.hasChildNodes() && xml.childNodes.length === 1 && xml.childNodes[0].nodeType === 3) {
    obj = xml.childNodes[0].nodeValue;
  } else if (xml.hasChildNodes()) {
    for (let i = 0; i < xml.childNodes.length; i++) {
      const item = xml.childNodes.item(i);
      const nodeName = item.nodeName;
      if (typeof (obj[nodeName]) === 'undefined') {
        obj[nodeName] = xmlToJson(item);
      } else {
        if (typeof (obj[nodeName].push) === 'undefined') {
          const old = obj[nodeName];
          obj[nodeName] = [];
          obj[nodeName].push(old);
        }
        obj[nodeName].push(xmlToJson(item));
      }
    }
  }
  return obj;
}

const SITE_ALIAS = JSON.parse(settings.siteAlias || '{}');

export function translateAliasedUri(uri) {
  let translatedUri = uri;

  each(SITE_ALIAS, (from, to) => {
    if (uri.startsWith(from)) {
      translatedUri = uri.replace(from, to);
      return false;
    }
    return true;
  });

  // TODO: why is this needed?
  if (uri.startsWith('https://libris.kb.se')) {
    translatedUri = uri.replace('https://libris.kb.se', settings.apiPath);
  }
  if (uri.startsWith('https://id.kb.se')) {
    translatedUri = uri.replace('https://id.kb.se', settings.idPath);
  }
  return translatedUri;
}

export function isLink(o) {
  return Object.keys(o).length === 1 && Object.keys(o).includes('@id');
}
