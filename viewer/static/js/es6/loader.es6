import Thing from './views/thing';
import * as VocabLoader from './utils/vocabloader';

export default class Loader {
  
  constructor() {
    this.views = [];
  }

  loadViews(views) {
    // Accepts list of class names.
    this.views.push(new Thing('Thing'));
  }
    
  initCommon() {
    VocabLoader.initVocabClicks();
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
