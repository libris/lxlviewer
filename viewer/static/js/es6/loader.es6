import Thing from './views/thing';
import Editor from './views/editor';
import Vocab from './views/vocab';
import Website from './views/website';
import UserSettings from './views/usersettings';
import CreateNew from './views/createnew';

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
  }

  createView(view) {
    this.views.push(view);
  }

  initPage(id) {
    // This method should be called on page load.
    const bodyId = id;

    for (let i = 0; i < this.views.length; i++) {
      if (this.views[i].constructor.name.toLowerCase() === bodyId.toLowerCase()) {
        this.views[i].initialize();
        return true;
      }
    }
    console.warn('No scripts for "' + bodyId + '" found.');
    return false;
  }
}
