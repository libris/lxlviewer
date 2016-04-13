import Thing from './views/thing';
import Editor from './views/editor';
import Vocab from './views/vocab';
import Website from './views/website';

export default class Loader {
  
  constructor() {
    this.views = [];
  }
  
  addView(view) {
    let index = this.views.length;
    this.views.push(view);
    return index;
  }
  
  getView(index) {
    return this.views[index];
  }
  
  createViews() {
    new Thing();
    new Editor();
    new Vocab();
    new Website();
  }
  
  initPage(id) {
    let bodyId = id;
        
    for(var i = 0; i < this.views.length; i++) {
      if (this.views[i].constructor.name.toLowerCase() == bodyId.toLowerCase()) {
        this.views[i].initialize();
        return true;
      }
    }
    console.log(bodyId + " not found in list of views.");
    return false;
  }
}
