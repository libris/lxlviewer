import { each, get, isEqual } from 'lodash-es';
import { arrayPathToString } from 'lxljs/string';

export function getChangeList(source, target, templatePath, targetPath = templatePath) {
  const changeList = [];
  addToChangeList(source, target, templatePath, targetPath, changeList);
  return changeList;
}

function addToChangeList(source, target, templatePath, targetPath, changeList) {
  let templateObject = get(source, templatePath);
  let targetObject = get(target, targetPath);

  if (targetObject === null || typeof targetObject === 'undefined') {
    targetObject = {};
  }

  if (templateObject && typeof templateObject === "object" && !Array.isArray(templateObject)) {
    if (templateObject['@type'] && targetObject['@type'] &&
      templateObject['@type'] !== targetObject['@type']) {
      return;
    }

    each(templateObject, (sourceValue, key) => {
      if (key === '@id') {
        return;
      }
      let targetValue = targetObject[key];

      // TODO! Either something like this, or normalize before?
      // If either target or source is an array, it is a repeatable property
      // => convert it
      //
      // if (Array.isArray(targetValue) && !Array.isArray(sourceValue) ||
      //   Array.isArray(sourceValue) && ! Array.isArray(targetValue)) {
      //   sourceValue = asArray(sourceValue);
      //   targetValue = asArray(targetValue);
      // }
      //
      // We also need to to add the change to array in the changeList
      // but this is getting hairy... Prefer to normalize before?

      // Properties missing in target
      if (!targetObject.hasOwnProperty(key) ||
        (targetValue === null && templateObject[key] !== null)) {
        changeList.push({
          path: arrayPathToString([...targetPath, key]),
          value: sourceValue,
        });
      }
      // Arrays of linked entities
      else if (targetObject.hasOwnProperty(key) && Array.isArray(sourceValue) && sourceValue[0]
        && Object.keys(sourceValue[0]).length === 1 && sourceValue[0]['@id']) {
        let countAdded = 0;
        each (sourceValue, obj => {
          if (!asArray(targetValue).some(el => isEqual(el, obj))) {
            countAdded++;
            changeList.push({
              path: arrayPathToString([...targetPath, key, countAdded + targetValue.length - 1]),
              value: obj,
            });
          }
        })
      }
      // Arrays of typed objects
      else if (targetObject.hasOwnProperty(key) && Array.isArray(sourceValue) && sourceValue[0]) {
        const targetArray = asArray(targetValue);
        let countAdded = 0;
        each (sourceValue, obj => {
          const firstElementWithMatchingType = targetArray.find(el => el['@type'] === obj['@type']);
          if (!firstElementWithMatchingType) {
            countAdded++;
            changeList.push({
              path: arrayPathToString([...templatePath, key, countAdded + targetArray.length - 1]),
              value: obj,
            });
          } else { //There is an element in the list with the same type
            const indexInTarget = targetArray.indexOf(firstElementWithMatchingType);
            const indexInSource = sourceValue.indexOf(obj);
            addToChangeList(source, target, [...templatePath, key, indexInSource],  [...targetPath, key, indexInTarget], changeList);
          }
        })
      } // Recurse if object is present both in source and target
      else {
        if (typeof targetObject === 'object' && typeof templateObject === 'object') {
          addToChangeList(source, target, [...templatePath, key], [...targetPath, key], changeList);
        }
      }
    });
  }
}

function asArray(v) {
  return Array.isArray(v) ? v : [v];
}

