import Loader from './loader';

window.loadHandler = new Loader();
window.loadHandler.createViews();
window.loadHandler.initPage(document.body.id);
