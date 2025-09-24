import {each, get, isEqual} from 'lodash-es';
import {arrayPathToString} from 'lxljs/string';

export function getChangeList(source, target, templatePath, targetPath = null) {
  const changeList = [];
  addToChangeList(source, target, templatePath, targetPath, changeList);
  return changeList;
}

function addToChangeList(source, target, templatePath, targetPath, changeList) {
  if (targetPath === null) {
    // targetPath is used when the target path differs from the templatePath
    targetPath = templatePath;
  }
  const templateObject = get(source, templatePath);
  let targetObject = get(target, targetPath);
  if (targetObject === null || typeof targetObject === 'undefined') {
    targetObject = {};
  }
  if (templateObject && typeof templateObject === "object" && !Array.isArray(templateObject)) {
    if (templateObject['@type'] && targetObject['@type'] &&
      templateObject['@type'] !== targetObject['@type']) {
      return;
    }

    each(templateObject, (value, key) => {
      if (!targetObject.hasOwnProperty(key) ||
        (targetObject[key] === null && templateObject[key] !== null)) {
        changeList.push({
          path: arrayPathToString([...targetPath, key]),
          value: value,
        });
      }
      // Add missing elements from template to arrays of linked entities
      else if (targetObject.hasOwnProperty(key) && Array.isArray(value) && value[0]
        && Object.keys(value[0]).length === 1 && value[0]['@id']) {
        let countAdded = 0;
        each (value, obj => {
          if (!asArray(targetObject[key]).some(el => isEqual(el, obj))) {
            countAdded++;
            changeList.push({
              path: arrayPathToString([...targetPath, key, countAdded + targetObject[key].length - 1]),
              value: obj,
            });
          }
        })
      }

      else if (targetObject.hasOwnProperty(key) && Array.isArray(value) && value[0]) {
        const targetArray = asArray(targetObject[key]);
        each (value, obj => {
          let countAdded = 0;
          const firstElementWithMatchingType = targetArray.find(el => el['@type'] === obj['@type']);
          if (!firstElementWithMatchingType) {
            countAdded++;
            changeList.push({
              path: arrayPathToString([...templatePath, key, countAdded + targetArray.length - 1]),
              value: obj,
            });
          } else { //There is an element in the list with the same type
            const indexInTarget = targetArray.indexOf(firstElementWithMatchingType);
            //TODO loop with index instead, to optimize?
            const indexInTemplate = value.indexOf(obj);
            const newTargetPath  = [...targetPath, key, indexInTarget];
            addToChangeList(source, target, [...templatePath, key, indexInTemplate], newTargetPath, changeList);
          }
        })
      }
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

