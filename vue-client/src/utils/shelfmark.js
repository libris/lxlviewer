import { get } from 'lodash-es';
import md5 from 'md5';
import * as HttpUtil from './http';
import { isSubClassOf } from "lxljs/vocab";

export async function hasAutomaticShelfControlNumber(shelfMarkId) {
  return HttpUtil.get({
    url: shelfMarkId,
    accept: 'application/ld+json',
  }).then((shelfMark) => Promise.resolve(shelfMark['@graph'][1].hasOwnProperty('nextShelfControlNumber')));
}

export async function checkAutoShelfControlNumber(obj, settings, user, resources) {
  const mainEntity = obj['@graph'][1];
  const isItem = (type) => type && isSubClassOf(type, 'Item', resources.vocab, resources.context);

  if (isItem(mainEntity['@type'])) {
    const items = (mainEntity.hasComponent || []).filter((c) => isItem(c['@type']));
    items.push(mainEntity);
    for (const item of items) {
      // we actually want to do these sequentially in case they link to the same shelf mark
      await _insertShelfControlNumber(item, settings, user); // eslint-disable-line no-await-in-loop
    }
  }
  return obj;
}

async function _insertShelfControlNumber(item, settings, user) {
  const shelfMark = Array.isArray(item.shelfMark) ? item.shelfMark[0] : item.shelfMark;
  if (item.shelfControlNumber || !shelfMark?.['@id']) {
    return;
  }

  const id = shelfMark['@id'].split('#')[0];
  if (await hasAutomaticShelfControlNumber(id)) {
    item.shelfControlNumber = await _generateShelfControlNumber(id, settings, user);
  }
}

async function _generateShelfControlNumber(shelfMarkId, settings, user) {
  let result = -1;
  const noCache = md5(Math.random() * 100000000);
  const fetchUrl = `${shelfMarkId}?embellished=false&${noCache}`;
  await HttpUtil.get({
    url: fetchUrl,
    accept: 'application/ld+json',
  }).then((response) => {
    const newDoc = { '@graph': [response['@graph'][0], response['@graph'][1]] };
    const number = newDoc['@graph'][1].nextShelfControlNumber;
    newDoc['@graph'][1].nextShelfControlNumber = Number(number) + 1;
    const prefix = newDoc['@graph'][1].qualifier;
    result = prefix ? `${prefix} ${number}` : `${number}`;

    return HttpUtil.put({
      url: shelfMarkId,
      ETag: response.ETag,
      activeSigel: user.settings.activeSigel,
      token: user.token,
    }, newDoc);
  });
  return result;
}
