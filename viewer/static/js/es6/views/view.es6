export default class View {
  
  constructor() {
    this.name = this.constructor.name;
    this.loaderIndex = window.loadHandler.addView(this);
    this.instance = window.loadHandler.getView(this.loaderIndex);
  }
  
  initialize() {
    
    if (window.location.hash) {
      shiftWindow();
    }
  }
}

function shiftWindow() {
  console.log("Window shifted");
  var navbarHeight = $('.navbar').height();
  if (navbarHeight) {
    scrollBy(0, -navbarHeight);
  }
}
