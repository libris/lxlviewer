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
    } else {
      convertedObject[k] = v;
    }
  });
  return convertedObject;
}


export function doSearch() {
  const validTags = ['isbn'];
  let queryText = [];
  const tagObject = {};
  const searchField = document.querySelector('#searchQ');
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
  let query = '/find?';
  const queryParts = [];
  _.each(getConvertedSearchObject(tagObject), (v, k) => {
    queryParts.push(`${k}=${v}`);
  });
  query += queryParts.join('&');
  window.location = query;
}

export function searchPhraseFocus(event, counter) {
  counter.counter = event.target.id.split('-')[1];
  return true;
}

export function searchFieldBehaviour(e, counter, searchField) {
  const validTags = ['isbn'];
  const currentPhrase = document.querySelector(`#searchphrase-${counter.counter}`);
  const tagEditing = currentPhrase.innerHTML.includes(':');

  if (tagEditing || e.keyCode === 190) {
    if (validTags.indexOf(currentPhrase.innerHTML.split(':')[0].toLowerCase()) > -1) {
      currentPhrase.setAttribute('class', 'searchphrase searchtag valid');
    } else {
      currentPhrase.setAttribute('class', 'searchphrase searchtag invalid');
    }
  } else {
    currentPhrase.setAttribute('class', 'searchphrase');
  }
    
  if (e.keyCode === 13) { // Enter
    e.preventDefault();
    if (!tagEditing) {
      doSearch();
      return false;
    } else {
      const newSearchTag = document.createElement('div');
      newSearchTag.setAttribute('id', `searchphrase-${parseInt(counter.counter, 10) + 1}`);
      newSearchTag.setAttribute('class', 'searchphrase');
      newSearchTag.setAttribute('contenteditable', 'true');
      newSearchTag.addEventListener('focus', event => searchPhraseFocus(event, counter));
      searchField.appendChild(newSearchTag);
      newSearchTag.focus();
      return false;
    }
  } else if (e.keyCode === 8 && // Backspace
      !tagEditing &&
      currentPhrase.innerHTML === '' &&
      currentPhrase.id.toString() !== 'searchphrase-0'
    ) {
    e.preventDefault();
    const previousPhrase = searchField.children[(counter.counter - 1)];
    previousPhrase.innerHTML = '';
    previousPhrase.setAttribute('class', 'searchphrase');
    

    const oldPhrase = searchField.children[counter.counter];
    searchField.removeChild(oldPhrase);
    previousPhrase.focus();
  }
  return true;
}

export function initializeSearchTags() {
  const counter = { counter: 0 };
  const searchField = document.querySelector('#searchQ');
  const firstDiv = document.createElement('div');
  firstDiv.setAttribute('id', `searchphrase-${counter.counter}`);
  firstDiv.setAttribute('class', 'searchphrase');
  firstDiv.setAttribute('contenteditable', 'true');
  firstDiv.addEventListener('focus', event => searchPhraseFocus(event, counter));
  searchField.appendChild(firstDiv);
  firstDiv.focus();
  searchField.addEventListener('keydown', e => searchFieldBehaviour(e, counter, searchField));
}



export function initializeSearchButton() {
  document.querySelector('#searchSubmit').addEventListener('click', () => {
    doSearch();
  });
}



export function initializeSearch() {
  initializeSearchTags();
  initializeSearchButton();
  // Remove empty fields
  $('form').submit(function(e){
    if ($('#searchQ').val() === '') {
      e.preventDefault();
      return;
    }
    // Empty inputs
    $(this).find('input').filter(function(){
      return !$.trim(this.value).length;
    }).prop('disabled', true);
  });
}