import { each, get, isEmpty, isEqual } from 'lodash-es';
import { arrayPathToString } from 'lxljs/string';
import * as VocabUtil from "../../../lxljs/vocab.js";

export function getChangeList(source, target, templatePath, targetPath = templatePath, context, skipIfExistsInTarget = []) {
  const changeList = [];
  addToChangeList(source, target, templatePath, targetPath, changeList, context, skipIfExistsInTarget);
  return changeList;
}

function addToChangeList(source, target, sourcePath, targetPath, changeList, context, skipIfExistsInTarget) {
  let sourceObject = get(source, sourcePath);
  let targetObject = get(target, targetPath);

  if (targetObject === null || typeof targetObject === 'undefined') {
    targetObject = {};
  }

  if (sourceObject && typeof sourceObject === "object"
    && !Array.isArray(sourceObject) && !Array.isArray(targetObject)) {

    each(sourceObject, (sourceValue, key) => {
      let targetValue = targetObject[key];
      let sourceConvertedToArray = false;

      if (key === '@id') {
        return;
      }

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
        (targetValue === null && sourceObject[key] !== null)) {
        changeList.push({
          path: arrayPathToString([...targetPath, key]),
          value: sourceValue,
        });
      }
      // Arrays of linked entities and other entities that should be treated as atomic
      else if (targetObject.hasOwnProperty(key) && Array.isArray(sourceValue) && sourceValue[0]
        && shouldNotEnrich(sourceValue[0])
        && VocabUtil.propIsRepeatable(key, context)) {
        if (skip(key, skipIfExistsInTarget) && !isEmpty(targetValue)) {
          return;
        }

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
              path: arrayPathToString([...sourcePath, key, countAdded + targetArray.length - 1]),
              value: obj,
            });
          } else { //There is an element in the list with the same type
            const indexInTarget = targetArray.indexOf(firstElementWithMatchingType);
            const indexInSource = sourceValue.indexOf(obj);
            let path = sourceConvertedToArray ? [...sourcePath, key] : [...sourcePath, key, indexInSource];
            addToChangeList(source, target, path,  [...targetPath, key, indexInTarget], changeList, context, skipIfExistsInTarget);
          }
        })
      } // Recurse if object is present both in source and target
      else {
        if (typeof targetObject === 'object' && typeof sourceObject === 'object') {
          addToChangeList(source, target, [...sourcePath, key], [...targetPath, key], changeList, context, skipIfExistsInTarget);
        }
      }
    });
  }
}

function asArray(v) {
  return Array.isArray(v) ? v : [v];
}

function shouldNotEnrich(o) {
  return isLinkedEntity(o) || hasNoEmptyValues(o);
}

function isLinkedEntity(o) {
  return Object.keys(o).length === 1 && o['@id'];
}

// Use a parameter for enrich from file vs enrich from template instead?
function hasNoEmptyValues(o) {
  return !Object.values(o).some(v => isEmpty(v));
}

function skip(key, skipIfPresentInTarget) {
  return skipIfPresentInTarget.includes(key);
}
