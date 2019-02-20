import { cloneDeep, each, unset } from 'lodash-es';
import * as md5 from 'md5';
import * as httpUtil from './http';
import * as DataUtil from './data';

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
    } else if (original[i]['@id']) {
      dataObj.quoted[original[i]['@id']] = original[i];
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

export function getMainEntity(graph) {
  const mainEntityId = graph[0].mainEntity['@id'];
  let mainEntity = {};
  each(graph, (node) => {
    if (node['@id'] === mainEntityId) {
      mainEntity = node;
    }
  });
  return mainEntity;
}

export function getItemObject(itemOf, heldBy, instance) {
  const itemObj = {
    record: {
      '@type': 'Record',
      '@id': 'https://id.kb.se/TEMPID',
      descriptionCreator: {
        '@id': heldBy,
      },
      mainEntity: {
        '@id': 'https://id.kb.se/TEMPID#it',
      },
    },
    mainEntity: {
      '@id': 'https://id.kb.se/TEMPID#it',
      '@type': 'Item',
      heldBy: {
        '@id': heldBy,
      },
      itemOf: {
        '@id': itemOf,
      },
      hasComponent: [
        {
          '@type': 'Item',
          cataloguersNote: [''],
          heldBy: {
            '@id': heldBy,
          },
          shelfMark: {
            '@type': 'ShelfMark',
            label: [''],
          },
          physicalLocation: [''],
          shelfLabel: '',
          shelfControlNumber: '',
        },
      ],
      'associatedMedia': [
        {
          '@type': 'MediaObject',
          'uri': ['']
        }
      ],
      'marc:hasTextualHoldingsBasicBibliographicUnit': [
        {
          '@type': 'marc:TextualHoldingsBasicBibliographicUnit',
          'marc:textualString': '',
          'marc:cataloguersNote': [''],
          'marc:publicNote': [''],
        },
      ],
    },
    quoted: [
      {
        '@graph': [
          {
            '@id': itemOf,
            mainEntity: {
              '@id': instance['@id'],
            },
          },
          instance,
        ],
      },
    ],
  };
  return itemObj;
}

export function moveHolding(holdingId, destinationId, user) {
  const randomHash = md5(new Date());
  const getUrl = `${holdingId.replace('#it', '')}/data.jsonld?${randomHash}`;
  let ETag = '';
  return new Promise((resolve, reject) => {
    fetch(getUrl).then((response) => {
      ETag = response.headers.get('ETag');
      return response.json();
    }, (error) => {
      reject('Error moving holding (fetching data)', holdingId, error);
    }).then((json) => {
      const splitData = splitJson(json);
      const sigelUrlParts = splitData.mainEntity.heldBy['@id'].split('/');
      const sigel = sigelUrlParts[sigelUrlParts.length - 1];
      const newMainEntity = DataUtil.rewriteValueOfKey(splitData.mainEntity, 'itemOf', { '@id': destinationId });
      const packagedData = DataUtil.getMergedItems(splitData.record, newMainEntity);
      httpUtil.put({
        url: holdingId,
        ETag: ETag,
        activeSigel: sigel,
        token: user.token,
      }, packagedData).then((result) => {
        resolve(result);
      }, (error) => {
        reject('Error moving holding (on save)', holdingId, error);
      });
    }, (error) => {
      reject('Error moving holding (broken json)', holdingId, error);
    });
  });
}

export function getObjectAsRecord(mainEntity, record = {}) {
  const newMainEntity = cloneDeep(mainEntity);
  newMainEntity['@id'] = 'https://id.kb.se/TEMPID#it';
  unset(newMainEntity, 'sameAs');
  const newRecord = cloneDeep(record);
  // TODO: Exclude more fields?
  unset(newRecord, 'created');
  unset(newRecord, 'modified');
  unset(newRecord, 'controlNumber');
  unset(newRecord, 'sameAs');
  const blankRecord = {
    '@type': 'Record',
    '@id': 'https://id.kb.se/TEMPID',
    mainEntity: {
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

export function convertToMarc(inspectorData, settings, user) {
  const editorObj = DataUtil.getMergedItems(
    DataUtil.removeNullValues(inspectorData.record),
    DataUtil.removeNullValues(inspectorData.mainEntity),
    DataUtil.removeNullValues(inspectorData.work),
    inspectorData.quoted,
  );
  const apiPath = settings.apiPath;
  return new Promise((resolve, reject) => {
    httpUtil.post({ 
      url: `${apiPath}/_convert`,
      accept: 'application/x-marc-json',
      token: user.token,
    }, editorObj).then((result) => {
      resolve(result);
    }, (error) => {
      reject(Error('Couldn\'t convert to marc.', error));
    });
  });
}

export function prepareDuplicateFor(inspectorData, user, settings) {
  const userSigelObj = { '@id': `https://libris.kb.se/library/${user.settings.activeSigel}` };

  // Removes fields that we do not want to import or copy
  let newData = cloneDeep(inspectorData);
  if (!newData.hasOwnProperty('quoted')) {
    newData.quoted = {};
  }
  const oldBaseId = inspectorData.record['@id'];
  const newBaseId = 'https://id.kb.se/TEMPID';

  // Update descriptionCreator to this organization
  newData.record.descriptionCreator = userSigelObj;

  // Update any heldBy keys to this organization
  newData = DataUtil.rewriteValueOfKey(newData, 'heldBy', userSigelObj, true);

  // Remove properties that should not be included in the duplicate
  each(settings.removeOnDuplication, (property) => {
    unset(newData, property);
  });

  // Replace @id and internal @id references
  if (newData.mainEntity) {
    newData.mainEntity['@id'] = newData.mainEntity['@id'].replace(oldBaseId, newBaseId);
  }
  if (newData.record) {
    newData.record['@id'] = newData.record['@id'].replace(oldBaseId, newBaseId);
    newData.record.mainEntity['@id'] = newData.record.mainEntity['@id'].replace(oldBaseId, newBaseId);
  }
  if (newData.work) {
    newData.work['@id'] = newData.work['@id'].replace(oldBaseId, newBaseId);
    newData.mainEntity.instanceOf = { '@id': newData.work['@id'] };
    newData.quoted[newData.work['@id']] = newData.work;
  }

  const merged = DataUtil.getMergedItems(
    newData.record, 
    newData.mainEntity, 
    newData.work, 
    newData.quoted,
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
