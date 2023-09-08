import { cloneDeep, each, unset, get, set } from 'lodash-es';
import * as LxlDataUtil from 'lxljs/data';
import * as httpUtil from './http';
import * as DataUtil from './data';
import * as VocabUtil from '../../../lxljs/vocab';

export function getRecordId(data, quoted) {
  const recordObj = recordObject(data, quoted);
  
  let recordId;
  if (recordObj.hasOwnProperty('@id')) {
    recordId = recordObj['@id'];
  } else if (recordObj.hasOwnProperty('@graph')) {
    recordId = recordObj['@graph'][0]['@id'];
  } else {
    return null;
  }
  recordId = recordId.split('#')[0];
  return recordId;
}

export function getRecordType(data, quoted) {
  const recordObj = recordObject(data, quoted);

  if (recordObj['@type']) {
    return recordObj['@type'];
  }
  
  return null;
}

export function recordObject(data, quoted) {
  let recordObj = recordObjectFromGraph(data['@id'], quoted);
  if (recordObj === null) {
    if (data.hasOwnProperty('meta')) {
      recordObj = data.meta;
    } else {
      recordObj = data;
    }
  }
  return recordObj;
}

export function recordObjectFromGraph(id, quoted) {
  if (typeof quoted === 'undefined' || quoted === null) {
    return null;
  }
  const keys = Object.keys(quoted);
  for (const key of keys) {
    const graphNode = quoted[key];
    if (graphNode.hasOwnProperty('mainEntity') && graphNode.mainEntity['@id'] === id) {
      return graphNode;
    }
  }
  return null;
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

export function getDigitalReproductionObject(original, resources) {
  // Select the template
  const instanceTemplates = resources.templates.combined.instance;
  let digitalReproObject;
  for (let i = 0; i < instanceTemplates.length; i++) {
    if (instanceTemplates[i].key === 'digitizedMonographText') {
      digitalReproObject = cloneDeep(instanceTemplates[i].value);
    }
  }
  // Copying instanceOf explicitly cause of how #work works
  if (original.mainEntity.hasOwnProperty('instanceOf')) {
    if (original.mainEntity.instanceOf.hasOwnProperty('@id') && original.mainEntity.instanceOf['@id'].indexOf('#work') > -1) {
      // Work was local
      digitalReproObject.work = Object.assign({}, original.work);
      digitalReproObject.work['@id'] = 'https://id.kb.se/TEMPID#work';
      digitalReproObject.mainEntity.instanceOf = 'https://id.kb.se/TEMPID#work';
    } else {
      // Work was linked
      digitalReproObject.mainEntity.instanceOf = original.mainEntity.instanceOf;
    }
  }
  
  // Copy the other keys we want to copy
  const keysToCopy = [
    'mainEntity.hasTitle',
  ];
  for (let i = 0; i < keysToCopy.length; i++) {
    const originalValue = get(original, keysToCopy[i]);
    if (typeof originalValue !== 'undefined') {
      set(digitalReproObject, keysToCopy[i], originalValue);
    }
  }
  // Add "reproduction of" and link it to original document
  digitalReproObject.mainEntity.reproductionOf = { '@id': original.mainEntity['@id'] };
  // Copy in the quoted documents
  digitalReproObject.quoted = original.quoted;
  // Add the original to the quoted documents
  digitalReproObject.quoted[original.record['@id']] = original.record;
  digitalReproObject.quoted[original.mainEntity['@id']] = original.mainEntity;

  return digitalReproObject;
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
          shelfMark: heldBy === 'https://libris.kb.se/library/S' ? null : {
            '@type': 'ShelfMark',
            label: [''],
          },
          physicalLocation: [''],
          shelfLabel: '',
          shelfControlNumber: '',
        },
      ],
      associatedMedia: [
        {
          '@type': 'MediaObject',
          uri: [''],
          'marc:publicNote': [''], 
        },
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
  const getUrl = `${holdingId.replace('#it', '')}/data.jsonld`;
  let ETag = '';
  return new Promise((resolve, reject) => {
    fetch(getUrl).then((response) => {
      ETag = response.headers.get('ETag');
      return response.json();
    }, (error) => {
      reject('Error moving holding (fetching data)', holdingId, error);
    }).then((json) => {
      const splitData = LxlDataUtil.splitJson(json);
      const newMainEntity = DataUtil.rewriteValueOfKey(splitData.mainEntity, 'itemOf', { '@id': destinationId });
      const packagedData = DataUtil.getMergedItems(splitData.record, newMainEntity);
      httpUtil.put({
        url: holdingId,
        ETag: ETag,
        activeSigel: user.settings.activeSigel,
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

export function getCleanedExtractedData(extractedData, inspectorData, resources) {
  /** 
   * Cleans extracted data and adds title from parent data if it is missing.
   */
  const cleanObj = DataUtil.removeNullValues(extractedData);
  if (cleanObj == null) return null; // Nothing left of this
  if (VocabUtil.isSubClassOf(extractedData['@type'], 'Work', resources.vocabClasses, resources.context)) {
    // Entity is of type Work or derived type
    if (extractedData.hasOwnProperty('hasTitle') === false) {
      let titleOnInstance = null;
      const mainEntity = inspectorData.mainEntity;
      if (mainEntity.hasOwnProperty('hasTitle')) {
        const hasTitle = mainEntity.hasTitle;
        for (let i = 0; i < hasTitle.length; i++) {
          if (hasTitle[i]['@type'] === 'Title') {
            const titleObj = cloneDeep(hasTitle[i]);
            titleObj.source = [{ '@id': mainEntity['@id'] }];
            titleOnInstance = titleObj;
            break;
          }
        }
      }
      if (titleOnInstance != null) {
        cleanObj.hasTitle = [titleOnInstance];
      }
    }
  }
  return cleanObj;
}

export function convertToMarc(inspectorData, settings, user) {
  const editorObj = DataUtil.getMergedItems(
    DataUtil.removeNullValues(inspectorData.record),
    DataUtil.removeNullValues(inspectorData.mainEntity),
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

export function prepareDuplicateFor(inspectorData, user, keysToClear) {
  const userSigelObj = { '@id': user.getActiveLibraryUri() };

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
  each(keysToClear, (property) => {
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
