export default class View {
  
  constructor() {
    this.name = this.constructor.name;
  }
  
  initialize() {
    
    if (window.location.hash) {
      shiftWindow();
    }
    
    console.log("View '" + this.name + "' was initialized.");
  }
  
  shiftWindow() {
    var navbarHeight = $('.navbar').height();
    if (navbarHeight) {
      scrollBy(0, -navbarHeight);
    }
  }
}
