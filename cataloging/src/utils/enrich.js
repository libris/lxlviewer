import { each, get, isEmpty, isEqual } from 'lodash-es';
import { arrayPathToString } from 'lxljs/string';
import * as VocabUtil from "../../../lxljs/vocab.js";

export function getChangeList(source, target, templatePath, targetPath = templatePath, context) {
  const changeList = [];
  addToChangeList(source, target, templatePath, targetPath, changeList, context);
  return changeList;
}

function addToChangeList(source, target, templatePath, targetPath, changeList, context) {
  let templateObject = get(source, templatePath);
  let targetObject = get(target, targetPath);

  if (targetObject === null || typeof targetObject === 'undefined') {
    targetObject = {};
  }

  if (templateObject && typeof templateObject === "object"
    && !Array.isArray(templateObject) && !Array.isArray(targetObject)) {
    if (templateObject['@type'] && targetObject['@type'] &&
      templateObject['@type'] !== targetObject['@type']) {
      return;
    }
    each(templateObject, (sourceValue, key) => {
      if (key === '@id') {
        return;
      }
      let targetValue = targetObject[key];
      let sourceConvertedToArray = false;

      if (VocabUtil.propIsRepeatable(key, context)) {
        if (!Array.isArray(targetValue) && !isEmpty(targetValue) && !isEmpty(sourceValue)) {
          changeList.push({
            path: arrayPathToString([...targetPath, key]),
            value: asArray(targetValue),
          });
        }
        if (!Array.isArray(sourceValue)) {
          sourceConvertedToArray = true;
        }
        sourceValue = asArray(sourceValue);
        targetValue = asArray(targetValue);
      }

      // Properties missing in target
      if (!targetObject.hasOwnProperty(key) ||
        (targetValue === null && templateObject[key] !== null)) {
        changeList.push({
          path: arrayPathToString([...targetPath, key]),
          value: sourceValue,
        });
      }
      // Arrays of linked entities and @type-label pairs
      else if (targetObject.hasOwnProperty(key) && Array.isArray(sourceValue) && sourceValue[0]
        && shouldNotEnrich(sourceValue[0])
        && VocabUtil.propIsRepeatable(key, context)) {
        let countAdded = 0;
        each (sourceValue, obj => {
          if (!asArray(targetValue).some(el => isEqual(el, obj))) {
            countAdded++;
            changeList.push({
              path: arrayPathToString([...targetPath, key, countAdded + asArray(targetValue).length - 1]),
              value: obj,
            });
          }
        })
      }
      // Arrays of typed objects and arrays of strings
      else if (targetObject.hasOwnProperty(key) && VocabUtil.propIsRepeatable(key, context)){
        const targetArray = asArray(targetValue);
        if (!sourceValue[0]) {
          return;
        }
        let countAdded = 0;
        each (sourceValue, obj => {
          const firstElementWithMatchingType = targetArray.find(el => obj['@type'] && el['@type'] === obj['@type']);
          if (!firstElementWithMatchingType) {
            countAdded++;
            changeList.push({
              path: arrayPathToString([...templatePath, key, countAdded + targetArray.length - 1]),
              value: obj,
            });
          } else { //There is an element in the list with the same type
            const indexInTarget = targetArray.indexOf(firstElementWithMatchingType);
            const indexInSource = sourceValue.indexOf(obj);
            let path = sourceConvertedToArray ? [...templatePath, key] : [...templatePath, key, indexInSource];
            addToChangeList(source, target, path,  [...targetPath, key, indexInTarget], changeList, context);
          }
        })
      } // Recurse if object is present both in source and target
      else {
        if (typeof targetObject === 'object' && typeof templateObject === 'object') {
          addToChangeList(source, target, [...templatePath, key], [...targetPath, key], changeList, context);
        }
      }
    });
  }
}

function asArray(v) {
  return Array.isArray(v) ? v : [v];
}

function shouldNotEnrich(o) {
  return isLinkedEntity(o) || isLabelObject(o);
}

function isLinkedEntity(o) {
  return Object.keys(o).length === 1 && o['@id'];
}

function isLabelObject(o) {
  return Object.keys(o).length === 2 && o['@type'] && o.label;
}
