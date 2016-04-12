export default class View {
  
  constructor(name) {
    this.name = name;
  }
  
  initialize() {
    console.log("View '" + this.name + "' was initialized.");
  }
}
