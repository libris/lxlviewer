import Loader from './loader';

var loadHandler = new Loader();

loadHandler.loadViews(['Thing']);

$(document).ready(function () {
  setTimeout(() => {
    loadHandler.initCommon();
    loadHandler.initPage();
  }, 100);
});
