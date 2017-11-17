import * as httpUtil from './http';
import * as StringUtil from './string';
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

export function getContext() {
  return new Promise((resolve, reject) => {
    httpUtil.getResourceFromCache('/context.jsonld').then((result) => {
      resolve(result);
    }, (error) => {
      reject(error);
    });
  });
}

export function getForcedListTerms() {
  return new Promise((resolve, reject) => {
    httpUtil.getResourceFromCache('/sys/forcedsetterms.json').then((result) => {
      resolve(result);
    }, (error) => {
      reject(error);
    });
  });
}

export function getRecordType(mainEntityType, vocab, settings, context) {
  if (isSubClassOf(mainEntityType, 'Item', vocab, settings.vocabPfx, context)) {
    return 'Item';
  }
  if (isSubClassOf(mainEntityType, 'Instance', vocab, settings.vocabPfx, context)) {
    return 'Instance';
  } else if (isSubClassOf(mainEntityType, 'Work', vocab, settings.vocabPfx, context)) {
    return 'Work';
  } else if (isSubClassOf(mainEntityType, 'Agent', vocab, settings.vocabPfx, context)) {
    return 'Agent';
  } else if (isSubClassOf(mainEntityType, 'Concept', vocab, settings.vocabPfx, context)) {
    return 'Concept';
  }
  return 'Other';
}

export function getTermByType(type, list) {
  if (!list || typeof list === 'undefined') {
    throw new Error('getTermByType was called without a vocabulary.');
  }
  const termList = _.filter(list, (term) => {
    if (_.isArray(term['@type'])) {
      return term['@type'].indexOf(type) > -1;
    } else {
      return term['@type'] === type;
    }
  });
  return termList;
}

