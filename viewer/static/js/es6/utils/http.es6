export function post(obj, url) {
  return new Promise(function(resolve, reject) {
    let req = new XMLHttpRequest();
    req.open('POST', url);

    // Faking malformed request
    if (Math.random() > 0.7) {
      req.setRequestHeader("Content-Type", "application/WOWTHISISNOTCORRECTATALL");
    } else {
      req.setRequestHeader("Content-Type", "application/ld+json");
    }

    req.onload = function () {
      if (req.status == 200 || req.status == 204) {
        resolve(req.response);
      } else {
        reject(Error(req.statusText));
      }
    };
    req.onerror = function() {
      reject(Error("Network error"));
    }

    // LETS FAKE LAG YO
    setTimeout( function() {
      req.send(obj);
    }, 1000);

  });
}

export function getContent(url, type) {
  return new Promise(function(resolve, reject) {
    let req = new XMLHttpRequest();
    req.open('GET', url);

    if (type) {
      req.setRequestHeader('Accept', type);
    }

    req.onload = function() {
      if (req.status == 200) {
        resolve(req.response);
      }
      else {
        reject(Error(req.statusText));
      }
    };
    req.onerror = function() {
      reject(Error("Network Error"));
    };
    req.send();

  });
}
