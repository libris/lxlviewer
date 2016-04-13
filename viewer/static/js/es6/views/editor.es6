import Thing from './thing'

export default class Editor extends Thing {

  initialize() {
    super.initialize();
    window.alert("Välkommen till editorn");
  }
}
