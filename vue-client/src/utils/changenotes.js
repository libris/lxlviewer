import { get } from 'lodash-es';
import * as DisplayUtil from 'lxljs/display';
import { CHANGE_CATEGORIES } from './changecategories.js';

const SEP = ' → '; // &rarr;
const DELMARKER = '⌫'; // &#9003;

export default class ChangeNotes {
  constructor() {
    this.categoryPatterns = indexCategories(CHANGE_CATEGORIES);
    // console.log(JSON.stringify(this.categoryPatterns, null, 2));
  }

  findCategoryMatchFor(subject, rulePath) {
    let categoryId = null;

    let object = null;
    let selectedInArray = null;
    let selectedAt = '0';

    while (rulePath) {
      object = get(subject, rulePath);
      const patterns = this.categoryPatterns[rulePath];
      if (patterns != null) {
        object = selectedInArray || (Array.isArray(object) && object.length === 1 ? object[0] : object);
        if (object == null) {
          return null;
        }
        for (const pattern of patterns) {
          if (matches(subject, pattern.subjectMatches) && matches(object, pattern.objectMatches)) {
            categoryId = pattern.categoryId;
            break;
          }
        }
        break;
      }

      selectedInArray = rulePath.endsWith(']') ? object : null;
      if (selectedInArray) {
        selectedAt = rulePath.replace(/.*?\[(\d+)\]+$/, '$1');
      }

      const parentRulePath = rulePath.replace(/\[\d+\]$|.[^.[]+$/, '');
      if (parentRulePath === '') {
        break;
      }
      rulePath = parentRulePath;
    }

    const atIndex = selectedInArray ? `[${selectedAt}]` : '';
    const matchedPath = `${rulePath}${atIndex}`;

    if (categoryId == null) {
      return null;
    }

    return { categoryId, object, matchedPath };
  }

  computeCategoryMatchFor(inspectorData, path) {
    let rulePath = path.replace(/^mainEntity\./, '');
    let subject = inspectorData.mainEntity;
    let match = this.findCategoryMatchFor(subject, rulePath);
    let record = inspectorData.record;

    if (match == null) {
      rulePath = rulePath.replace(/^instanceOf\./, '');
      subject = inspectorData.mainEntity.instanceOf;
      if (subject['@id'] != null) {
        return null;
      }

      if (!subject.hasOwnProperty('meta')) {
        subject.meta = { '@type': 'Record' };
      }
      match = this.findCategoryMatchFor(subject, rulePath);
      if (match == null) {
        return null;
      }

      match.matchedPath = `instanceOf.${match.matchedPath}`;
      record = subject.meta;
    }

    match.matchedPath = `mainEntity.${match.matchedPath}`;
    match.record = record;

    return match;
  }

  trackChange(state, inspectorData, path) {
    const match = this.computeCategoryMatchFor(inspectorData, path);
    if (match == null) {
      return null;
    }
    const { record, categoryId, object, matchedPath } = match;

    const getLabel = o => DisplayUtil.getItemLabel(o, state.resources, inspectorData.quoted, state.settings);

    // IMPROVE: check if added?
    // Won't reach here; use computeCategoryMatchFor again in completeChange to match newValue...?
    const chipLabel = getLabel(object);
    const oldValue = chipLabel; // get(inspectorData, path);

    return {
      completeChange: (changedValue) => {
        let newValue = null;
        const innerChange = path !== matchedPath;
        if (innerChange || !isEmpty(changedValue)) {
          newValue = getLabel(get(inspectorData, matchedPath));
        }
        completeChange(record, categoryId, oldValue, newValue);
      },
    };
  }
}

function completeChange(record, categoryId, oldValue, newValue) {
  if (!record.hasOwnProperty('hasChangeNote')) {
    record.hasChangeNote = [];
  }

  const idx = record.hasChangeNote.findIndex(
    x => (Array.isArray(x.category) ? x.category.find(y => y['@id'] === categoryId) : false),
  );

  const existingChange = idx > -1 ? record.hasChangeNote[idx] : null;

  oldValue = extractOldValue(existingChange) || oldValue;

  /* Remove ChangeNote if value is changed back? Only if changed within the same editing session?
  if (existingChange && oldValue === newValue) {
    record.hasChangeNote.splice(idx, 1);
    if (record.hasChangeNote.length === 0) {
      delete record.hasChangeNote;
    }
    return;
  }
  */

  const changeText = makeDiffValue(oldValue, newValue);

  const changeNote = {
    '@type': 'ChangeNote', // newValue == null ? 'DeleteNote' : 'ChangeNote',
    tool: { '@id': 'https://id.kb.se/generator/cataloguing' },
    atTime: new Date().toISOString(),
    label: [changeText],
    category: [{ '@id': categoryId }],
  };

  if (idx > -1) {
    record.hasChangeNote[idx] = changeNote;
  } else {
    record.hasChangeNote.push(changeNote);
  }
}

function extractOldValue(existingChange) {
  if (existingChange) {
    let existingChangeText = existingChange.label;
    if (Array.isArray(existingChangeText)) {
      existingChangeText = existingChangeText[0];
    }
    if (existingChangeText) {
      const sepIdx = existingChangeText.indexOf(SEP);
      if (sepIdx > -1) {
        return existingChangeText.substring(0, sepIdx);
      }
    }
  }
  return null;
}

function makeDiffValue(oldValue, newValue) {
  return `${oldValue}${SEP}${newValue || DELMARKER}`;
}

function indexCategories(categories) {
  const map = {};
  for (const category of categories) {
    if (!category.appliesToPattern || !category.appliesToPattern.onPredicate) {
      continue;
    }

    const pattern = Object.assign({}, category.appliesToPattern);
    pattern.categoryId = category['@id'];
    const onPredicate = pattern.onPredicate;
    delete pattern.onPredicate;

    const predicates = typeof onPredicate === 'string' ? [onPredicate] : onPredicate.unionOf || onPredicate;

    for (const p of predicates) {
      const patterns = map[p] || [];
      patterns.push(pattern);
      map[p] = patterns;
    }
  }
  return map;
}

function matches(o, pattern) {
  if (pattern == null) {
    return true;
  }
  for (const key in pattern) {
    if (pattern[key] !== o[key]) {
      return false;
    }
  }
  return true;
}

function isEmpty(o) {
  return typeof o === 'string' ? o === '' : (Array.isArray(o) ? o.length : Object.keys(o)) === 0;
}
