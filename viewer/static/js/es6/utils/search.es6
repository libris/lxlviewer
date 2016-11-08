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

export function initializeSearch() {
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
