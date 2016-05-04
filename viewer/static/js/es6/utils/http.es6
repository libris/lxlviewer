export function put(obj, url) {
  return new Promise((resolve, reject) => {
    const req = new XMLHttpRequest();
    req.open('PUT', url);
    req.setRequestHeader('Content-Type', 'application/ld+json');

    req.onload = () => {
      if (req.status === 200 || req.status === 204) {
        resolve(req.response);
      } else {
        reject(Error(req.statusText));
      }
    };
    req.onerror = () => {
      reject(Error('Network error'));
    };

    req.send(JSON.stringify(obj));
  });
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
