import * as httpUtil from './http';
import * as StringUtil from './string';
import * as _ from 'lodash';

export function getVocab(apiPath) {
  return new Promise((resolve, reject) => {
    httpUtil.getResourceFromCache(`${apiPath}/vocab/data.jsonld`).then((result) => {
      resolve(result);
    }, (error) => {
      reject(error);
    });
  });
}

export function getContext(apiPath) {
  return new Promise((resolve, reject) => {
    httpUtil.getResourceFromCache(`${apiPath}/context.jsonld`).then((result) => {
      resolve(result);
    }, (error) => {
      reject(error);
    });
  });
}

export function getTermObject(term, vocab, context) {
  // Returns a class object
  if (!term || typeof term === 'undefined') {
    throw new Error('getTermObject was called with an undefined Id.');
  }
  if (_.isObject(term)) {
    throw new Error(
      'getTermObject was called with an object (should be a string).',
      JSON.stringify(term)
    );
  }
  if (term.indexOf('@') !== -1) {
    return {};
  }
  const tries = [];
  let cn = term;
  let _class = vocab.get(cn);
  tries.push(cn);
  const vocabPfx = context[0]['@vocab'];

  if (!_class && term.indexOf('://') === -1) {
    cn = `${vocabPfx}${term}`;
    _class = vocab.get(cn);
    tries.push(cn);
  }
  if (!_class && term.indexOf('://') > -1) {
    // Try to get with Prefix
    cn = StringUtil.convertToPrefix(term, context);
    if (cn[0] !== ':') {
      _class = vocab.get(cn);
      tries.push(cn);
    }
  } else if (!_class && term.indexOf(':') > -1) {
    // Try to get with baseUri
    cn = StringUtil.convertToBaseUri(term, context);
    if (cn[0] !== ':') {
      _class = vocab.get(cn);
      tries.push(cn);
    }
  }

  if (!_class) {
    // window.lxlWarning('📘 Term lookup failed:', term, '| Tried :', tries.join(', '));
  }
  return _class;
}


export function getBaseClasses(classId, vocab, context) {
  // Traverses up subClassOf properties and returns a list of all classes found

  if (!classId || typeof classId === 'undefined') {
    throw new Error('getBaseClasses was called with an undefined Id.');
  }
  let classList = [];
  const termObj = getTermObject(classId, vocab, context);
  if (typeof termObj === 'undefined') {
    return _.uniq(classList);
  }
  classList.push(StringUtil.getCompactUri(termObj['@id'], context));
  if (termObj.baseClassChain) { // Alredy calculated
    classList = classList.concat(termObj.baseClassChain);
    return _.uniq(classList);
  }
  if (termObj && termObj.hasOwnProperty('subClassOf')) {
    termObj.subClassOf.forEach(obj => {
      if (typeof obj['@type'] === 'undefined') {
        if (obj['@id']) {
          const baseClass = getTermObject(obj['@id'], vocab, context);
          if (baseClass) {
            classList = classList.concat(getBaseClasses(baseClass['@id'], vocab, context));
            classList.push(StringUtil.getCompactUri(baseClass['@id'], context));
          }
        }
      }
    });
  }
  termObj.baseClassChain = _.uniq(classList);
  // console.log("getBaseClasses(" + JSON.stringify(classId) + ")", JSON.stringify(classList));
  return _.uniq(classList);
}

export function getBaseClassesFromArray(typeArray, vocab, context) {
  // Find the base classes from the types in typeArray and return a list of IDs.
  if (!typeArray || typeArray.length === 0) {
    throw new Error('getBaseClassesFromArray was called without types');
  }
  const types = [].concat(typeArray);

  let classes = [];
  for (let t = 0; t < types.length; t++) {
    const c = getTermObject(types[t], vocab, context);
    if (typeof c !== 'undefined') {
      classes.push(StringUtil.getCompactUri(c['@id'], context));
      classes = classes.concat(getBaseClasses(c['@id'], vocab, context));
    }
  }
  classes = _.uniq(classes);
  // console.log("getBaseClassesFromArray("+JSON.stringify(typeArray)+") ->", JSON.stringify(classes));
  return classes;
}

export function isSubClassOf(classId, baseClassId, vocab, context) {
  if (!classId || typeof classId === 'undefined') {
    throw new Error('isSubClassOf was called without a classId or classId array');
  }
  if (!baseClassId || typeof baseClassId === 'undefined') {
    throw new Error('isSubClassOf was called without a baseClassId');
  }

  let baseClasses;
  if (_.isArray(classId)) {
    baseClasses = getBaseClassesFromArray(classId, vocab, context);
  } else {
    baseClasses = getBaseClasses(classId, vocab, context);
  }
  if (baseClasses.indexOf(baseClassId) > -1) {
    return true;
  }
  return false;
}

