import { cloneDeep, get, initial as parent, last, remove, set, take, range } from 'lodash-es';
import { arrayPathToString as str } from 'lxljs/string';

// build display data: previous version + everything added in current version
export function buildDisplayData(previousVersionData, currentVersionData, addedPaths, removedPaths, getLabel) {
  const added = cloneDeep(addedPaths).sort();
  const removed = cloneDeep(removedPaths).sort();

  const displayData = cloneDeep(previousVersionData);

  const operations = [];

  const [modified, replaceAdded, replaceRemoved] = insertReplaced(displayData, operations, previousVersionData, currentVersionData, added, removed, getLabel);

  insertAdded(displayData, operations, previousVersionData, currentVersionData, added, removed);

  operations.forEach((op) => op(displayData));

  const displayPaths = {
    added: [...added.map((p) => currentToDisplay(p, removed)).map(str), ...replaceAdded.map(str)],
    removed: [...removed.map((p) => previousToDisplay(p, added)).map(str), ...replaceRemoved.map(str)],
    modified: modified.map(str),
  };

  return [displayData, displayPaths];
}

function insertReplaced(displayData, operations, previousVersionData, currentVersionData, added, removed, getLabel) {
  const modified = [];
  const replaceAdded = [];
  const replaceRemoved = [];

  added.slice(0).forEach((path) => {
    const pathStr = str(path);
    const isReplaced = removed.find((p) => str(p) === pathStr);
    if (!isReplaced) {
      return;
    }

    const newVal = get(currentVersionData, pathStr);
    const oldVal = get(previousVersionData, pathStr);
    if (typeof oldVal === 'string' && typeof newVal === 'string') {
      // string replaced
      const displayPath = currentToDisplay(path, removed);
      const v = `${getLabel(oldVal)} → ${getLabel(newVal)}`;
      operations.push((data) => set(data, str(displayPath), v));

      modified.push(displayPath);

      remove(added, (p) => str(p) === pathStr);
      remove(removed, (p) => str(p) === pathStr);
    } else if (!isArrayIndex(path)) {
      // non-array replaced
      // put in array so that we can show old and new values side-by-side
      const displayPath = currentToDisplay(path, removed);
      const n = asArray(newVal);
      const o = asArray(oldVal);
      operations.push((data) => set(data, str(displayPath), [...n, ...o]));

      replaceAdded.push(...range(n.length).map((i) => [...displayPath, i]));
      replaceRemoved.push(...range(o.length).map((i) => [...displayPath, n.length + i]));

      remove(added, (p) => str(p) === pathStr);
      remove(removed, (p) => str(p) === pathStr);
    }
  });

  return [modified, replaceAdded, replaceRemoved];
}

function insertAdded(displayData, operations, previousVersionData, currentVersionData, added, removed) {
  added.forEach((path) => {
    const newVal = get(currentVersionData, str(path));
    const displayPath = currentToDisplay(path, removed);
    if (isArrayIndex(path)) {
      // insert added value in array
      const ix = last(displayPath);
      get(displayData, str(parent(displayPath))).splice(ix, 0, newVal);
    } else {
      // new path, just add it
      operations.push((data) => set(data, str(displayPath), newVal));
    }
  });
}

function previousToDisplay(path, added) {
  return pathWithDisplayIndices(path, added, (addedIx, ix) => addedIx <= ix);
}

function currentToDisplay(path, removed) {
  return pathWithDisplayIndices(path, removed, (removedIx, ix) => removedIx < ix);
}

function pathWithDisplayIndices(path, comparePaths, cmp) {
  const result = [];
  for (let i = 0; i < path.length; i++) {
    const subPath = take(path, i + 1);
    if (isArrayIndex(subPath)) {
      const parentStr = str(parent(subPath));
      const ix = last(subPath);
      const pathsBefore = comparePaths.filter((p) => subPath.length === p.length
        && isArrayIndex(p)
        && str(parent(p)) === parentStr
        && cmp(last(p), ix));
      result.push(ix + pathsBefore.length);
    } else {
      result.push(last(subPath));
    }
  }
  return result;
}

function isArrayIndex(path) {
  return typeof last(path) === 'number';
}

function asArray(v) {
  return Array.isArray(v) ? v : [v];
}
