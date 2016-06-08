import * as httpUtil from './http';
import * as _ from 'lodash';

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

  return new Promise((resolve) => {
    const vocab = JSON.parse(localStorage.getItem('vocab'));

    let isFresh = false;
    if (vocab) {
      isFresh = (new Date().getTime() - vocab.cacheTime < cacheTTL);
    }

    if (vocab && isFresh) {
      resolve(vocab);
    } else {
      fetchVocab().then((result) => {
        const fetchedVocab = result;
        fetchedVocab.cacheTime = new Date().getTime();
        localStorage.setItem('vocab', JSON.stringify(fetchedVocab));
        resolve(fetchedVocab);
      });
    }
  });
}

export function getClass(classname, vocab) {
  const _class = _.find(vocab.descriptions, (d) => { return d['@id'] === classname; });
  if(!_class) {
    console.warn('class', classname, 'not found in vocab');
  }
  return _class;
}

export function getSubClasses(classname, vocab) {
  const subClasses = _.filter(vocab.descriptions, (o) => {
    if (o.subClassOf) {
      for (let i = 0; i < o.subClassOf.length; i++) {
        if (o.subClassOf[i]['@id'] === classname) return true;
      }
    }
  });
  if(!subClasses && subclasses.length === 0) {
    console.warn('subclasses', classname, 'not found in vocab');
  }
  return subClasses;
}
