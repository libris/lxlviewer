import { isEmpty, cloneDeep, isArray, isObject } from 'lodash-es';

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
