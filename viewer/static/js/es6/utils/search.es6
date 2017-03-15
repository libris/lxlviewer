import PropertyMappings from '../propertymappings.json';
import * as _ from 'lodash';

export function getParameters() {
  const params = [];
  $('input[type=hidden]').each(function() {
    params.push({ key: $(this).attr('name'), value: $(this).val() });
    $(this).remove();
  });
  return params;
}

export function getParameter(name) {
  const parameters = getParameters();
  for (let i = 0; i < parameters.length; i++) {
    if (name === parameters[i].key) {
      return parameters[i];
    }
  }
  return false;
}

export function initTypeButtons() {
  const type = getParameter('type');
  const inputs = $('.type-buttons input');
  if (typeof type !== 'undefined' && inputs.length > 0) {
    inputs.each(function() {
      if ($(this).val() == type.value) {
        $(this).closest('label').addClass('active');
        $(this).attr('checked', true);
      }
    });
  } else {
    $('.type-buttons .no-choice input').attr('checked', true);
  }
}


export function getConvertedSearchObject(object) {
  const convertedObject = {};
  _.each(object, (v, k) => {
    const tagMatchObject = _.find(PropertyMappings, (value, mappingKey) => {
      return mappingKey.toLowerCase() === k.toLowerCase();
    });
    if (typeof tagMatchObject !== 'undefined') {
      const resultKey = tagMatchObject.propertyChain.join('.');
      convertedObject[resultKey] = v;
      // Hardcoded for isbn
      if (k.toLowerCase() === 'isbn') {
        convertedObject['identifiedBy.@type'] = 'ISBN';
      }
    } else {
      convertedObject[k] = v;
    }
  });
  return convertedObject;
}

export function removeEmptyFields() {
  // Empty inputs
  $('#searchForm').find('input').filter(function() {
    return !$.trim(this.value).length;
  }).prop('disabled', true);
}

export function doSearch() {
  const validTags = ['isbn'];
  const queryText = [];
  const tagObject = {};
  const searchField = document.querySelector('#searchQsmart');
  for (const node of searchField.childNodes) {
    if (node.className.split(' ').indexOf('searchtag') > -1) {
      const tag = node.innerHTML.split(':');
      if (validTags.indexOf(tag[0].toLowerCase()) > -1) {
        tagObject[tag[0]] = tag[1];
      } else {
        queryText.push(tag[1]);
      }
    } else if (node.innerHTML !== '') {
      queryText.push(`${node.innerHTML}`);
    }
  }
  tagObject.q = queryText.join(' ');
  const tagInputs = document.querySelectorAll('.tagInput');
  _.each(getConvertedSearchObject(tagObject), (v, k) => {
    tagInputs.forEach(inputTag => {
      if (inputTag.name === k) {
        inputTag.value = v;
      }
    });
  });
  removeEmptyFields();
  document.querySelector('#searchForm').submit();
}


export function searchPhraseFocus(event, state) {
  state.counter = event.target.id.split('-')[1];
}

export function updateStyle(event, state) {
  const validTags = ['isbn'];
  const currentPhrase = document.activeElement;
  const tagEditing = currentPhrase.innerHTML.includes(':');

  if (tagEditing) {
    if (validTags.indexOf(currentPhrase.innerHTML.split(':')[0].toLowerCase()) > -1) {
      currentPhrase.setAttribute('class', 'searchtag valid');
    } else {
      currentPhrase.setAttribute('class', 'searchtag invalid');
    }
  } else {
    currentPhrase.setAttribute('class', 'searchphrase');
  }
}

export function addSearchPhrase(state, searchField) {
  const newSearchTag = document.createElement('div');
  newSearchTag.setAttribute('id', `searchphrase-${parseInt(state.counter, 10) + 1}`);
  newSearchTag.setAttribute('class', 'searchphrase');
  newSearchTag.setAttribute('contenteditable', 'true');
  if (state.counter === -1 && document.getElementById('serviceTitle').innerText === 'libris.kb.se') {
    newSearchTag.setAttribute('placeholder', '"Mumintrollen", "ISBN:123456789"');
  }
  newSearchTag.addEventListener('input', event => updateStyle(event, state));
  newSearchTag.addEventListener('focus', event => searchPhraseFocus(event, state));
  searchField.appendChild(newSearchTag);
  newSearchTag.focus();
}

export function searchFieldBehaviour(e, state, searchField) {
  const currentPhrase = document.activeElement;
  const tagEditing = currentPhrase.className.includes('searchtag');

  if (e.keyCode === 13) { // Enter
    e.preventDefault();
    const nextPhrase = document.querySelector(`#searchphrase-${parseInt(state.counter, 10) + 1}`);
    if (!tagEditing) {
      doSearch();
    } else if (nextPhrase === null) {
      addSearchPhrase(state, searchField);
    } else {
      nextPhrase.focus();
    }
  } else if (e.keyCode === 8 && // Backspace
      !tagEditing &&
      currentPhrase.innerHTML === '' &&
      currentPhrase.id.toString() !== 'searchphrase-0'
    ) {
    e.preventDefault();
    const previousPhrase = searchField.children[(state.counter - 1)];
    previousPhrase.innerHTML = '';
    previousPhrase.setAttribute('class', 'searchphrase');


    const oldPhrase = searchField.children[state.counter];
    searchField.removeChild(oldPhrase);
    previousPhrase.focus();
  }
}

export function initializeSearchTags() {
  const state = { counter: -1 };
  const searchField = document.querySelector('#searchQsmart');
  addSearchPhrase(state, searchField);
  searchField.addEventListener('keydown', e => searchFieldBehaviour(e, state, searchField));
}

export function initializeSearchButton() {
  document.querySelector('#searchSubmit').addEventListener('click', (e) => {
    e.preventDefault();
    doSearch();
  });
}

export function hideTagInputFields() {
  document.querySelectorAll('.tagInput').forEach(node => {
    node.type='hidden';
  });
}

export function initializeSearch() {
  hideTagInputFields();
  initializeSearchTags();
  initializeSearchButton();
}
