import { each } from 'lodash-es';
import { translateAliasedUri } from './data';

export function buildQueryString(params) {
  const enc = encodeURIComponent;
  const queryArr = [];
  Object.keys(params).forEach((key) => {
    if (Array.isArray(params[key])) {
      params[key].forEach((el) => {
        if (el !== null) {
          queryArr.push(`${enc(key)}=${enc(el)}`);
        }
      });
    } else if (params[key] !== null) {
      queryArr.push(`${enc(key)}=${enc(params[key])}`);
    }
  });
  return queryArr.join('&');
}

export function decomposeQueryString(q) {
  if (q.includes('?')) {
    q = q.split('?')[1];
  }

  const params = {};

  q.split('&').forEach((param) => {
    const keyVal = param.split('=');
    const key = decodeURIComponent(keyVal[0]);
    const val = decodeURIComponent(keyVal[1]);
    if (!params.hasOwnProperty(key)) {
      params[key] = [];
    }
    params[key].push(val);
  });
  return params;
}

function request(opts, data) {
  // method, url, token, accept
  const options = opts;
  options.method = options.method || 'GET';

  return new Promise((resolve, reject) => {
    const req = new XMLHttpRequest();

    req.open(options.method, options.url);
    if (options.contentType) {
      req.setRequestHeader('Content-Type', options.contentType);
    } else {
      req.setRequestHeader('Content-Type', 'application/ld+json');
    }
    if (options.token) {
      req.setRequestHeader('Authorization', `Bearer ${options.token}`);
    }
    if (options.accept) {
      req.setRequestHeader('Accept', options.accept);
    }
    if (options.activeSigel) {
      req.setRequestHeader('XL-Active-Sigel', options.activeSigel);
    }
    if (options.ETag) {
      if (options.method === 'GET') {
        req.setRequestHeader('If-None-Match', options.ETag);
      } else if (options.method === 'PUT' || options.method === 'DELETE') {
        req.setRequestHeader('If-Match', options.ETag);
      }
    }

    req.onload = () => {
      if (req.status === 200) {
        let resp = req.responseText;
        const responseHeader = req.getResponseHeader('Content-Type');
        if (responseHeader && responseHeader.indexOf('json') !== -1) {
          try {
            resp = JSON.parse(resp);
            if (req.getResponseHeader('ETag')) {
              resp.ETag = req.getResponseHeader('ETag');
            }
          } catch (e) {
            console.error('Failed to parse response said to be JSON', e, resp);
          }
        }
        resolve(resp, req);
      } else if (req.status === 201 || req.status === 204) {
        resolve(req);
      } else if (req.status === 304) {
        resolve(req);
      } else if (req.status === 403) {
        reject(req);
      } else if (req.status === 412) {
        reject(req);
      } else {
        reject(req);
      }
    };
    req.onerror = () => {
      if (req.status === 401) {
        reject(Error('Authentication error'));
      } else {
        reject(Error('Network error'));
      }
    };

    if (options.method === 'DELETE' || options.method === 'GET') {
      req.send();
    } else {
      req.send(JSON.stringify(data));
    }
  });
}

export function getRelatedRecords(queryPairs, apiPath) {
  // Returns a list of records that links to <id> with <property>
  return new Promise((resolve, reject) => {
    let relatedRecords = `${apiPath}/find.jsonld?`;
    each(queryPairs, (v, k) => {
      relatedRecords += (`${encodeURIComponent(k)}=${encodeURIComponent(v)}&`);
    });
    fetch(relatedRecords)
      .then((response) => {
        if (response.status === 200) {
          resolve(response.json());
        } else {
          reject();
        }
      })
      .catch((error) => {
        reject(error);
      });
  });
}

export async function getDocument(uri, contentType = 'application/ld+json', embellished = true) {
  let translatedUri = translateAliasedUri(uri);

  translatedUri = translatedUri.split('#')[0];

  if (!uri.includes('embellished=')) {
    const query = `${uri.includes('?') ? '&' : '?'}embellished=${embellished}`;
    translatedUri = `${translatedUri}${query}`;
  }

  const headers = new Headers();
  headers.append('Accept', contentType);
  const responseObject = {};
  const options = {
    headers,
  };
  const response = await fetch(translatedUri, options);
  responseObject.status = response.status;
  if (response.status !== 200) {
    if (translatedUri === uri) {
      console.warn('HttpUtil.getDocument failed to fetch any data for:', uri);
    } else {
      console.warn('HttpUtil.getDocument failed to fetch any data for:', uri, `(as ${translatedUri})`);
    }
    responseObject.data = null;
    return responseObject;
  }
  responseObject.data = await response.json();
  responseObject.ETag = response.headers.get('ETag');
  responseObject.uri = uri;
  return responseObject;
}

export function get(opts) {
  const options = opts;
  options.method = 'GET';
  return request(options);
}

export function put(opts, data) {
  const options = opts;
  options.method = 'PUT';
  return request(options, data);
}

export function post(opts, data) {
  const options = opts;
  options.method = 'POST';
  return request(options, data);
}

export function _delete(opts) {
  const options = opts;
  options.method = 'DELETE';
  return request(options);
}

export function getResourceFromCache(url) {
  // This does not cache for the moment...
  return new Promise((resolve, reject) => {
    const resource = JSON.parse(localStorage.getItem(url));
    fetch(url).then((result) => {
      if (result.status === 304) {
        resolve(resource);
      } else {
        result.json().then((obj) => {
          localStorage.setItem(url, JSON.stringify(obj));
          resolve(obj);
        }, (error) => {
          reject(error);
        });
      }
    }, (error) => {
      reject(error);
    });
  });
}

export function fetchPlainEtags(ids) {
  return Promise
    .all(ids.map((id) => getDocument(id, undefined, false)))
    .then((responses) => Object.fromEntries(responses.map((r) => [r.uri, r.ETag])));
}

export async function fetchJson (url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  return await response.json();
}
