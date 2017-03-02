import * as httpUtil from './http';
import * as _ from 'lodash';

function fetchVocab() {
  return new Promise((resolve, reject) => {
    httpUtil.get({ url: 'https://id.kb.se/vocab/', accept: 'application/ld+json' }).then((response) => {
      if (!response.hasOwnProperty('@graph') || !response['@graph'][0].hasOwnProperty('@id')) {
        reject(`Fetched vocabulary had an unexpected structure.`);
      } else {
        resolve(response);
      }
    }, (error) => {
      reject(`Couldn't fetch vocabulary: ${error}`);
    });
  });
}

export function getVocab() {
  // 8 hours
  const cacheTTL = 28800000;

  return new Promise((resolve, reject) => {
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
      }, (error) => {
        reject(error);
      });
    }
  });
}

export function getClass(classId, vocab, vocabPfx) {
  // Returns a class object

  if (!classId || typeof classId === 'undefined') {
    throw new Error('getClass was called with an undefined Id.');
  }

  if (classId.indexOf('@') !== -1) {
    return {};
  }

  const cn = classId.replace(vocabPfx, '');
  const _class = _.find(vocab, (d) => { return d['@id'] === vocabPfx + cn; });
  if (!_class) {
    console.warn('Not found in vocab:', cn);
  }
  return _class;
}

export function getPropertyTypes(propertyId, vocab, vocabPfx) {
  if (propertyId.indexOf('@') !== -1) {
    return [];
  }
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
  const subClasses = _.filter(vocab, (o) => {
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

export function getBaseClasses(classId, vocab, vocabPfx) {
  // Traverses up subClassOf properties and returns a list of all classes found

  if (!classId || typeof classId === 'undefined') {
    throw new Error('getBaseClasses was called with an undefined Id.');
  }

  let classList = [];
  const classObj = getClass(classId, vocab, vocabPfx);
  if (classObj && classObj.hasOwnProperty('subClassOf')) {
    for (let i = 0; i < classObj.subClassOf.length; i++) {
      const baseClassId = classObj.subClassOf[i]['@id'];
      const baseClass = getClass(baseClassId, vocab, vocabPfx);
      if (
        baseClass &&
        baseClass.isDefinedBy &&
        baseClass.isDefinedBy['@id'] === vocabPfx
      ) {
        classList = classList.concat(getBaseClasses(baseClassId, vocab, vocabPfx));
        classList.push(baseClassId);
      } else {
        //
      }
    }
  }
  // console.log("getBaseClasses(" + JSON.stringify(classId) + ")", JSON.stringify(classList));
  return classList;
}

export function getProperties(className, vocab, vocabPfx) {
  // Get all properties which has the domain of the className
  const vocabItems = vocab;
  const props = [];
  const cn = className.replace(vocabPfx, '');
  for (let i = 0; i < vocabItems.length; i++) {
    const prop = vocabItems[i];

    if (
      prop['@type'] !== 'Class' &&
      (prop.hasOwnProperty('domainIncludes') || prop.hasOwnProperty('domain'))
    ) {
      if (prop.hasOwnProperty('domainIncludes')) {
        for (let t = 0; t < prop.domainIncludes.length; t++) {
          const type = prop.domainIncludes[t]['@id'].replace(vocabPfx, '');
          if (cn === type) {
            props.push(prop);
          }
        }
      }
      if (prop.hasOwnProperty('domain')) {
        for (let t = 0; t < prop.domain.length; t++) {
          const type = prop.domain[t]['@id'].replace(vocabPfx, '');
          if (cn === type) {
            props.push(prop);
          }
        }
      }
    }
  }
  // console.log("getProperties("+JSON.stringify(className)+") ->", props.length, "properties found");
  return props;
}

export function getBaseClassesFromArray(typeArray, vocab, vocabPfx) {
  // Find the base classes from the types in typeArray and return a list of IDs.
  if (!typeArray || typeArray.length === 0) {
    throw new Error('getBaseClassesFromArray was called without types');
  }
  const types = [].concat(typeArray);

  let classes = [];
  for (let t = 0; t < types.length; t++) {
    if (types[t].indexOf('marc:') === -1) {
      const c = getClass(types[t], vocab, vocabPfx);
      if (typeof c !== 'undefined') {
        classes.push(c['@id']);
      }
      classes = classes.concat(getBaseClasses(c['@id'], vocab, vocabPfx));
    }
  }
  classes = _.uniq(classes);
  // console.log("getBaseClassesFromArray("+JSON.stringify(typeArray)+") ->", JSON.stringify(classes));
  return classes;
}

export function getPropertiesFromArray(typeArray, vocab, vocabPfx) {
  let props = [];
  const classNames = getBaseClassesFromArray(typeArray, vocab, vocabPfx);

  for (let i = 0; i < classNames.length; i++) {
    const properties = getProperties(classNames[i], vocab, vocabPfx);
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

export function isEmbedded(classId, vocab, settings) {
  if (!classId || typeof classId === 'undefined') {
    throw new Error('isEmbedded was called with an undedfined class id');
  }
  if (_.isObject(classId)) {
    throw new Error('isEmbedded was called with an object as class id (should be a string)');
  }

  const embeddedTypes = settings.embeddedTypes;
  const typeChain = getBaseClasses(classId, vocab, settings.vocabPfx);
  if (typeChain.length > 0) {
    for (const item of embeddedTypes) {
      if (~typeChain.indexOf(`${settings.vocabPfx}${item}`)) {
        return true;
      }
    }
  }
  return false;
}
