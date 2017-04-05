import * as httpUtil from '../utils/http';

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
        dataObj.quoted.push(original[i]);
        original.splice(i, 1);
        break;
      }
    }
  }

  // Find quoted and put them in a separate list
  for (let i = 0; i < original.length; i++) {
    if (original[i].hasOwnProperty('@graph')) {
      dataObj.quoted = dataObj.quoted.concat(original[i]['@graph']);
    }
  }
  return dataObj;
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
      },
    ],
  };
  return itemObj;
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
