import { isObject, uniq, isArray, find, sortBy, each, isPlainObject, cloneDeep, uniqBy, forOwn } from 'lodash-es';
import * as StringUtil from './string';
import { lxlWarning } from './debug';

export const XSD_NUMERIC_TYPES = Object.freeze({
  'xsd:byte': { min: -128, max: 127 },
  'xsd:decimal': { decimal: true },
  'xsd:int': { min: -2147483649, max: 2147483648 },
  'xsd:integer': {},
  'xsd:long': { min: -9223372036854775809, max: 9223372036854775808 },
  'xsd:negativeInteger': { max: -1 },
  'xsd:nonNegativeInteger': { min: 0 },
  'xsd:nonPositiveInteger': { max: 0 },
  'xsd:positiveInteger': { min: 1 },
  'xsd:short': { min: -32768, max: 32767 },
  'xsd:unsignedLong': { min: 0, max: 18446744073709551616 },
  'xsd:unsignedInt': { min: 0, max: 4294967296 },
  'xsd:unsignedShort': { min: 0, max: 65536 },
  'xsd:unsignedByte': { min: 0, max: 255 },
});

export function getTermObject(term, vocab, context) {
  // Returns a class object
  if (!term || typeof term === 'undefined') {
    throw new Error('getTermObject was called with an undefined Id.');
  }
  if (isObject(term)) {
    throw new Error(
      'getTermObject was called with an object (should be a string).',
      JSON.stringify(term),
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

  if (!_class) {
    // Try to find a mapping in context
    const contextMapping = getContextValue(cn, '@id', context);
    if (contextMapping) {
      // If mapping found try to get it
      _class = vocab.get(contextMapping);
      tries.push(contextMapping);
      if (!_class) {
        // Try to convert prefix to base uri and try to get it
        const asUri = StringUtil.convertToBaseUri(contextMapping, context);
        _class = vocab.get(asUri);
        tries.push(asUri);
      }
    }
  }
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
  if (!_class && getContextValue(term, '@container', context) === '@language') {
    cn = getContextValue(term, '@id', context);
    _class = vocab.get(cn);
    tries.push(cn);
  }

  if (!_class) {
    lxlWarning('📘 Term lookup failed:', term, '| Tried :', tries.join(', '));
  }
  return _class;
}

export function filterOwnClasses(classArray, context) {
  if (!isArray(classArray)) {
    throw new Error('filterOwnClasses was called with a param which is not an array (should be an array of term objects).');
  }
  return classArray.filter(term => (term.hasOwnProperty('@id') && (term['@id'].startsWith(context[0]['@vocab']) || term['@id'].startsWith(context[0].marc))));
}

export function getBaseClasses(classId, vocab, context) {
  // Traverses up subClassOf properties and returns a list of all classes found

  if (!classId || typeof classId === 'undefined') {
    throw new Error('getBaseClasses was called with an undefined Id.');
  }
  let classList = [];
  const termObj = getTermObject(classId, vocab, context);
  if (typeof termObj === 'undefined') {
    return uniq(classList);
  }
  classList.push(StringUtil.getCompactUri(termObj['@id'], context));
  if (termObj.baseClassChain) { // Alredy calculated
    classList = classList.concat(termObj.baseClassChain);
    return uniq(classList);
  }
  if (termObj && termObj.hasOwnProperty('subClassOf')) {
    termObj.subClassOf.forEach((obj) => {
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
  termObj.baseClassChain = uniq(classList);
  // console.log("getBaseClasses(" + JSON.stringify(classId) + ")", JSON.stringify(classList));
  return uniq(classList);
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
  classes = uniq(classes);
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
  if (isArray(classId)) {
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
  if (typeof mainEntityType === 'undefined') {
    // This state can sometimes be reached with linked items that haven't been embellished yet.
    // Mostly added as to not throw an error while the data is being picked up.
    return null;
  }
  if (isSubClassOf(mainEntityType, 'SingleItem', vocab, context)) {
    return 'SingleItem';
  }
  if (isSubClassOf(mainEntityType, 'Item', vocab, context)) {
    return 'Item';
  }
  if (isSubClassOf(mainEntityType, 'Instance', vocab, context)) {
    return 'Instance';
  }
  if (isSubClassOf(mainEntityType, 'Work', vocab, context)) {
    return 'Work';
  }
  if (isSubClassOf(mainEntityType, 'Agent', vocab, context)) {
    return 'Agent';
  }
  if (isSubClassOf(mainEntityType, 'Concept', vocab, context)) {
    return 'Concept';
  }
  if (isSubClassOf(mainEntityType, 'AdministrativeNotice', vocab, context)) {
    return 'AdministrativeNotice';
  }
  return mainEntityType;
}

function isFiltered(termObj, settings, resources) {
  // Return true if term has any of the filteredCategories, else false
  const filteredCategories = settings.filteredCategories;
  for (let i = 0; i < filteredCategories.length; i++) {
    if (hasCategory(termObj, filteredCategories[i], resources)) {
      return true;
    }
  }
  return false;
}

export function hasCategory(term, category, resources) {
  let termObj = term;
  if (typeof termObj === 'string') {
    termObj = getTermObject(termObj, resources.vocab, resources.context);
  }
  if (!termObj) return false;
  let target = category;
  const baseUri = getBaseUriFromPrefix('@vocab', resources.context);
  if (category.includes(baseUri)) {
    target = category.replace(baseUri, '');
  }
  if (termObj.hasOwnProperty('category') && [].concat(termObj.category).some(c => c['@id'] === `${baseUri}${target}`)) {
    return true;
  }
  return false;
}

export function getTermByType(type, vocab, context, settings) {
  if (!settings._getTermByType_cache) {
    settings._getTermByType_cache = {}
  }
  if (settings._getTermByType_cache[type]) {
    return settings._getTermByType_cache[type];
  }

  const list = Array.from(vocab.values());

  if (!list || typeof list === 'undefined') {
    throw new Error('getTermByType was called without a vocabulary.');
  }
  if (isArray(list) === false) {
    throw new Error('getTermByType - parameter "list" is of wrong type (not an array)');
  }
  const expandedType = StringUtil.convertToBaseUri(type, context);
  const terms = [];
  list.forEach((term) => {
    if (!isFiltered(term, settings, { vocab, context })) { // Only add if term should not be filtered
      if (isArray(term['@type'])) {
        if (term['@type'].indexOf(type) > -1 || term['@type'].indexOf(expandedType) > -1) {
          terms.push(term);
        }
      } else if (term['@type'] === type || term['@type'] === expandedType) {
        terms.push(term);
      }
    }
  });
  settings._getTermByType_cache[type] = terms;
  return terms;
}

export function getTermFromLabel(label, language, vocab) {
  const classObject = find(vocab, (obj) => {
    let existingLang = language;
    if (typeof obj.labelByLang === 'undefined') {
      return false;
    }
    if (typeof obj.labelByLang[language] === 'undefined') {
      existingLang = 'en';
    }
    if (isArray(obj.labelByLang[existingLang])) {
      for (const lbl of obj.labelByLang[existingLang]) {
        if (lbl.toLowerCase() === label.toLowerCase()) {
          return true;
        }
      }
    }
    return obj.labelByLang[existingLang].toLowerCase() === label.toLowerCase();
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
  vocab.forEach((term) => {
    if (term.hasOwnProperty('subClassOf')) {
      each(term.subClassOf, (superClassObj) => {
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

export function getRestrictions(restrictionProperty, entityType, property, vocab, context) {
  if (typeof entityType === 'undefined') {
    throw new Error('getRestrictions was called without an entityType');
  }
  if (isPlainObject(property)) {
    throw new Error('getRestrictions was called with an object as property id (should be a string)');
  }
  let result = [];
  const baseClasses = getBaseClasses(entityType, vocab, context);
  baseClasses.forEach((baseClass) => {
    const vocabEntry = getTermObject(baseClass, vocab, context);
    if (vocabEntry.hasOwnProperty('subClassOf')) {
      vocabEntry.subClassOf.forEach((subClassObject) => {
        let embellishedObj = cloneDeep(subClassObject);
        if (
          Object.keys(embellishedObj).length === 1
          && embellishedObj.hasOwnProperty('@id')
          && embellishedObj['@id'].indexOf('_:') > -1
        ) {
          embellishedObj = getTermObject(embellishedObj['@id'], vocab, context);
        }
        if (
          embellishedObj.hasOwnProperty('@type')
          && embellishedObj['@type'] === 'Restriction'
          && StringUtil.getCompactUri(embellishedObj.onProperty['@id'], context) === StringUtil.getCompactUri(property, context)
        ) {
          if (embellishedObj.hasOwnProperty(restrictionProperty)) {
            if (isArray(embellishedObj[restrictionProperty])) {
              each(embellishedObj[restrictionProperty], (list) => {
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

export function getRange(propertyId, vocab, context) {
  const termObj = getTermObject(propertyId, vocab, context);
  if (termObj == null) {
    lxlWarning(`getRange failed to find range for '${propertyId}'. Returning empty range.`);
    return [];
  }
  const range = [];
  if (termObj.hasOwnProperty('range')) {
    for (let i = 0; i < termObj.range.length; i++) {
      range.push(termObj.range[i]['@id']);
    }
  }
  if (termObj.hasOwnProperty('rangeIncludes')) {
    for (let i = 0; i < termObj.rangeIncludes.length; i++) {
      range.push(termObj.rangeIncludes[i]['@id']);
    }
  } 
  return uniq(range);
}

export function getSubClasses(classname, vocabClasses, context) {
  const classObj = getTermObject(classname, vocabClasses, context);
  let subClasses = [];
  if (typeof classObj !== 'undefined' && classObj.hasOwnProperty('baseClassOf')) {
    subClasses = classObj.baseClassOf;
  }
  return subClasses;
}

export function getAllSubClasses(classArray, vocabClasses, context) {
  let inputSubClasses = [].concat(classArray);
  let newSubClasses = [];
  if (inputSubClasses.length > 0) {
    each(inputSubClasses, (classId) => {
      const className = StringUtil.getCompactUri(classId, context);
      const subClasses = getSubClasses(className, vocabClasses, context);
      if (subClasses.length > 0) {
        newSubClasses = newSubClasses.concat(getAllSubClasses(subClasses, vocabClasses, context));
      }
    });
  }
  inputSubClasses = inputSubClasses.concat(newSubClasses);
  inputSubClasses = uniq(inputSubClasses);
  return inputSubClasses;
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
  const curieChain = subClassChain.map(subClass => StringUtil.getCompactUri(subClass, context));
  classObj.subClassChain = curieChain;
  return subClassChain;
}

export function getRangeFull(key, vocab, context, vocabClasses) {
  const types = [].concat(getRange(key, vocab, context));
  let allTypes = [];
  each(types, (type) => {
    allTypes = allTypes.concat(getSubClassChain(type, vocabClasses, context));
  });
  allTypes = uniq(allTypes);
  return allTypes;
}

export function getReversesByType(type, termObj, vocab) {
  if (termObj.hasOwnProperty('@reverse') && termObj['@reverse'].hasOwnProperty(type)) {
    return termObj['@reverse'][type];
  }

  // Find vocab items which has the type argument as a property wherein the current termObj is referenced
  return Object.values(vocab)[0]
    .filter(vocabItem => vocabItem.hasOwnProperty(type) && vocabItem[type].find(
      typeItem => typeItem['@id'] === termObj['@id'],
    ));
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
  return domainList.map(item => StringUtil.getCompactUri(item, context));
}

export function getProperties(classId, vocabClasses, vocabProperties, context) {
  // Get all properties which has the domain of the className
  const props = [];
  // console.log("Getting props for", className);
  const termObj = getTermObject(classId, vocabClasses, context);
  if (termObj == null) {
    lxlWarning(`getProperties couldn't find any properties for class "${classId}"`);
    return [];
  }
  if (termObj.allowedProperties) {
    return termObj.allowedProperties;
  }
  vocabProperties.forEach((prop) => {
    const domainList = getDomainList(prop, vocabProperties, context);
    let domainListWithSubClasses = [];
    for (let i = 0; i < domainList.length; i++) {
      domainListWithSubClasses = domainListWithSubClasses.concat(
        getSubClassChain(domainList[i], vocabClasses, context),
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
    if (context[1][propertyId] !== null && context[1][propertyId].hasOwnProperty(key)) {
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
  if (!isArray(types)) {
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
  props = uniqBy(props, 'item.@id');
  return props;
}

export function getAllVocabProperties(vocabProperties) {
  return [...vocabProperties].map( (prop) => {
    return {'item' : prop[1] };
  });
}

export function isEmbedded(classId, vocab, settings, context) {
  if (!classId || typeof classId === 'undefined') {
    throw new Error('isEmbedded was called with an undefined class id');
  }
  if (isObject(classId)) {
    throw new Error('isEmbedded was called with an object as class id (should be a string)');
  }
  if (isDistinct(classId, vocab, settings, context)) {
    return false;
  }
  const embeddedTypes = settings.embeddedTypes;
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

export function isDistinct(classId, vocab, settings, context) {
  if (!classId || typeof classId === 'undefined') {
    throw new Error('isDistinct was called with an undefined class id');
  }
  if (isObject(classId)) {
    throw new Error('isDistinct was called with an object as class id (should be a string)');
  }
  const typeChain = getBaseClasses(classId, vocab, context);
  if (typeChain.length > 0) {
    for (const termObj of typeChain.map(t => getTermObject(t, vocab, context))) {
      if (termObj.category && [].concat(termObj.category).some(c => c['@id'] === 'https://id.kb.se/vocab/distinct')) {
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
  if (isObject(classId)) {
    throw new Error('isExtractable was called with an object as class id (should be a string)');
  }
  const extractableTypes = settings.extractableTypes;
  const typeChain = getBaseClasses(classId, vocab, context);
  const curieChain = [];
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

export function getMappedPropertyByContainer(property, container, context) {
  const computed = context[2];
  const containerMap = computed.containerMap;
  if (containerMap[container]) {
    return containerMap[container][property];
  }
  return null;
}

export function getBaseUriFromPrefix(prefix, context) {
  // Returns a baseUri as a string that corresponds to the provided prefix.
  const contextList = context[0];
  let baseUri = '';
  if (contextList.hasOwnProperty(prefix) && !isPlainObject(contextList[prefix])) {
    baseUri = contextList[prefix];
  }
  if (baseUri === '') {
    lxlWarning('❓ Couldn\'t get baseUri from prefix:', prefix);
  }
  return baseUri;
}

export function getContainedBaseUri(uri, context) {
  // If uri contains a baseUri defined in the context, return that baseUri
  const contextList = context[0];
  let baseUri = '';
  forOwn(contextList, (value) => {
    if (uri.includes(value)) {
      baseUri = value;
    }
  });
  return baseUri;
}

export function getContainedPrefix(uri, context) {
  // If uri contains a prefix defined in the context, return that prefix
  const baseUri = getContainedBaseUri(uri, context);
  return getPrefixFromBaseUri(baseUri, context);
}

export function getPrefixFromBaseUri(baseUri, context) {
  // Returns prefix that corresponds to the provided baseUri.
  const contextList = context[0];
  let prefix = '';
  forOwn(contextList, (value, key) => {
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
  for (let i = 0; i < keys.length; i++) {
    const currentType = templateCollection[keys[i]].value.mainEntity['@type'];
    const matching = (
      isSubClassOf(currentType, type, vocabClasses, context)
      || isSubClassOf(type, currentType, vocabClasses, context)
    );
    if (matching) {
      validTemplates.push(templateCollection[keys[i]]);
    }
  }
  return validTemplates;
}

export function isAbstract(termObject) {
  if (typeof termObject === 'undefined') {
    return false;
  }
  return (termObject.hasOwnProperty('abstract') && termObject.abstract === true);
}

export function getTree(term, vocab, context, counter = 0, parentChainString = '') {
  const termObj = getTermObject(term, vocab, context);
  if (typeof termObj === 'undefined') {
    return {};
  }
  const treeNode = {
    id: term,
    labels: termObj.labelByLang || termObj.prefLabelByLang,
    sub: [],
    abstract: isAbstract(termObj, vocab, context),
    depth: counter,
    parentChainString: parentChainString + term,
  };
  if (typeof termObj !== 'undefined') {
    const subs = termObj.baseClassOf;
    each(subs, (sub) => {
      treeNode.sub.push(getTree(sub, vocab, context, counter + 1, parentChainString + term));
    });
  }
  return treeNode;
}

export function flattenTree(termArray, vocab, context, language) {
  const flat = termArray.reduce((acc, current) => {
    const sortedSub = sortBy(current.sub, o => o.labels && o.labels[language]);
    return acc.concat(
      [current],
      flattenTree(sortedSub, vocab, context, language),
    );
  }, []);
  return flat;
}

export function printTree(term, vocab, context) {
  function printNode(node, indent, isLast) {
    let currentIndent = indent;
    const branch = isLast ? '└─ ' : '├─ ';
    const nodeStr = indent.length > 0 ? (indent + branch) : 'Class tree: ';
    console.log(nodeStr + StringUtil.convertToPrefix(node.id, context));
    currentIndent += isLast ? '   ' : '│  ';
    for (let i = 0; i < node.sub.length; i++) {
      printNode(node.sub[i], currentIndent, i === node.sub.length - 1);
    }
  }
  printNode(getTree(term, vocab, context), '', true);
}

export function preprocessContext(context) {
  // Internal structure by index: 0 = prefixes, 1 = terms, 2 = computed
  const prefixes = {};
  const terms = {};

  const ctx = context['@context'];
  const ctxArray = isArray(ctx) ? ctx : [ctx];
  for (const oneCtx of ctxArray) {
    if (!isPlainObject(oneCtx)) {
      continue;
    }
    forOwn(oneCtx, (value, key) => {
      if (isPrefix(value)) {
        prefixes[key] = value;
      } else {
        terms[key] = value;
      }
    });
  }

  const computed = { containerMap: computeContainerMap(terms) };
  context['@context'] = [prefixes, terms, computed];

  return context;
}

function isPrefix(value) {
  if (isPlainObject(value) && value['@prefix'] === true) {
    return true;
  }
  const id = isPlainObject(value) ? value['@id'] : value;
  return typeof id === 'string' && id.match(/[/#:]$/) !== null;
}

export function computeContainerMap(contextList) {
  function forContextList(closure) {
    forOwn(contextList, (value, key) => {
      if (typeof value !== 'undefined' && value !== null && value['@id']) {
        closure(key, value['@id'], value);
      }
    });
  }

  const containerMap = {};
  const containers = ['@language'];
  each(containers, (container) => {
    const idToProperty = {};
    forContextList((property, id, value) => {
      if (value['@container'] && value['@container'] === container) {
        idToProperty[id] = property;
      }
    });

    const propertyToProperty = {};
    forContextList((property, id) => {
      if (idToProperty[id]) {
        propertyToProperty[property] = idToProperty[id];
      }
    });
    containerMap[container] = Object.assign(propertyToProperty, idToProperty);
  });

  return containerMap;
}

export function preprocessVocab(vocab) {
  const vocabMap = new Map(vocab['@graph'].map(entry => [entry['@id'], entry]));
  vocabMap.forEach((termObj) => {
    if (termObj && termObj.hasOwnProperty('@id')) {
      let bases = null;
      let subRel = 'baseClassOf';
      for (const baserel of ['subClassOf', 'subPropertyOf']) {
        if (termObj.hasOwnProperty(baserel)) {
          bases = termObj[baserel];
          if (baserel === 'subPropertyOf') {
            subRel = 'basePropertyOf';
          }
          break;
        }
      }
      if (!Array.isArray(bases)) {
        return;
      }
      bases.forEach((obj) => {
        if (obj['@id']) {
          const baseClass = vocabMap.get(obj['@id']);
          if (baseClass) {
            if (!Array.isArray(baseClass[subRel])) {
              baseClass[subRel] = [];
            }
            baseClass[subRel].push(termObj);
          }
        }
      });

      if (termObj['@type'] === 'Class') {
        ['domain', 'domainIncludes', 'range', 'rangeIncludes'].forEach((propertyLinkType) => {
          const reverseProperties = getReversesByType(propertyLinkType, termObj, vocab);

          if (reverseProperties.length) {
            termObj['@reverse'] = {
              ...termObj['@reverse'],
              [propertyLinkType]: reverseProperties,
            };
          }
        });
      }
    }
  });

  return vocabMap;
}
