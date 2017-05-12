import * as httpUtil from './http';
import * as _ from 'lodash';

export function getVocab() {
  return new Promise((resolve, reject) => {
    httpUtil.getResourceFromCache('/https://id.kb.se/vocab/').then((result) => {
      resolve(result);
    }, (error) => {
      reject(error);
    });
  });
}

export function getTermFromLabel(label, language, vocab, vocabPfx) {
  const classObject = _.find(vocab, (obj) => {
    let existingLang = language;
    if (typeof obj.labelByLang === 'undefined') {
      return false;
    } else if (typeof obj.labelByLang[language] === 'undefined') {
      existingLang = 'en';
    }
    if (_.isArray(obj.labelByLang[existingLang])) {
      for (const lbl of obj.labelByLang[existingLang]) {
        if (lbl.toLowerCase() === label.toLowerCase()) {
          return true;
        }
      }
    } else {
      return obj.labelByLang[existingLang].toLowerCase() === label.toLowerCase();
    }
  });
  return classObject;
}

export function getTerm(term, vocab, vocabPfx) {
  // Returns a class object

  if (!term || typeof term === 'undefined') {
    throw new Error('getTerm was called with an undefined Id.');
  }

  if (term.indexOf('@') !== -1) {
    return {};
  }

  const cn = term.replace(vocabPfx, '');
  const _class = _.find(vocab, (d) => { return d['@id'] === vocabPfx + cn; });
  if (!_class) {
    // console.warn('Not found in vocab:', cn);
  }
  return _class;
}

export function getTermsByType(type, vocab) {
  if (!vocab || typeof vocab === 'undefined') {
    throw new Error('getTermsByType was called without a vocabulary.');
  }
  return _.filter(vocab, function(o) { return o['@type'] === type; });
}

export function getPropertyTypes(propertyId, vocab, vocabPfx) {
  if (propertyId.indexOf('@') !== -1) {
    return [];
  }
  const property = getTerm(propertyId, vocab, vocabPfx);
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
  const property = getTerm(propertyId, vocab, vocabPfx);
  let range = [];
  if (!property) {
    return range;
  }
  if (property.rangeIncludes) {
    for (let i = 0; i < property.rangeIncludes.length; i++) {
      range.push(property.rangeIncludes[i]['@id']);
    }
  }
  if (property.range) {
    for (let i = 0; i < property.range.length; i++) {
      range.push(property.range[i]['@id']);
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

export function getDomainList(property, vocab, vocabPfx) {

  if (property['@type'] === 'Class') {
    return false;
  }
  let domainList = [];
  if (property.hasOwnProperty('domain')) {
    domainList = domainList.concat(property.domain);
  }
  if (property.hasOwnProperty('domainIncludes')) {
    domainList = domainList.concat(property.domainIncludes);
  }
  if (domainList.length === 0 && property.hasOwnProperty('subPropertyOf')) {
    for (const superPropNode of property.subPropertyOf) {
      if (superPropNode['@id'] && superPropNode['@id'].indexOf(vocabPfx) !== -1) {
        const superProp = getTerm(superPropNode['@id'], vocab, vocabPfx);
        if (superProp) {
          domainList = domainList.concat(getDomainList(superProp, vocab, vocabPfx));
        }
      }
    }
  }

  return domainList;
}

export function getProperties(className, vocab, vocabPfx) {
  // Get all properties which has the domain of the className

  const vocabItems = vocab;
  const props = [];
  const cn = className.replace(vocabPfx, '');
  // console.log("Getting props for", className);
  for (let i = 0; i < vocabItems.length; i++) {
    const prop = vocabItems[i];
    if (prop['@type'] !== 'Class') {
      const domainList = getDomainList(prop, vocab, vocabPfx);
      const classId = vocabPfx + cn;
      for (const domain of domainList) {
        if (domain['@id'] === classId) {
          props.push(prop);
        }
      }
    }
  }
  console.log("getProperties("+JSON.stringify(className)+") ->", props.length, "properties found");
  return props;
}

export function getBaseClasses(classId, vocab, vocabPfx) {
  // Traverses up subClassOf properties and returns a list of all classes found

  if (!classId || typeof classId === 'undefined') {
    throw new Error('getBaseClasses was called with an undefined Id.');
  }

  let classList = [];
  const termObj = getTerm(classId, vocab, vocabPfx);
  if (typeof termObj === 'undefined') {
    return classList;
  }
  classList.push(termObj['@id']);
  if (termObj && termObj.hasOwnProperty('subClassOf')) {
    for (let i = 0; i < termObj.subClassOf.length; i++) {
      const baseClassId = termObj.subClassOf[i]['@id'];
      let baseClass = {};
      if (baseClassId) {
        baseClass = getTerm(baseClassId, vocab, vocabPfx);
      }
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

export function getBaseClassesFromArray(typeArray, vocab, vocabPfx) {
  // Find the base classes from the types in typeArray and return a list of IDs.
  if (!typeArray || typeArray.length === 0) {
    throw new Error('getBaseClassesFromArray was called without types');
  }
  const types = [].concat(typeArray);

  let classes = [];
  for (let t = 0; t < types.length; t++) {
    if (types[t].indexOf('marc:') === -1) {
      const c = getTerm(types[t], vocab, vocabPfx);
      if (typeof c !== 'undefined') {
        classes.push(c['@id']);
        classes = classes.concat(getBaseClasses(c['@id'], vocab, vocabPfx));
      }
    }
  }
  classes = _.uniq(classes);
  // console.log("getBaseClassesFromArray("+JSON.stringify(typeArray)+") ->", JSON.stringify(classes));
  return classes;
}

export function isSubClassOf(classId, baseClassId, vocab, vocabPfx) {
  if (!classId || typeof classId === 'undefined') {
    throw new Error('isSubClassOf was called without a classId');
  }
  if (!baseClassId || typeof baseClassId === 'undefined') {
    throw new Error('isSubClassOf was called without a baseClassId');
  }
  const baseClasses = getBaseClasses(classId, vocab, vocabPfx);
  if (baseClasses.indexOf(`${vocabPfx}${baseClassId}`) > -1) {
    return true;
  }
  return false;
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
