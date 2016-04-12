import Loader from './loader';

var loadHandler = new Loader();

loadHandler.loadViews(['Thing']);

$(document).ready(function () {
  
  // Prevent empty search and handle searches without type set..
  var searchForm = document.getElementById('searchForm');
  if(searchForm && typeof searchForm !== 'undefined') {
    document.getElementById('searchForm').onsubmit = function(e) {
      if (document.getElementById('searchQ').value == '') {
        e.preventDefault();
      } else if (document.getElementById('noneType') && document.getElementById('noneType').checked) {
        document.getElementById('noneType').checked = false;
      }
    };
  }
  
  // Load everything
  setTimeout(() => {
    loadHandler.initCommon();
    loadHandler.initPage(document.body.id);
  }, 100);
});
