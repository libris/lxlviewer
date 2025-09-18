import {each, get, merge} from 'lodash-es';
import {arrayPathToString} from 'lxljs/string';

export function getChangeList(source, target, templatePath, targetPath = null) {
  const changeList = [];
  addToChangeList(source, target, templatePath, targetPath, changeList);
  return changeList;
}

function addToChangeList(source, target, templatePath, targetPath, changeList) {
  // console.log('templatePath', JSON.stringify(templatePath));
  if (targetPath === null) {
    // targetPath is used when the target path differs from the templatePath
    targetPath = templatePath;
  }
  const templateObject = get(source, templatePath);
  let targetObject = get(target, templatePath);
  if (targetObject === null || typeof targetObject === 'undefined') {
    targetObject = {};
  }
  // console.log('templateObject', JSON.stringify(templateObject));
  // console.log('targetObject', JSON.stringify(targetObject));
  if (typeof templateObject === "object") {
    each(templateObject, (value, key) => {
      // console.log('key', JSON.stringify(key));
      // console.log('value', JSON.stringify(value));
      if (!targetObject.hasOwnProperty(key) ||
        (targetObject[key] === null && templateObject[key] !== null)) {
        const addAtPath = [...templatePath, key]

        // console.log('adding', JSON.stringify(value));
        // console.log('for path', arrayPathToString(addAtPath));

        changeList.push({
          path: arrayPathToString(addAtPath),
          value: value,
        });
      } else {
        if (typeof targetObject === 'object' && typeof templateObject === 'object') {
          addToChangeList(source, target, [...templatePath, key], targetPath, changeList);
        }
      }
    });
  }
}

