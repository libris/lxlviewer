
function request(options, data) {
  // method, url, token, accept

  options.method = options.method || 'GET';

  // Fix baseUri
  const baseUriJson = document.getElementById('baseUriAlias').innerHTML;
  const baseUriAlias = JSON.parse(baseUriJson);
  for (const key in baseUriAlias) {
    options.url = options.url.replace(key, baseUriAlias[key]);
  }

  return new Promise((resolve, reject) => {
    const req = new XMLHttpRequest();

    req.open(options.method, options.url);
    req.setRequestHeader('Content-Type', 'application/ld+json');
    if (options.token) {
      req.setRequestHeader('Authorization', `Bearer ${options.token}`);
    }
    if (options.accept) {
      req.setRequestHeader('Accept', options.accept);
    }

    req.onload = () => {
      if (req.status === 200 || req.status === 201) {
        let resp = req.response;
        if (req.getResponseHeader('Content-Type').indexOf('json') !== -1) {
          try {
            resp = JSON.parse(resp);
          } catch (e) {
            console.error('Failed to parse response said to be JSON', e, resp);
          }
        }
        resolve(resp, req);
      } else if (req.status === 204) {
        resolve(req);
      } else {
        debugger;
        reject(Error(req.statusText));
      }
    };
    req.onerror = () => {
      reject(Error('Network error'));
    };

    if (options.method === 'DELETE' || options.method === 'GET') {
      req.send();
    } else {
      req.send(JSON.stringify(data));
    }
  });
}

export function get(options) {
  return request(options);
}

export function put(options, data) {
  options.method = 'PUT';
  return request(options, data);
}

export function post(options, data) {
  options.method = 'POST';
  return request(options, data);
}

export function _delete(options) {
  options.method = 'DELETE';
  return request(options);
}
