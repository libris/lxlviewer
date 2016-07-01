import * as httpUtil from './http';
import * as _ from 'lodash';

function fetchVocab() {
  return new Promise((resolve, reject) => {
    httpUtil.get({ url: '/vocab/', accept: 'application/ld+json' }).then((response) => {
      resolve(response);
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

export function getClass(classname, vocab, vocabPfx) {
  // Only try to get class for classes in this vocab
  if(vocabPfx && classname.indexOf(vocabPfx) !== -1) return;

  const _class = _.find(vocab.descriptions, (d) => { return d['@id'] === vocabPfx + classname; });
  if(!_class) {
    console.warn('class', classname, 'not found in vocab');
  }
  return _class;
}

export function getSubClasses(classname, vocab, vocabPfx) {
  const subClasses = _.filter(vocab.descriptions, (o) => {
    if (o.subClassOf) {
      for (let i = 0; i < o.subClassOf.length; i++) {
        if (o.subClassOf[i]['@id'] === vocabPfx + classname) return true;
      }
    }
  });
  if(!subClasses && subClasses.length === 0) {
    console.warn('subclasses for', vocabPfx + classname, 'not found in vocab');
  }
  return subClasses;
}
