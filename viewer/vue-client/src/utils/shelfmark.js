import { get } from 'lodash-es';
import * as md5 from 'md5';
import * as HttpUtil from './http';

export async function hasAutomaticShelfControlNumber(shelfMarkId, settings) {
  return HttpUtil.get({
    url: `${settings.apiPath}/${shelfMarkId}`,
    accept: 'application/ld+json',
  }).then(shelfMark => Promise.resolve(shelfMark['@graph'][1].hasOwnProperty('nextShelfControlNumber')));
}

export async function checkAutoShelfControlNumber(obj, settings, user) {
  const mainEntity = obj['@graph'][1];

  if (mainEntity['@type'] === 'Item') {
    const items = (mainEntity.hasComponent || []).filter(c => c['@type'] === 'Item');
    items.push(mainEntity);
    for (const item of items) {
      // we actually want to do these sequentially in case they link to the same shelf mark
      await _insertShelfControlNumber(item, settings, user); // eslint-disable-line no-await-in-loop
    }
  }
  return obj;
}

async function _insertShelfControlNumber(item, settings, user) {
  if (item.shelfControlNumber || !get(item, ['shelfMark', 0, '@id'])) {
    return;
  }

  const id = item.shelfMark[0]['@id'].split('#')[0];
  if (await hasAutomaticShelfControlNumber(id, settings)) {
    item.shelfControlNumber = await _generateShelfControlNumber(id, settings, user);
  }
}

async function _generateShelfControlNumber(shelfMarkId, settings, user) {
  let result = -1;
  const noCache = md5(Math.random() * 100000000);
  const fetchUrl = `${settings.apiPath}/${shelfMarkId}?embellished=false&${noCache}`;
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
