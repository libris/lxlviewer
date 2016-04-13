import Loader from './loader';

window.loadHandler = new Loader();

$(document).ready(function () {
  
  // Load everything
  setTimeout(() => {
    window.loadHandler.createViews();
    window.loadHandler.initPage(document.body.id);
  }, 0);
});
