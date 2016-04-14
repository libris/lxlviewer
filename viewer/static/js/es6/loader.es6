import Thing from './views/thing';
import Editor from './views/editor';
import Vocab from './views/vocab';
import Website from './views/website';

export default class Loader {

  constructor() {
    this.views = [];
  }

  createViews() {
    this.createView(new Thing());
    this.createView(new Editor());
    this.createView(new Vocab());
    this.createView(new Website());
  }

  createView(view) {
    this.views.push(view);
  }

  initPage(id) {
    const bodyId = id;

    for (let i = 0; i < this.views.length; i++) {
      if (this.views[i].constructor.name.toLowerCase() === bodyId.toLowerCase()) {
        this.views[i].initialize();
        return true;
      }
    }
    console.warn('View with id "' + bodyId + '" not found.');
    return false;
  }
}
