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
    console.warn('Class not found in vocab:', cn);
  }
  return _class;
}

export function getPropertyTypes(propertyId, vocab, vocabPfx) {
  const property = getClass(propertyId, vocab, vocabPfx);
  if (property) {
    const typeAttr = property['@type'].toString();
    let types = [];
    if (typeAttr.indexOf(',')) {
      types = typeAttr.split(',');
    } else {
      types = [typeAttr];
    }
    return types;
  }
  return [];
}

export function getRange(propertyId, vocab, vocabPfx) {
  const property = getClass(propertyId, vocab, vocabPfx);
  let range = [];
  if (!property) {
    return range;
  }
  if (property.rangeIncludes) {
    for (let i = 0; i < property.rangeIncludes.length; i++) {
      range.push(property.rangeIncludes[i]['@id'].replace(vocabPfx, ''));
    }
  }
  if (property.range) {
    for (let i = 0; i < property.range.length; i++) {
      range.push(property.range[i]['@id'].replace(vocabPfx, ''));
    }
  }
  range = _.uniq(range);
  return range;
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

export function getProperties(className, vocab) {
  // Get all properties which has the domain of the className
  const vocabItems = vocab.descriptions;
  const props = [];
  for (let i = 0; i < vocabItems.length; i++) {
    if (vocabItems[i].hasOwnProperty('domainIncludes')) {
      for (let t = 0; t < vocabItems[i].domainIncludes.length; t++) {
        const prop = vocabItems[i];
        const type = vocabItems[i].domainIncludes[t]['@id'];
        if (className === type) {
          props.push(prop);
        }
      }
    }
  }
  return props;
}

export function getInheritedProperties(classArray, vocab, vocabPfx) {
  let props = [];
  // Types defined on the item
  const types = [].concat(classArray);

  // Find their base classes and make a list of their IDs
  let classes = [];
  for (let t = 0; t < types.length; t++) {
    const c = getClass(types[t], vocab, vocabPfx);
    if (typeof c !== 'undefined') {
      classes.push(c);
    }
    classes = classes.concat(getBaseClasses(c, vocab, vocabPfx));
  }
  const classNames = [];
  for (let i = 0; i < classes.length; i++) {
    classNames.push(classes[i]['@id']);
  }

  for (let i = 0; i < classNames.length; i++) {
    const properties = getProperties(classNames[i], vocab);
    for (let x = 0; x < properties.length; x++) {
      const p = {
        item: properties[x],
      };
      props.push(p);
    }
  }
  props = _.uniqBy(props, 'item.@id');
  return props;
}
