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


export function initializeSearchTags() {
  let counter = 0;
  const searchField = document.querySelector('#searchQ');
  const firstDiv = document.createElement('div');
  firstDiv.setAttribute('id', `searchphrase-${counter}`);
  firstDiv.setAttribute('class', 'searchphrase');
  firstDiv.setAttribute('contenteditable', 'true');
  searchField.appendChild(firstDiv);
  firstDiv.focus();
  searchField.addEventListener('keydown', e => {
    if (e.keyCode === 13) {
      e.preventDefault();
      const tagEditing = document.querySelector(`#searchphrase-${counter}`).innerHTML.indexOf(':') > 0;
      if (!tagEditing) {
        console.log('SEARCH!');
        return false;
      } else {
        counter++;
        const newSearchTag = document.createElement('div');
        newSearchTag.setAttribute('id', `searchphrase-${counter}`);
        newSearchTag.setAttribute('class', 'searchphrase');
        newSearchTag.setAttribute('contenteditable', 'true');
        searchField.appendChild(newSearchTag);
        newSearchTag.focus();
        return false;
      }
    } else if (e.keyCode === 190) {
      document.querySelector(`#searchphrase-${counter}`)
        .setAttribute('class', 'searchphrase searchtag');
    }
    return true;
  });
}

export function initializeSearchButton() {
  document.querySelector('#searchSubmit').addEventListener('click', e => {
    let queryText = '';
    const tagObject = {};
    const searchField = document.querySelector('#searchQ');
    for (const node of searchField.childNodes) {
      if (node.className.split(' ').indexOf('searchtag') > -1) {
        const tag = node.innerHTML.split(':');
        tagObject[tag[0]] = tag[1];
      } else {
        queryText = `${queryText} ${node.innerHTML}`;
      }
    }
    tagObject.q = queryText;
    console.log(tagObject);
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