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
