import * as _ from 'lodash';
import * as RecordUtil from './record';

export function getLinked(id, linked) {
  if (typeof id === 'undefined') {
    throw new Error('getLinked was called with an undefined Id.');
  }
  let obj = { '@id': id };
  let graphId = id;
  if (id.indexOf('#') > -1) {
    graphId = RecordUtil.extractFnurgel(id);
  }
  if (typeof linked !== 'undefined') {
    for (const graph of linked) {
      if (graph['@id'] === graphId) {
        for (const entity of graph['@graph']) {
          if (entity['@id'] === id) {
            obj = Object.assign({}, entity);
            return obj;
          }
        }
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

export function getMergedItems(record, mainEntity, work, quoted) {
  const obj = { '@graph': [] };
  obj['@graph'].push(record);
  obj['@graph'].push(mainEntity);
  if (!_.isEmpty(work)) {
    obj['@graph'].push(work);
  }
  // for (const graph of quoted) {
  //   obj['@graph'].push(graph);
  // }
  return obj;
}

export function removeNullValues(obj) {
  // Strips away all null value keys
  const cleanObj = {};
  _.each(obj, (value, key) => {
    if (value !== null && value !== '') {
      if (_.isPlainObject(value)) {
        cleanObj[key] = removeNullValues(value);
      } else {
        cleanObj[key] = value;
      }
    }
  });
  return cleanObj;
}
