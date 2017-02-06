import Thing from './views/thing';
import Editor from './views/editor';
import Vocab from './views/vocab';
import Website from './views/website';
import UserSettings from './views/usersettings';
import CreateNew from './views/createnew';
import Import from './views/import';

export default class Loader {

  /*
    This class loads the corresponding JS files for the current bodyId.
  */

  constructor() {
    this.views = [];
  }

  createViews() {
    // Creates instances of our different classes.
    // TODO: Should probably be done on demand.
    this.createView(new Thing());
    this.createView(new Editor());
    this.createView(new Vocab());
    this.createView(new Website());
    this.createView(new UserSettings());
    this.createView(new CreateNew());
    this.createView(new Import());
  }

  createView(view) {
    this.views.push(view);
  }

  getCurrentView() {
    return this.currentView;
  }

  initPage(id) {
    // This method should be called on page load.
    const bodyId = id;

    for (let i = 0; i < this.views.length; i++) {
      if (this.views[i].constructor.name.toLowerCase() === bodyId.toLowerCase()) {
        this.currentView = this.views[i];
        this.views[i].initialize();
        return true;
      }
    }
    if (typeof bodyId === 'undefined' || bodyId.length === 0) {
      console.warn('No view script loaded: No ID on body');
    } else {
      console.warn('No view script loaded: None found for "#' + bodyId + '"');
    }
    return false;
  }
}
