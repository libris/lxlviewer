import * as httpUtil from '../utils/http';
import * as DisplayUtil from '../utils/display';
import * as VocabUtil from '../utils/vocab';
import * as _ from 'lodash';

export function getMarc(json) {
  return new Promise((resolve, reject) => {
    const req = new XMLHttpRequest();
    const url = '/_format?to=application/x-marc-json';
    req.open('POST', url);
  });
}

export function splitJson(json) {
  if (!json || json.length === 0) {
    throw new Error('Trying to split empty JSON data.');
  }
  const original = json['@graph'];
  const dataObj = {};
  dataObj.quoted = [];

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
        dataObj.work = original[i];
        // pushing work to quoted list so that references to it will work for now.
        // TODO: do something else
        const graphId = extractFnurgel(original[i]['@id']);
        dataObj.quoted.push({ '@id': graphId, '@graph': [original[i]] });
        original.splice(i, 1);
        break;
      }
    }
  }

  // Find quoted and put them in a separate list
  for (let i = 0; i < original.length; i++) {
    if (original[i].hasOwnProperty('@graph')) {
      dataObj.quoted.push({ '@id': original[i]['@id'], '@graph': original[i]['@graph'] });
    }
  }
  return dataObj;
}

export function extractFnurgel(uri) {
  // TODO: Make more checks before returning something
  const recordUri = uri.split('#')[0];
  const splitUri = recordUri.split('/');
  const fnurgel = splitUri[splitUri.length - 1];
  if (fnurgel.length === 15 || fnurgel.length === 16) {
    return fnurgel;
  }
  return undefined;
}

export function stripId(obj) {
  const newObj = obj;
  if (newObj.hasOwnProperty('@id')) {
    newObj['@id'] = '';
  }
  return newObj;
}

export function getItemObject(itemOf, heldBy, instance) {
  const itemObj = {
    '@graph': [
      {
        '@type': 'Record',
        '@id': '_:TEMP_ID',
        'mainEntity': {
          '@id': '_:TEMP_ID#it',
        },
      },
      {
        '@id': '_:TEMP_ID#it',
        '@type': 'Item',
        'itemOf': {
          '@id': itemOf,
        },
        'heldBy': {
          '@id': heldBy,
        },
      },
      {
        '@graph': [
          instance,
        ],
        '@id': extractFnurgel(itemOf),
      },
    ],
  };
  return itemObj;
}

export function getObjectAsRecord(data) {
  const mainEntity = _.cloneDeep(data);
  mainEntity['@id'] = '_:TEMP_ID#it';

  const newObj = {
    '@graph': [
      {
        '@type': 'Record',
        '@id': '_:TEMP_ID',
        'mainEntity': {
          '@id': '_:TEMP_ID#it',
        },
      },
      mainEntity
    ],
  };
  return newObj;
}

export function getNewCopy(id) {
  let copyUrl = `${id}/data.jsonld`;
  if (copyUrl[0] !== '/') {
    copyUrl = `/${copyUrl}`;
  }

  return new Promise((resolve, reject) => {
    httpUtil.get({ url: copyUrl, accept: 'application/ld+json' }).then((response) => {
      // TODO: Relying on order. How can we do this in a safer way?
      const responseObject = response;
      responseObject['@graph'][0] = stripId(responseObject['@graph'][0]);
      responseObject['@graph'][1] = stripId(responseObject['@graph'][1]);
      resolve(responseObject);
    }, (error) => {
      reject('Error when getting record from', copyUrl, error);
    });
  });
}

export function getEmptyForm(type, vocab, display, settings) {
  console.log('Type', type);
  const formObj = { '@type': type };
  let inputKeys = DisplayUtil.getProperties(type, 'cards', display, settings);
  if (inputKeys.length === 0) {
    const baseClasses = VocabUtil.getBaseClassesFromArray(
      type,
      vocab,
      settings.vocabPfx
    );
    console.log('baseClasses for', type, 'is', JSON.stringify(baseClasses));
    for (const baseClass of baseClasses) {
      inputKeys = DisplayUtil.getProperties(
        baseClass.replace(settings.vocabPfx, ''),
        'cards',
        display,
        settings
      );
      if (inputKeys.length > 0) {
        break;
      }
    }
    if (inputKeys.length === 0) {
      inputKeys = DisplayUtil.getProperties('Resource', 'cards', display, settings);
    }
  }
  inputKeys = ['@type'].concat(inputKeys);
  for (const inputKey of inputKeys) {
    if (inputKey === '@type') {
      formObj[inputKey] = type;
    } else {
      const keyRange = VocabUtil.getRange(inputKey, vocab, settings.vocabPfx);
      if (keyRange.length === 0 || keyRange[0].split(':')[1] === 'Literal') {
        formObj[inputKey] = '';
      } else {
        formObj[inputKey] = [];
      }
    }
  }
  console.log('Form obj', JSON.stringify(formObj));
  return formObj;
}
