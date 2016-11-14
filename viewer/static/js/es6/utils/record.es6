import * as httpUtil from '../utils/http';

export function getMarc(json) {
  return new Promise((resolve, reject) => {

    const req = new XMLHttpRequest();
    const url = '/_format?to=application/x-marc-json';

    req.open('POST', url);

  });
}

export function splitJson(json) {
  let orginal = json['@graph'];
  let dataObj = {};
  dataObj.linked = [];

  // TODO: Relying on order here... tsk tsk tsk.
  dataObj.record = orginal[0];
  orginal.splice(0, 1);

  // TODO: Do something else!
  console.warn('Finding focused item node by @id.indexOf("#it"). This approach is not reliable.');
  for (let i = 0; i < orginal.length; i++) {
    if (orginal[i]['@id'] && orginal[i]['@id'].indexOf('#it') !== -1) {
      dataObj.it = orginal[i];
      orginal.splice(i, 1);
      break;
    }
  }
  for (let i = 0; i < orginal.length; i++) {
    if (orginal[i]['@id'] && orginal[i]['@id'].indexOf('#work') !== -1) {
      dataObj.work = orginal[i];
      // pushing work to linked list so that references to it will work for now.
      // TODO: do something else
      dataObj.linked.push(orginal[i]);

      orginal.splice(i, 1);
      break;
    }
  }

  for (let i = 0; i < orginal.length; i++) {
    if (orginal[i].hasOwnProperty('@graph')) {
      dataObj.linked.push(orginal[i]['@graph']);
    } else {
      dataObj.linked.push(orginal[i]);
    }
  }
  return dataObj;
}

export function getEmptyHolding(holdingFor, sigel) {
  const meta = {
    '@type': 'Record',
  };
  const thing = {
    '@type': 'Item',
    holdingFor,
    heldBy: [
      {
        '@type': 'Organization',
        '@id': '',
        notation: sigel,
      }
    ],
  };
  const obj = {
    '@graph': [
      meta,
      thing,
    ],
  };
  return obj;
}

export function stripId(obj) {
  const newObj = obj;
  if (newObj.hasOwnProperty('@id')) {
    newObj['@id'] = '';
  }
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
