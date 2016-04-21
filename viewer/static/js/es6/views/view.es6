export default class View {
  
  /*
    Base class for the "views".
  */
  
  constructor() {
    this.name = this.constructor.name;
  }
  
  initialize() {
    
    if (window.location.hash) {
      this.shiftWindow();
    }
    
    console.log("Initialized view", this);
  }
  
  shiftWindow() {
    var navbarHeight = $('.navbar').height();
    if (navbarHeight) {
      scrollBy(0, -navbarHeight);
    }
  }
}
