
function request(url, token, obj, method) {
  return new Promise((resolve, reject) => {
    const req = new XMLHttpRequest();

    req.open(method ? method : 'GET', url);
    req.setRequestHeader('Content-Type', 'application/ld+json');
    req.setRequestHeader('Authorization', `Bearer ${token}`);

    req.onload = () => {
      if (req.status === 200 || req.status === 204) {
        let resp = req.response;
        if(req.getResponseHeader('Content-Type').indexOf('json') !== -1) {
          try {
            resp = JSON.parse(resp);
          } catch(e) {
            console.error('Failed to parse response said to be JSON', e, resp);
          }
        }
        resolve(resp, req);
      } else {
        reject(Error(req.statusText));
      }
    };
    req.onerror = () => {
      reject(Error('Network error'));
    };

    if (method === 'DELETE') {
      req.send();
    } else {
      req.send(JSON.stringify(obj));
    }
  });
}

export function get(url, token) {
  return request(url, token);
}

export function put(url, token, obj) {
  return request(url, token, obj, 'PUT');
}

export function post(url, token, obj) {
  return request(url, token, obj, 'POST');
}

export function _delete(url, token) {
  return request(url, token, null, 'DELETE');
}

export function getContent(url, type) {
  return new Promise((resolve, reject) => {
    const req = new XMLHttpRequest();
    req.open('GET', url);

    if (type) {
      req.setRequestHeader('Accept', type);
    }

    req.onload = () => {
      if (req.status === 200) {
        resolve(req.response);
      } else {
        reject(Error(req.statusText));
      }
    };
    req.onerror = () => {
      reject(Error('Network Error'));
    };
    req.send();
  });
}
