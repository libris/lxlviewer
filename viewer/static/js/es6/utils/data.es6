import * as _ from 'lodash';

export function getLinked(id, linked) {
  if (typeof id === 'undefined') {
    throw new Error('getLinked was called with an undefined Id.');
  }
  let obj = { '@id': id };
  if (typeof linked !== 'undefined') {
    for (const entity of linked) {
      if (entity['@id'] === id) {
        obj = Object.assign({}, entity);
      }
    }
  }
  if (id.indexOf('marc:') !== -1) {
    console.warn('Tried to find embellished from marc-id. Returning', JSON.stringify(obj));
    return obj;
  }
  if (!obj.hasOwnProperty('@type') && Object.keys(obj).length === 1) {
    console.warn('Couldn\'t find entity in list of quoted:', id);
  }
  if (!obj.hasOwnProperty('@type') && Object.keys(obj).length > 1) {
    console.warn('Embellished entity has an unknown type (missing @type). ID:', id);
  }
  return obj;
}

export function getMergedItems(record, it, work, linked) {
  const obj = { '@graph': [] };
  obj['@graph'].push(record);
  obj['@graph'].push(it);
  obj['@graph'].push(work);
  for (const entity of linked) {
    obj['@graph'].push({ '@graph': entity });
  }
  return obj;
}

export function removeNullValues(obj) {
  // Strips away all null value keys
  const cleanObj = {};
  _.each(obj, (value, key) => {
    if (value !== null && value !== '') {
      cleanObj[key] = value;
    }
  });
  return cleanObj;
}
