export function getLinked(id, linked) {
  if (typeof id === 'undefined') {
    throw new Error('getLinked was called with an undefined Id.');
  }
  if (typeof linked !== 'undefined') {
    for (let i = 0; i < linked.length; i ++) {
      if (linked[i]['@id'] === id) {
        return linked[i];
      }
    }
  }
  console.warn('Linked item not found:', id);
  return { '@id': id };
}

export function getMergedItems(record, it, work, linked) {
  const obj = { '@graph': [] };
  obj['@graph'].push(record);
  obj['@graph'].push(it);
  obj['@graph'].push(work);
  for (let i = 0; i < linked.length; i++) {
    obj['@graph'].push({ '@graph': linked[i] });
  }
  return obj;
}

export function removeNullValues(obj) {
  // Strips away all null value keys
  const cleanObj = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      if (obj[key] !== null && obj[key] !== '') {
        cleanObj[key] = obj[key];
      }
    }
  }
  return cleanObj;
}

export function marcJsonToHtml(marcJson) {
  let htmlStr = '<table>';
  function toTableRow(key, ind1, ind2, value) {
    return `<tr><td><b>${key}</b></td><td>${ind1}</td><td>${ind2}</td><td>${value}</td></tr>`;
  }
  function parseSubfields(subfields) {
    return subfields.map((subfield) => {
      let subfieldStr = '';
      Object.keys(subfield).forEach((subfieldKey) => {
        subfieldStr += `<i>${subfieldKey}</i> ${subfield[subfieldKey]}`;
      });
      return subfieldStr;
    }).join(' ');
  }
  if (marcJson.leader) {
    htmlStr += toTableRow('000', '', '', marcJson.leader);
  }
  if (marcJson.fields) {
    const fields = marcJson.fields;
    fields.forEach((field) => {
      const fieldKeys = Object.keys(field);
      fieldKeys.forEach((key) => {
        const value = field[key];
        if (value.subfields) {
          htmlStr += toTableRow(key, value.ind1, value.ind2, parseSubfields(value.subfields));
        } else {
          htmlStr += toTableRow(key, '', '', value);
        }
      });
    });
  }
  htmlStr += '</table>';
  return htmlStr;
}
