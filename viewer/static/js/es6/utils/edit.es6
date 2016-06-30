export function getLinked(id, linked) {
  if (typeof linked !== 'undefined') {
    for (let i = 0; i < linked.length; i ++) {
      if (linked[i]['@id'] === id) {
        return linked[i];
      }
    }
  }
  return { '@id': id };
}

export function getMergedItems(meta, thing, linked) {
  const obj = { '@graph': [] };
  obj['@graph'].push(meta);
  obj['@graph'].push(thing);
  for (let i = 0; i < linked.length; i++) {
    obj['@graph'].push({ '@graph': linked[i] });
  }
  return obj;
}

export function clean(obj) {
  // Strips away all null value keys
  const cleanObj = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      if (obj[key] !== null) {
        cleanObj[key] = obj[key];
      }
    }
  }
  return cleanObj;
}
