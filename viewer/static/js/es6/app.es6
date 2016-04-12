import Loader from './loader';

var loadHandler = new Loader();

loadHandler.loadViews(['Thing']);

$(document).ready(function () {
  setTimeout( function () {
    loadHandler.initPage();
    
  }, 1000);
});
