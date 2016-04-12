import Thing from './thing'

export default class Editor extends Thing {
  
  constructor() {
    super();
  }
  
  initialize() {
    super.initialize();
    window.alert("Välkommen till editorn");
  }
}
