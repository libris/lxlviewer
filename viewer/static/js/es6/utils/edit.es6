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