export function getTermFromLabel(label, language, vocab) {
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

export function getTermObject(term, vocab, vocabPfx, context) {
  // Returns a class object
  if (!term || typeof term === 'undefined') {
    throw new Error('getTermObject was called with an undefined Id.');
  }
  if (_.isObject(term)) {
    throw new Error('getTermObject was called with an object (should be a string).');
  }
  if (term.indexOf('@') !== -1) {
    return {};
  }
  let cn = term;
  let _class = vocab.get(cn);

  if (!_class) {
    _class = vocab.get(`${vocabPfx}${cn}`);
  }
  if (!_class) {
    cn = StringUtil.convertToBaseUri(cn, context);
    _class = vocab.get(cn);
  }

  if (!_class) {
    window.lxlWarning('Term object not found:', cn);
  }
  return _class;
}

export function getPropertyTypes(propertyId, vocab, vocabPfx, context) {
  if (propertyId.indexOf('@') !== -1) {
    return [];
  }
  const property = getTermObject(propertyId, vocab, vocabPfx, context);
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

export function getAllEnumerationTypesFor(onProp, vocab) {
  const enumerationTypes = [];
  vocab.forEach(term => {
    if (term.hasOwnProperty('subClassOf')) {
      _.each(term.subClassOf, (superClassObj) => {
        if (superClassObj.hasOwnProperty('@type') && superClassObj['@type'] === 'Restriction') {
          if (superClassObj.onProperty['@id'] === onProp) {
            if (superClassObj.hasOwnProperty('someValuesFrom')) {
              enumerationTypes.push(superClassObj.someValuesFrom['@id']);
            }
          }
        }
      });
    }
  });
  return enumerationTypes;
}

export function getValuesFrom(entityType, property, vocab, vocabPfx, context) {
  if (_.isPlainObject(property)) {
    throw new Error('getValuesFrom was called with an object as property id (should be a string)');
  }
  let result = [];
  const baseClasses = getBaseClasses(`${vocabPfx}${entityType}`, vocab, vocabPfx, context);
  baseClasses.forEach(baseClass => {
    const vocabEntry = vocab.get(baseClass);
    if (vocabEntry.hasOwnProperty('subClassOf')) {
      vocabEntry.subClassOf.forEach(subClassObject => {
        let embellishedObj = _.cloneDeep(subClassObject);
        if (Object.keys(embellishedObj).length === 1 &&
        embellishedObj.hasOwnProperty('@id') &&
        embellishedObj['@id'].indexOf('_:') > -1) {
          embellishedObj = getTermObject(embellishedObj['@id'], vocab, vocabPfx, context);
        }
        if (embellishedObj.hasOwnProperty('@type') &&
        embellishedObj['@type'] === 'Restriction' &&
        embellishedObj.onProperty['@id'] === `${vocabPfx}${property}`) {
          let key = '';
          if (embellishedObj.hasOwnProperty('someValuesFrom')) {
            key = 'someValuesFrom';
          } else if (embellishedObj.hasOwnProperty('allValuesFrom')) {
            key = 'allValuesFrom';
          }
          if (_.isArray(embellishedObj[key])) {
            _.each(embellishedObj[key], (list) => {
              result.push(list['@id']);
            });
          } else {
            result = [embellishedObj[key]['@id']];
          }
        }
      });
    }
  });
  return result.map(item => item.replace(vocabPfx, ''));
}

export function processRestrictions(range, entityType, property, vocab, vocabPfx, context) {
  const someAndAllValuesFrom = getValuesFrom(entityType, property, vocab, vocabPfx, context);
  if (someAndAllValuesFrom.length > 0) {
    return someAndAllValuesFrom;
  }
  return range;
}

export function getUnrestrictedRange(propertyId, vocab, vocabPfx, context) {
  if (typeof propertyId === 'undefined') {
    throw new Error('getRange was called without a property Id.');
  }
  
  const property = getTermObject(propertyId, vocab, vocabPfx, context);
  let range = [];
  if (!property) {
    return range;
  }
  if (property.range) {
    for (let i = 0; i < property.range.length; i++) {
      range.push(property.range[i]['@id']);
    }
  }
  if (property.rangeIncludes) {
    for (let i = 0; i < property.rangeIncludes.length; i++) {
      range.push(property.rangeIncludes[i]['@id']);
    }
  }
  if (property.hasOwnProperty('subPropertyOf')) {
    _.each(property.subPropertyOf, (prop) => {
      if (prop.hasOwnProperty('@id')) {
        range = range.concat(getUnrestrictedRange(prop['@id'], vocab, vocabPfx, context));
      }
    });
  }
  range = _.uniq(range);

  return range;
}

export function getRange(entityType, propertyId, vocab, vocabPfx, context) {
  const unrestrictedRange = getUnrestrictedRange(propertyId, vocab, vocabPfx, context);
  return processRestrictions(unrestrictedRange, entityType, propertyId, vocab, vocabPfx, context);
}

export function getSubClasses(classname, vocab, vocabPfx, context) {
  const subClasses = [];
  vocab.forEach((o) => {
    if (o.subClassOf) {
      for (let i = 0; i < o.subClassOf.length; i++) {
        if (o.subClassOf[i].hasOwnProperty('@id') && o.subClassOf[i]['@id'] === vocabPfx + classname) {
          subClasses.push(o['@id']);
        }
      }
    }
  });
  if (!subClasses && subClasses.length === 0) {
    console.warn('subclasses for', vocabPfx + classname, 'not found in vocab');
  }
  return subClasses;
}

export function getAllSubClasses(classArray, vocab, vocabPfx, context) {
  let inputSubClasses = [].concat(classArray);
  let newSubClasses = [];
  if (inputSubClasses.length > 0) {
    _.each(inputSubClasses, classId => {
      const className = classId.replace(vocabPfx, '');
      const subClasses = getSubClasses(className, vocab, vocabPfx, context);
      if (subClasses.length > 0) {
        newSubClasses = newSubClasses.concat(getAllSubClasses(subClasses, vocab, vocabPfx, context));
      }
    });
  }
  inputSubClasses = inputSubClasses.concat(newSubClasses);
  inputSubClasses = _.uniq(inputSubClasses);
  return inputSubClasses;
}

export function getFullRange(entityType, key, vocab, vocabPfx, context) {
  const types = [].concat(getRange(entityType, key, vocab, vocabPfx, context));
  let allTypes = [];
  _.each(types, type => {
    const typeInArray = [].concat(type);
    allTypes = allTypes.concat(getAllSubClasses(typeInArray, vocab, vocabPfx, context));
  });
  allTypes = _.uniq(allTypes);
  return allTypes;
}

export function getDomainList(property, vocab, vocabPfx, context) {
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
  if (property.hasOwnProperty('subPropertyOf')) {
    for (const superPropNode of property.subPropertyOf) {
      if (superPropNode['@id'] && superPropNode['@id'].indexOf(vocabPfx) !== -1) {
        const superProp = getTermObject(superPropNode['@id'], vocab, vocabPfx, context);
        if (superProp) {
          domainList = domainList.concat(getDomainList(superProp, vocab, vocabPfx, context));
        }
      }
    }
  }
  return domainList;
}

export function getProperties(className, vocab, vocabPfx, vocabProperties, context) {
  // Get all properties which has the domain of the className
  const props = [];
  const cn = className.replace(vocabPfx, '');
  // console.log("Getting props for", className);
  vocabProperties.forEach(prop => {
    const domainList = getDomainList(prop, vocab, vocabPfx, context);
    const classId = vocabPfx + cn;
    for (const domain of domainList) {
      if (domain['@id'] === classId) {
        props.push(prop);
      }
    }
  });

  // HARDCODED INCLUDE OF GENERAL PROPERTIES
  // TODO: Remove when label has a domain
  const labelProperty = getTermObject('label', vocab, vocabPfx, context);
  props.push(labelProperty);
  const noteProperty = getTermObject('note', vocab, vocabPfx, context);
  props.push(noteProperty);
  const valueProperty = getTermObject('value', vocab, vocabPfx, context);
  props.push(valueProperty);
  const codeProperty = getTermObject('code', vocab, vocabPfx, context);
  props.push(codeProperty);
  // end HARDCODED
  return props;
}

export function getBaseClasses(classId, vocab, vocabPfx, context) {
  // Traverses up subClassOf properties and returns a list of all classes found

  if (!classId || typeof classId === 'undefined') {
    throw new Error('getBaseClasses was called with an undefined Id.');
  }

  let classList = [];
  const termObj = getTermObject(classId, vocab, vocabPfx, context);
  if (typeof termObj === 'undefined') {
    return _.uniq(classList);
  }
  classList.push(termObj['@id']);
  if (termObj && termObj.hasOwnProperty('subClassOf')) {
    for (let i = 0; i < termObj.subClassOf.length; i++) {
      const baseClassId = termObj.subClassOf[i]['@id'];
      let baseClass = {};
      if (baseClassId) {
        baseClass = getTermObject(baseClassId, vocab, vocabPfx, context);
      }
      if (
        baseClass &&
        baseClass.isDefinedBy &&
        baseClass.isDefinedBy['@id'] === vocabPfx
      ) {
        classList = classList.concat(getBaseClasses(baseClassId, vocab, vocabPfx, context));
        classList.push(baseClassId);
      } else {
        //
      }
    }
  }
  // console.log("getBaseClasses(" + JSON.stringify(classId) + ")", JSON.stringify(classList));
  return _.uniq(classList);
}

export function getBaseClassesFromArray(typeArray, vocab, vocabPfx, context) {
  // Find the base classes from the types in typeArray and return a list of IDs.
  if (!typeArray || typeArray.length === 0) {
    throw new Error('getBaseClassesFromArray was called without types');
  }
  const types = [].concat(typeArray);

  let classes = [];
  for (let t = 0; t < types.length; t++) {
    if (types[t].indexOf('marc:') === -1) {
      const c = getTermObject(types[t], vocab, vocabPfx, context);
      if (typeof c !== 'undefined') {
        classes.push(c['@id']);
        classes = classes.concat(getBaseClasses(c['@id'], vocab, vocabPfx, context));
      }
    }
  }
  classes = _.uniq(classes);
  // console.log("getBaseClassesFromArray("+JSON.stringify(typeArray)+") ->", JSON.stringify(classes));
  return classes;
}

export function hasValuesInVocab(propertyId, context) {
  if (context[1].hasOwnProperty(propertyId)) {
    if (context[1][propertyId]['@type'] === '@vocab') {
      return true;
    }
  }
  return false;
}

export function isSubClassOf(classId, baseClassId, vocab, vocabPfx, context) {
  if (!classId || typeof classId === 'undefined') {
    throw new Error('isSubClassOf was called without a classId or classId array');
  }
  if (!baseClassId || typeof baseClassId === 'undefined') {
    throw new Error('isSubClassOf was called without a baseClassId');
  }

  let baseClasses;
  if (_.isArray(classId)) {
    baseClasses = getBaseClassesFromArray(classId, vocab, vocabPfx, context);
  } else {
    baseClasses = getBaseClasses(classId, vocab, vocabPfx, context);
  }
  if (baseClasses.indexOf(`${vocabPfx}${baseClassId}`) > -1) {
    return true;
  }
  return false;
}

export function getPropertiesFromArray(typeArray, vocab, vocabPfx, vocabProperties, context) {
  let props = [];
  const classNames = getBaseClassesFromArray(typeArray, vocab, vocabPfx, context);

  for (let i = 0; i < classNames.length; i++) {
    const properties = getProperties(classNames[i], vocab, vocabPfx, vocabProperties, context);
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

export function isEmbedded(classId, vocab, settings, context) {
  if (!classId || typeof classId === 'undefined') {
    throw new Error('isEmbedded was called with an undedfined class id');
  }
  if (_.isObject(classId)) {
    throw new Error('isEmbedded was called with an object as class id (should be a string)');
  }
  const embeddedTypes = settings.embeddedTypes;
  const typeChain = getBaseClasses(classId, vocab, settings.vocabPfx, context);
  if (typeChain.length > 0) {
    for (const item of embeddedTypes) {
      if (~typeChain.indexOf(`${settings.vocabPfx}${item}`)) {
        return true;
      }
    }
  }
  return false;
}

export function getInstances(className, vocab, vocabPfx) {
  const instances = [];
  vocab.forEach(vocabObj => {
    if (typeof vocabObj['@type'] !== 'undefined' && vocabObj['@type'].indexOf(`${className}`) > -1) {
      instances.push(vocabObj['@id'].replace(vocabPfx, ''));
    }
  });
  return instances;
}

export function getContextProperty(propertyId, context) {
  const originalKey = propertyId;
  const contextProperty = originalKey;
  const contextList = context[1];
  let resultProp = originalKey;

  if (contextList.hasOwnProperty(contextProperty)) {
    if (!_.isPlainObject(contextList[contextProperty])) {
      resultProp = originalKey;
    } else {
      resultProp = contextList[contextProperty]['@id'];
    }
  }
  return resultProp;
}

export function getContextWithContainer(propertyId, context) {
  const contextList = context[1];

  let contextObj = undefined;
  _.forOwn(contextList, (value, key) => {
    if (typeof value !== 'undefined' && value !== null) {
      if (value.hasOwnProperty('@id') && value['@id'] === propertyId && value.hasOwnProperty('@container')) {
        contextObj = { '@id': key, '@container': value['@container'] };
      }
    }
  });
  return contextObj;
}

export function getBaseUriFromPrefix(prefix, context) {
  // Returns a baseUri as a string that corresponds to the provided prefix.
  const contextList = context[0];
  let baseUri = '';
  if (contextList.hasOwnProperty(prefix) && !_.isPlainObject(contextList[prefix])) {
    baseUri = contextList[prefix];
  }
  if (baseUri === '') {
    window.lxlWarning('Couldn\'t get baseUri from prefix:', prefix);
  }
  return baseUri;
}

export function getPrefixesFromBaseUri(baseUri, context) {
  // Returns an ARRAY of prefixe that correspond to the provided baseUri.
  const contextList = context[0];
  const prefixes = [];
  _.forOwn(contextList, (value, key) => {
    if (value === baseUri) {
      prefixes.push(key);
    }
  });
  if (prefixes.length === 0) {
    window.lxlWarning('Couldn\'t get prefixes from baseUri:', baseUri);
  }
  return prefixes;
}

export function getEnumerations(entityType, property, vocab, vocabPfx, context) {
  const enumerationKeys = getValuesFrom(entityType, property, vocab, vocabPfx, context)
  .map(enumerationKey => `@type=${enumerationKey}`);
  if (enumerationKeys.length > 0) {
    const enumerationUrl = enumerationKeys.join('&');
    return new Promise((resolve, reject) => {
      httpUtil.get({ url: `/find?${enumerationUrl}`, accept: 'application/ld+json' }).then((response) => {
        resolve(response.items);
      }, (error) => {
        reject('Error searching...', error);
      });
    });
  }
  const enumerationTypesUrl = getAllEnumerationTypesFor(`${vocabPfx}${property}`, vocab, vocabPfx)
    .map(enumerationType => `@type=${enumerationType}`)
    .join('&');
  return new Promise((resolve, reject) => {
    httpUtil.get({ url: `/find?@type=${enumerationTypesUrl}`, accept: 'application/ld+json' }).then((response) => {
      resolve(response.items);
    }, (error) => {
      reject('Error searching...', error);
    });
  });
}
