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

export function removeNullValues(obj) {
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
  if(marcJson.leader) {
    htmlStr += toTableRow('000', '', '', marcJson.leader);
  }
  if(marcJson.fields) {
    let fields = marcJson.fields;
    fields.forEach((field) => {
      let fieldKeys = Object.keys(field);
      fieldKeys.forEach((key) => {
        let value = field[key];
        if(value.subfields) {
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
