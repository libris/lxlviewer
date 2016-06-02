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
  // TODO: Some condition
  const isFresh = true;

  return new Promise((resolve, reject) => {
    const vocab = JSON.parse(localStorage.getItem('vocab'));

    if (vocab && isFresh) resolve(vocab);

    fetchVocab().then((vocab) => {
      localStorage.setItem('vocab', JSON.stringify(vocab));
      resolve(vocab);
    });
  })
}
