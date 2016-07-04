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
  // Returns a class object
  const cn = classname.replace(vocabPfx, '');
  const _class = _.find(vocab.descriptions, (d) => { return d['@id'] === vocabPfx + cn; });
  if (!_class) {
    console.warn('class', cn, 'not found in vocab');
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

export function getBaseClasses(classObj, vocab, vocabPfx) {
  // Traverses up subClassOf properties and returns a list of all class objects found
  let items = [];
  if (classObj && classObj.hasOwnProperty('subClassOf')) {
    for (let i = 0; i < classObj.subClassOf.length; i++) {
      const baseClassId = classObj.subClassOf[i]['@id'];
      const baseClass = getClass(baseClassId, vocab, vocabPfx);
      if (
        baseClass &&
        baseClass.isDefinedBy &&
        baseClass.isDefinedBy['@id'] === vocabPfx
      ) {
        items = items.concat(getBaseClasses(baseClass, vocab, vocabPfx));
        items.push(baseClass);
      } else {
        // console.log("Stopped at", baseClassId);
      }
    }
  }
  return items;
}
