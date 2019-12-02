import { each } from 'lodash-es';

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
        if (req.getResponseHeader('Content-Type').indexOf('json') !== -1) {
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

export function getRelatedPosts(queryPairs, apiPath) {
  // Returns a list of posts that links to <id> with <property>
  return new Promise((resolve, reject) => {
    let relatedPosts = `${apiPath}/find.jsonld?`;
    each(queryPairs, (v, k) => {
      relatedPosts += (`${encodeURIComponent(k)}=${encodeURIComponent(v)}&`);
    });
    fetch(relatedPosts)
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

export async function getDocument(uri, contentType = 'application/ld+json') {
  let translatedUri = uri;
  if (uri.startsWith('https://id.kb.se')) {
    translatedUri = uri.replace('https://id.kb.se', process.env.VUE_APP_ID_PATH);
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
    console.warn('HttpUtil.getDocument failed to fetch any data for:', uri);
    responseObject.data = null;
    return responseObject;
  }
  responseObject.data = await response.json();
  responseObject.ETag = response.headers.get('ETag');
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
