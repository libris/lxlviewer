import * as httpUtil from './http';

function fetchVocab() {
  return new Promise((resolve, reject) => {
    httpUtil.getContent('/vocab/', 'application/ld+json').then((response) => {
      resolve(JSON.parse(response));
    }, (error) => {
      reject('Error loading vocabulary...', error);
    });
  });
}

export function getVocab() {

  // 8 hours
  const cacheTTL = 28800000;

  return new Promise((resolve, reject) => {
    const vocab = JSON.parse(localStorage.getItem('vocab'));
    const isFresh = (new Date().getTime() - vocab.cacheTime < cacheTTL);

    if (vocab && isFresh) {
      resolve(vocab);
    } else {
      fetchVocab().then((vocab) => {
        vocab.cacheTime = new Date().getTime();
        localStorage.setItem('vocab', JSON.stringify(vocab));
        resolve(vocab);
      });
    }
  })
}
