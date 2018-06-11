import * as httpUtil from '../utils/http';
import * as DisplayUtil from '../utils/display';
import * as DataUtil from '../utils/data';
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
  const original = _.cloneDeep(json['@graph']);
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
        dataObj.work = original[i];
        // pushing work to quoted list so that references to it will work for now.
        // TODO: do something else
        dataObj.quoted[dataObj.work['@id']] = dataObj.work;
        original.splice(i, 1);
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
    } else {
      if (original[i]['@id']) {
        dataObj.quoted[original[i]['@id']] = original[i];
      }
    }
  }
  return dataObj;
}

export function extractFnurgel(uri) {
  // TODO: Make more checks before returning something
  const recordUri = uri.split('#')[0];

  // If Marc entity, don't proceed
  if (recordUri.indexOf('marc/') !== -1) {
    return recordUri;
  }

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

export function replaceIdWithTemp(obj) {
  const replaceableId = graph[0]['@id'];
  for (const node in obj) {
      if (data.hasOwnProperty(k)) {
         user[k] = data[k];
      }
  }
  return itemObj;
}

export function getMainEntity(graph) {
  const mainEntityId = graph[0].mainEntity['@id'];
  let mainEntity = {};
  _.each(graph, (node) => {
    if (node['@id'] === mainEntityId) {
      mainEntity = node;
    }
  });
  return mainEntity;
};

export function getItemObject(itemOf, heldBy, instance) {
  const itemObj = {
    record: {
      '@type': 'Record',
      '@id': 'https://id.kb.se/TEMPID',
      'descriptionCreator': {
        '@id': heldBy,
      },
      'mainEntity': {
        '@id': 'https://id.kb.se/TEMPID#it',
      },
    },
    mainEntity: {
      '@id': 'https://id.kb.se/TEMPID#it',
      '@type': 'Item',
      'itemOf': {
        '@id': itemOf,
      },
      'heldBy': {
        '@id': heldBy,
      },
      'hasComponent': [
        {
          '@type': "Item",
          'shelfMark': {
            '@type': 'ShelfMark',
            'label': [''],
          },
          'physicalLocation': [''],
          'shelfControlNumber': '',
        },
      ],
      'marc:hasTextualHoldingsBasicBibliographicUnit': [
        {
          '@type': 'marc:TextualHoldingsBasicBibliographicUnit',
          'marc:textualString': ''
        }
      ]
    },
    quoted: [
      {
        '@graph': [
          {
            '@id': itemOf,
            'mainEntity': {
              '@id': instance['@id']
            }
          },
          instance,
        ],
      }
    ],
  };
  return itemObj;
}

export function getObjectAsRecord(mainEntity, record = {}) {
  const newMainEntity = _.cloneDeep(mainEntity);
  newMainEntity['@id'] = 'https://id.kb.se/TEMPID#it';
  _.unset(newMainEntity, 'sameAs');
  const newRecord = _.cloneDeep(record);
  // TODO: Exclude more fields?
  _.unset(newRecord, 'created');
  _.unset(newRecord, 'modified');
  _.unset(newRecord, 'controlNumber');
  _.unset(newRecord, 'sameAs');
  const blankRecord = {
    '@type': 'Record',
    '@id': 'https://id.kb.se/TEMPID',
    'mainEntity': {
      '@id': 'https://id.kb.se/TEMPID#it',
    },
  };
  const mergedRecord = Object.assign(newRecord, blankRecord);

  const newObj = {
    '@graph': [
      mergedRecord,
      newMainEntity,
    ],
  };
  return newObj;
}

export function prepareDuplicateFor(inspectorData, user) {
  // Removes fields that we do not want to import or copy
  const newData = _.cloneDeep(inspectorData);
  if (!newData.hasOwnProperty('quoted')) {
    newData['quoted'] = {};
  }
  const oldBaseId = inspectorData.record['@id'];
  const newBaseId = 'https://id.kb.se/TEMPID';
  newData.record.descriptionCreator = { '@id': `https://libris.kb.se/library/${user.settings.activeSigel}` };
  if (newData.mainEntity) {
    newData.mainEntity['@id'] =  newData.mainEntity['@id'].replace(oldBaseId, newBaseId);
    delete newData.mainEntity.sameAs;
  }
  if (newData.record) {
    newData.record['@id'] =  newData.record['@id'].replace(oldBaseId, newBaseId);
    newData.record.mainEntity['@id'] = newData.record.mainEntity['@id'].replace(oldBaseId, newBaseId);
    delete newData.record.sameAs;
  }
  if (newData.work) {
    newData.work['@id'] = newData.work['@id'].replace(oldBaseId, newBaseId);
    newData.mainEntity.instanceOf = { '@id': newData.work['@id'] };
    delete newData.work.sameAs;
    newData.quoted[newData.work['@id']] = newData.work;
  }

  const merged = DataUtil.getMergedItems(
    newData.record, 
    newData.mainEntity, 
    newData.work, 
    newData.quoted
  );
  return merged;
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

export function getEmptyForm(type, vocab, display, context) {
  // TODO: Is this used?
  console.log('Type', type);
  const formObj = { '@type': type };
  let inputKeys = DisplayUtil.getProperties(type, 'cards', display);
  if (inputKeys.length === 0) {
    const baseClasses = VocabUtil.getBaseClassesFromArray(
      type,
      vocab,
    );
    console.log('baseClasses for', type, 'is', JSON.stringify(baseClasses));
    for (const baseClass of baseClasses) {
      inputKeys = DisplayUtil.getProperties(
        StringUtil.getCompactUri(baseClass, context),
        'cards',
        display,
      );
      if (inputKeys.length > 0) {
        break;
      }
    }
    if (inputKeys.length === 0) {
      inputKeys = DisplayUtil.getProperties('Resource', 'cards', display);
    }
  }
  inputKeys = ['@type'].concat(inputKeys);
  for (const inputKey of inputKeys) {
    if (inputKey === '@type') {
      formObj[inputKey] = type;
    } else {
      const keyRange = VocabUtil.getRange(type, inputKey, vocab, context);
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