export function getRecordType(mainEntityType, vocab, context) {
  if (isSubClassOf(mainEntityType, 'Item', vocab, context)) {
    return 'Item';
  }
  if (isSubClassOf(mainEntityType, 'Instance', vocab, context)) {
    return 'Instance';
  } else if (isSubClassOf(mainEntityType, 'Work', vocab, context)) {
    return 'Work';
  } else if (isSubClassOf(mainEntityType, 'Agent', vocab, context)) {
    return 'Agent';
  } else if (isSubClassOf(mainEntityType, 'Concept', vocab, context)) {
    return 'Concept';
  }
  return 'Other';
}

function isFiltered(termObj, settings) {
  // Return true if term has any of the filteredCategories, else false
  const filteredCategories = settings.filteredCategories;
  for (let i = 0; i < filteredCategories.length; i++) {
    if (termObj.hasOwnProperty('category') && termObj.category['@id'] === `https://id.kb.se/vocab/${filteredCategories[i]}`) {
      // window.lxlWarning(`🗑️ Filtered ${filteredCategories[i]} class:`, termObj['@id']);
      return true;
    }
  }
  return false;
}

export function getTermByType(type, list, context, settings) {
  if (!list || typeof list === 'undefined') {
    throw new Error('getTermByType was called without a vocabulary.');
  }
  const expandedType = StringUtil.convertToBaseUri(type, context);
  const terms = [];
  list.forEach((term) => {
    if (!isFiltered(term, settings)) { // Only add if term should not be filtered
      if (_.isArray(term['@type'])) {
        if (term['@type'].indexOf(type) > -1 || term['@type'].indexOf(expandedType) > -1) {
          terms.push(term);
        }
      } else {
        if (term['@type'] === type || term['@type'] === expandedType) {
          terms.push(term);
        }
      }
    }
  });
  return terms;
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

export function getPropertyTypes(propertyId, vocab, context) {
  if (propertyId.indexOf('@') !== -1) {
    return [];
  }
  const property = getTermObject(propertyId, vocab, context);
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

export function getValuesFrom(restrictionProperty, entityType, property, vocab, context) {
  if (typeof entityType === 'undefined') {
    throw new Error('getValuesFrom was called without an entityType');
  }
  if (_.isPlainObject(property)) {
    throw new Error('getValuesFrom was called with an object as property id (should be a string)');
  }
  let result = [];
  const baseClasses = getBaseClasses(entityType, vocab, context);
  baseClasses.forEach(baseClass => {
    const vocabEntry = getTermObject(baseClass, vocab, context);
    if (vocabEntry.hasOwnProperty('subClassOf')) {
      vocabEntry.subClassOf.forEach(subClassObject => {
        let embellishedObj = _.cloneDeep(subClassObject);
        if (
          Object.keys(embellishedObj).length === 1 &&
          embellishedObj.hasOwnProperty('@id') &&
          embellishedObj['@id'].indexOf('_:') > -1
        ) {
          embellishedObj = getTermObject(embellishedObj['@id'], vocab, context);
        }
        if (
          embellishedObj.hasOwnProperty('@type') &&
          embellishedObj['@type'] === 'Restriction' &&
          StringUtil.getCompactUri(embellishedObj.onProperty['@id'], context) === StringUtil.getCompactUri(property, context)
        ) {
          if (embellishedObj.hasOwnProperty(restrictionProperty)) {
            if (_.isArray(embellishedObj[restrictionProperty])) {
              _.each(embellishedObj[restrictionProperty], (list) => {
                result.push(list['@id']);
              });
            } else {
              result = [embellishedObj[restrictionProperty]['@id']];
            }
          }
        }
      });
    }
  });
  return result.map(item => StringUtil.getCompactUri(item, context));
}

export function processRestrictions(range, entityType, property, vocab, context) {
  const allValuesFrom = getValuesFrom('allValuesFrom', entityType, property, vocab, context);
  if (allValuesFrom.length > 0) {
    return allValuesFrom;
  }
  return range.concat(getValuesFrom('someValuesFrom', entityType, property, vocab, context));
}

export function getUnrestrictedRange(propertyId, vocab, context) {
  if (typeof propertyId === 'undefined') {
    throw new Error('getUnrestrictedRange was called without a property Id.');
  }

  const property = getTermObject(propertyId, vocab, context);
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
  if (range.length === 0 && property.hasOwnProperty('subPropertyOf')) {
    _.each(property.subPropertyOf, (prop) => {
      if (prop.hasOwnProperty('@id')) {
        range = range.concat(getUnrestrictedRange(prop['@id'], vocab, context));
      }
    });
  }
  range = _.uniq(range);
  return range;
}

export function getRange(entityType, propertyId, vocab, context) {
  const unrestrictedRange = getUnrestrictedRange(propertyId, vocab, context);
  return processRestrictions(unrestrictedRange, entityType, propertyId, vocab, context);
}

export function getFullRange(entityType, key, vocab, context, vocabClasses) {
  const types = [].concat(getRange(entityType, key, vocab, context));
  let allTypes = [];
  _.each(types, type => {
    allTypes = allTypes.concat(getSubClassChain(type, vocabClasses, context));
  });
  allTypes = _.uniq(allTypes);
  return allTypes;
}

export function getSubClasses(classname, vocabClasses, context) {
  const classObj = getTermObject(classname, vocabClasses, context);
  let subClasses = [];
  if (typeof classObj !== 'undefined' && classObj.hasOwnProperty('baseClassOf')) {
    subClasses = classObj.baseClassOf;
  }
  return subClasses;
}

export function getSubClassChain(classname, vocabClasses, context) {
  const classObj = getTermObject(classname, vocabClasses, context);
  if (typeof classObj === 'undefined') {
    return [];
  }
  if (classObj.hasOwnProperty('subClassChain')) {
    return classObj.subClassChain;
  }
  const subClassChain = [classname].concat(getAllSubClasses(
    getSubClasses(classname, vocabClasses, context),
    vocabClasses,
    context,
  ));
  const curieChain = subClassChain.map((subClass) => {
    return StringUtil.getCompactUri(subClass, context);
  });
  classObj.subClassChain = curieChain;
  return subClassChain;
}

export function getAllSubClasses(classArray, vocabClasses, context) {
  let inputSubClasses = [].concat(classArray);
  let newSubClasses = [];
  if (inputSubClasses.length > 0) {
    _.each(inputSubClasses, classId => {
      const className = StringUtil.getCompactUri(classId, context);
      const subClasses = getSubClasses(className, vocabClasses, context);
      if (subClasses.length > 0) {
        newSubClasses = newSubClasses.concat(getAllSubClasses(subClasses, vocabClasses, context));
      }
    });
  }
  inputSubClasses = inputSubClasses.concat(newSubClasses);
  inputSubClasses = _.uniq(inputSubClasses);
  return inputSubClasses;
}

export function getDomainList(property, vocab, context) {
  if (property['@type'] === 'Class') {
    return false;
  }
  let domainList = [];
  const vocabPfx = context[0]['@vocab'];
  if (property.hasOwnProperty('domain')) {
    domainList = domainList.concat(property.domain.map(obj => obj['@id']));
  }
  if (property.hasOwnProperty('domainIncludes')) {
    domainList = domainList.concat(property.domainIncludes.map(obj => obj['@id']));
  }
  if (property.hasOwnProperty('subPropertyOf') && domainList.length === 0) {
    for (const superPropNode of property.subPropertyOf) {
      if (superPropNode['@id'] && superPropNode['@id'].indexOf(vocabPfx) !== -1) {
        const superProp = getTermObject(superPropNode['@id'], vocab, context);
        if (superProp) {
          domainList = domainList.concat(getDomainList(superProp, vocab, context));
        }
      }
    }
  }
  return domainList.map((item) => StringUtil.getCompactUri(item, context));
}

export function getProperties(classId, vocabClasses, vocabProperties, context) {
  // Get all properties which has the domain of the className
  const props = [];
  // console.log("Getting props for", className);
  const termObj = getTermObject(classId, vocabClasses, context);
  if (termObj.allowedProperties) {
    return termObj.allowedProperties;
  }
  vocabProperties.forEach(prop => {
    let domainList = getDomainList(prop, vocabProperties, context);
    let domainListWithSubClasses = [];
    for (let i = 0; i < domainList.length; i++) {
      domainListWithSubClasses = domainListWithSubClasses.concat(
        getSubClassChain(domainList[i], vocabClasses, context)
      );
    }
    for (const domain of domainListWithSubClasses) {
      if (domain === classId) {
        props.push(prop);
      }
    }
  });
  termObj.allowedProperties = props;
  return props;
}

export function getContextValue(propertyId, key, context) {
  if (context[1].hasOwnProperty(propertyId)) {
    if (context[1][propertyId].hasOwnProperty(key)) {
      return context[1][propertyId][key];
    }
  }
  return null;
}

export function propIsRepeatable(propertyId, context) {
  const contextContainer = getContextValue(propertyId, '@container', context);
  if (contextContainer === '@set' || contextContainer === '@list') {
    return true;
  }
  return false;
}

export function getPropertiesFromArray(typeArray, vocabClasses, vocabProperties, context) {
  let types = typeArray;
  if (!_.isArray(types)) {
    types = [types];
  }
  let props = [];
  const classNames = getBaseClassesFromArray(types, vocabClasses, context);

  for (let i = 0; i < classNames.length; i++) {
    const properties = getProperties(classNames[i], vocabClasses, vocabProperties, context);
    for (let x = 0; x < properties.length; x++) {
      const p = {
        item: properties[x],
      };
      // TODO: Handle shorthand when format is ready
      if (p.item.hasOwnProperty('abstract') && p.item.abstract === true) {
        // Dont add (is abstract)
      } else {
        // Do add
        props.push(p);
      }
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
  const vocabPfx = context[0]['@vocab'];
  const typeChain = getBaseClasses(classId, vocab, context);
  if (typeChain.length > 0) {
    for (const item of embeddedTypes) {
      if (typeChain.indexOf(item) > -1) {
        return true;
      }
    }
  }
  return false;
}

export function isExtractable(classId, vocab, settings, context) {
  if (!classId || typeof classId === 'undefined') {
    throw new Error('isExtractable was called with an undedfined class id');
  }
  if (_.isObject(classId)) {
    throw new Error('isExtractable was called with an object as class id (should be a string)');
  }
  const extractableTypes = settings.extractableTypes;
  const typeChain = getBaseClasses(classId, vocab, context);
  let curieChain = [];
  for (let i = 0; i < typeChain.length; i++) {
    curieChain.push(StringUtil.getCompactUri(typeChain[i], context));
  }
  if (curieChain.length > 0) {
    for (let i = 0; i < extractableTypes.length; i++) {
      if (curieChain.indexOf(extractableTypes[i]) > -1) {
        return true;
      }
    }
  }
  return false;
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

export function getContextWithContainer(propertyId, container, context) {
  const contextList = context[1];

  let contextObj = undefined;
  _.forOwn(contextList, (value, key) => {
    if (typeof value !== 'undefined' && value !== null) {
      if (value.hasOwnProperty('@id') && value['@id'] === propertyId && value.hasOwnProperty('@container') && value['@container'] === container) {
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
    window.lxlWarning('❓ Couldn\'t get baseUri from prefix:', prefix);
  }
  return baseUri;
}

export function getPrefixFromBaseUri(baseUri, context) {
  // Returns prefix that corresponds to the provided baseUri.
  const contextList = context[0];
  let prefix = '';
  _.forOwn(contextList, (value, key) => {
    if (value === baseUri) {
      prefix = key;
    }
  });
  if (prefix === 'kbv' || prefix === '@vocab') {
    prefix = '';
  }
  return prefix;
}

export function getValidTemplates(type, templateCollection, vocabClasses, context) {
  if (typeof templateCollection === 'undefined' || templateCollection === null) {
    return [];
  }
  const validTemplates = [];
  const keys = Object.keys(templateCollection);
  for(let i = 0; i < keys.length; i++) {
    const currentType = templateCollection[keys[i]].value.mainEntity['@type'];
    if (
      type === currentType ||
      getSubClassChain(currentType, vocabClasses, context).indexOf(type) > -1 ||
      getSubClassChain(type, vocabClasses, context).indexOf(currentType) > -1
    ) {
      validTemplates.push(templateCollection[keys[i]]);
    }
  }
  return validTemplates;
}

export function isAbstract(itemId, vocab, context) {
  const vocabKey = StringUtil.convertToVocabKey(StringUtil.convertToBaseUri(itemId, context), context);
  const termObject = getTermObject(vocabKey, vocab, context);
  return (termObject.hasOwnProperty('abstract') && termObject.abstract === true);
}

export function getTree(term, vocab, context, counter = 0, parentChainString = '') {
  const treeNode = {
    id: term,
    sub: [],
    abstract: isAbstract(term, vocab, context),
    depth: counter,
    parentChainString: parentChainString+term,
  };
  const subs = getTermObject(term, vocab, context).baseClassOf;
  _.each(subs, (sub) => {
    treeNode.sub.push(getTree(sub, vocab, context, counter + 1, parentChainString+term));
  });
  return treeNode;
}

export function flattenTree(termArray, vocab, context, language) {
  const sortedArray = _.sortBy(termArray, term => StringUtil.getLabelByLang(term.id, language, vocab, context));
  return sortedArray.reduce((acc, current) => acc.concat([current], flattenTree(current.sub, vocab, context, language)), []);
}

export function printTree(term, vocab, context) {
  function printNode(node, indent, isLast) {
    const branch = isLast ? '└─ ' : '├─ ';
    const nodeStr = indent.length > 0 ? (indent + branch) : 'Class tree: ';
    console.log(nodeStr + StringUtil.convertToPrefix(node.id, context));
    indent += isLast ? '   ' : '│  ';
    for (let i = 0; i < node.sub.length; i ++) {
      printNode(node.sub[i], indent, i === node.sub.length - 1);
    }
  }
  printNode(getTree(term, vocab, context), '', true);
}
