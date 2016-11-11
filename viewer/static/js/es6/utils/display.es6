import * as httpUtil from './http';

function fetchDisplayDefinitions() {
  return new Promise((resolve, reject) => {
    httpUtil.get({ url: 'https://id.kb.se/vocab/display', accept: 'application/ld+json' }).then((response) => {
      resolve(response);
    }, (error) => {
      reject(`Couldn't fetch display definitions: ${error}`);
    });
  });
}

export function getDisplayDefinitions() {
  // 8 hours
  const cacheTTL = 28800000;

  return new Promise((resolve, reject) => {
    const displayDefs = JSON.parse(localStorage.getItem('display'));

    let isFresh = false;
    if (displayDefs) {
      isFresh = (new Date().getTime() - displayDefs.cacheTime < cacheTTL);
    }

    if (displayDefs && isFresh) {
      resolve(displayDefs);
    } else {
      fetchDisplayDefinitions().then((result) => {
        const fetchedDisplayDefs = result;
        fetchedDisplayDefs.cacheTime = new Date().getTime();
        localStorage.setItem('display', JSON.stringify(fetchedDisplayDefs));
        resolve(fetchedDisplayDefs);
      }, (error) => {
        reject(error);
      });
    }
  });
}

export function getProperties(type, level, displayDefs) {
  const lenses = displayDefs.lensGroups[level].lenses;
  let props = [];
  if (typeof lenses[type] !== 'undefined') {
    props = lenses[type].showProperties;
  }
  return props;
}
