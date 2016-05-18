import * as UserUtil from '../utils/user';

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
    this.language = $('html').attr('lang');
    this.loadUser();
    console.log('Initialized view', this);
  }

  shiftWindow() {
    const navbarHeight = $('.navbar').height();
    if (navbarHeight) {
      scrollBy(0, -navbarHeight);
    }
  }

  loadUser() {
    if(typeof window.usertoken !== 'undefined' && window.usertoken !== 'None') {
      this.usertoken = window.usertoken;
    }
    const sigel = UserUtil.get('sigel');
    $('.sigelLabel').text(`(${sigel})`);
  }
}
