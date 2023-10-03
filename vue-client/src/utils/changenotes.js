import { get } from 'lodash-es';
import * as DisplayUtil from 'lxljs/display';
import { CHANGE_CATEGORIES } from './changecategories.js';

const SEP = ' → '; // &rarr;
const DELMARKER = '⌫'; // &#9003;

export default class ChangeNotes {
  constructor() {
    this.categoryPatterns = indexCategories(CHANGE_CATEGORIES);
  }

  findCategoryMatchFor(state, subject, rulePath) {
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

    return { categoryId, matchedPath };
  }

  computeCategoryMatchFor(state, inspectorData, path) {
    let rulePath = path.replace(/^mainEntity\./, '');
    let subject = inspectorData.mainEntity;
    let match = this.findCategoryMatchFor(state, subject, rulePath);
    let record = inspectorData.record;

    // FIXME: This block, which is about adding changenotes to local work meta,
    // needs to be integrated with the new work extraction mechanism!
    const useLocalWorkMeta = false;
    if (useLocalWorkMeta && match == null) {
      rulePath = rulePath.replace(/^instanceOf\./, '');
      subject = inspectorData.mainEntity.instanceOf;
      if (subject == null || typeof subject !== 'object' || subject['@id'] != null) {
        return null;
      }

      if (!subject.hasOwnProperty('meta')) {
        subject.meta = { '@type': 'Record' };
      }
      match = this.findCategoryMatchFor(state, subject, rulePath);
      if (match == null) {
        return null;
      }

      match.matchedPath = `instanceOf.${match.matchedPath}`;
      record = subject.meta;
    }

    match.matchedPath = `mainEntity.${match.matchedPath}`;
    match.record = record;
    match.path = path;

    return match;
  }

  static completeChange(state, match) {
    const { record, categoryId, matchedPath, path } = match;
    const inspectorData = state.inspector.data;

    let newValue = null;
    const changedValue = get(inspectorData, path);
    const innerChange = path !== matchedPath;
    let oldValue = null;
    if (innerChange || !isEmpty(changedValue || '')) {
      oldValue = DisplayUtil.getItemLabel(get(state.inspector.originalData, matchedPath) || '', state.resources, inspectorData.quoted, state.settings);
      newValue = DisplayUtil.getItemLabel(get(inspectorData, matchedPath) || '', state.resources, inspectorData.quoted, state.settings);
    }
    completeChange(record, categoryId, oldValue, newValue);
    return true;
  }
}

function completeChange(record, categoryId, oldValue, newValue) {
  if (!record.hasOwnProperty('hasChangeNote')) {
    record.hasChangeNote = [];
  }

  const idx = record.hasChangeNote.findIndex(
    x => (Array.isArray(x.category) ? x.category.find(y => y['@id'] === categoryId) : false),
  );

  // TODO: compare on full value instead of labels
  if (oldValue === newValue) {
    return;
  }

  const changeText = makeDiffValue(oldValue, newValue);

  const changeNote = {
    '@type': 'ChangeNote', // newValue == null ? 'DeleteNote' : 'ChangeNote',
    tool: { '@id': 'https://id.kb.se/generator/cataloguing' },
    atTime: new Date().toISOString(),
    label: [changeText],
    category: [{ '@id': categoryId }],
  };
  console.log('changeNote', JSON.stringify(changeNote));
  if (idx > -1) {
    record.hasChangeNote[idx] = changeNote;
  } else {
    record.hasChangeNote.push(changeNote);
  }
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
