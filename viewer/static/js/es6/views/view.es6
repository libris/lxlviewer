export default class View {
  
  constructor() {
    this.name = this.constructor.name;
  }
  
  initialize() {
    console.log("View '" + this.name + "' was initialized.");
  }
}
