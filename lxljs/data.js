import { cloneDeep } from 'lodash-es';

export function splitJson(json) {
  if (!json || json.length === 0) {
    throw new Error('Trying to split empty JSON data.');
  }
  const original = cloneDeep(json['@graph']);
  const dataObj = {};
  dataObj.quoted = {};

  // TODO: Relying on order here... tsk tsk tsk.
  dataObj.record = original[0];
  original.splice(0, 1);

  // Find the instance
  if (dataObj.record.mainEntity && dataObj.record.mainEntity['@id']) {
    for (let i = 0; i < original.length; i++) {
      if (dataObj.record.mainEntity['@id'] === original[i]['@id']) {
        dataObj.mainEntity = original[i];
        original.splice(i, 1);
        break;
      }
    }
  }

  // Find the work
  if (dataObj.mainEntity && dataObj.mainEntity.instanceOf && dataObj.mainEntity.instanceOf['@id']) {
    for (let i = 0; i < original.length; i++) {
      if (dataObj.mainEntity.instanceOf['@id'] === original[i]['@id']) {
        const recordId = dataObj.record['@id'];
        const workIdWithoutSuffix = original[i]['@id'].split('#')[0];
        if (recordId === workIdWithoutSuffix) { // Only proceed if the work is local
          dataObj.work = original[i];
          // pushing work to quoted list so that references to it will work for now.
          dataObj.quoted[dataObj.work['@id']] = dataObj.work;
          original.splice(i, 1);
        }
        break;
      }
    }
  }

  // Find quoted and put them in a separate list
  for (let i = 0; i < original.length; i++) {
    if (original[i].hasOwnProperty('@graph')) {
      for (const obj of original[i]['@graph']) {
        if (obj['@id']) {
          dataObj.quoted[obj['@id']] = obj;
        }
      }
    } else if (original[i]['@id']) {
      dataObj.quoted[original[i]['@id']] = original[i];
    }
  }
  return dataObj;
}
