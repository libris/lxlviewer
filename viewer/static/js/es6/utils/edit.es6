import * as _ from 'lodash';

export function getLinked(id, linked) {
  if (typeof id === 'undefined') {
    throw new Error('getLinked was called with an undefined Id.');
  }
  let obj = { '@id': id };
  if (typeof linked !== 'undefined') {
    for (const entity of linked) {
      if (entity['@id'] === id) {
        obj = Object.assign({}, entity);
      }
    }
  }
  if (!obj.hasOwnProperty('@type')) {
    console.warn('Linked item not found:', id);
  }
  return obj;
}

export function getMergedItems(record, it, work, linked) {
  const obj = { '@graph': [] };
  obj['@graph'].push(record);
  obj['@graph'].push(it);
  obj['@graph'].push(work);
  for (const entity of linked) {
    obj['@graph'].push({ '@graph': entity });
  }
  return obj;
}

export function removeNullValues(obj) {
  // Strips away all null value keys
  const cleanObj = {};
  _.each(obj, (value, key) => {
    if (value !== null && value !== '') {
      cleanObj[key] = value;
    }
  });
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
