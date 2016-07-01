export function getMarc(json) {
  return new Promise((resolve, reject) => {

    const req = new XMLHttpRequest();
    const url = '/_format?to=application/x-marc-json';

    req.open('POST', url);

  });
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
