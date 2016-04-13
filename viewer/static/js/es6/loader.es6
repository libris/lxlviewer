import Thing from './views/thing';
import Editor from './views/editor';
import Vocab from './views/vocab';
import Website from './views/website';

export default class Loader {
  
  constructor() {
    this.views = [];
  }

  loadViews() {
    this.views.push(new Thing());
    this.views.push(new Editor());
    this.views.push(new Vocab());
    this.views.push(new Website());
  }
    
  initCommon() {
    
    // Prevent empty search and handle searches without type set..
    let searchForm = document.getElementById('searchForm');
    if(searchForm && typeof searchForm !== 'undefined') {
      document.getElementById('searchForm').onsubmit = function(e) {
        if (document.getElementById('searchQ').value == '') {
          e.preventDefault();
        } else if (document.getElementById('noneType') && document.getElementById('noneType').checked) {
          document.getElementById('noneType').checked = false;
        }
      };
    }
    
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
