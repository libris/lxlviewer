function initTypeButtons() {
  var type = getParameter('type');
  if (typeof type !== 'undefined') {
    $('.type-buttons input').each(function() {
      if ($(this).val() == type.value) {
        $(this).closest('label').addClass('active');
        $(this).attr('checked', true);
      }
    });
  } else {
    $('.type-buttons .no-choice input').attr('checked', true);
  }
}

function getParameters() {
  var params = [];
  $('input[type=hidden]').each(function() {
    params.push({ key: $(this).attr('name'), value: $(this).val() });
    $(this).remove();
  });
  return params;
};

function getParameter(name) {
  var parameters = getParameters();
  for (var i = 0; i < parameters.length; i++){
    if (name == parameters[i].key) {
      return parameters[i];
    }
  }
}

$(function () {

  $(document).ready(function () {
    
    let searchForm = document.getElementById('searchForm');
    if(searchForm && typeof searchForm !== 'undefined') {
      console.log("found");
      document.getElementById('searchForm').onsubmit = function(e) {
        if (document.getElementById('searchQ').value == '') {
          e.preventDefault();
        } else if (document.getElementById('noneType') && document.getElementById('noneType').checked) {
        // This removes the "all types" value from the query...
          document.getElementById('noneType').checked = false;
        }
      };
    }
    
  });

});
