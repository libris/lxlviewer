import Loader from './loader';

var loadHandler = new Loader();

$(document).ready(function () {
  
  // Load everything
  setTimeout(() => {
    loadHandler.loadViews();
    loadHandler.initCommon();
    loadHandler.initPage(document.body.id);
  }, 100);
});
