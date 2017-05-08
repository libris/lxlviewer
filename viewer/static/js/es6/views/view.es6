import * as UserUtil from '../utils/user';

export default class View {

  /*
    Base class for the "views".
  */

  constructor(name) {
    this.name = name;
    this.settings = {
      // vocabPfx: 'kbv:',
      vocabPfx: 'https://id.kb.se/vocab/',
      siteInfo: window.siteInfo,
      embeddedTypes: ['StructuredValue', 'ProvisionActivity', 'Contribution'],
      removableBaseUris: [
        'http://libris.kb.se/',
        'https://libris.kb.se/',
        'http://id.kb.se/',
        'https://id.kb.se/',
      ],
      specialProperties: [
        '@type',
        '@id',
      ],
      userInfo: {
        sigel: UserUtil.get('sigel'),
      },
    };
  }

  initialize() {
    if (window.location.hash) {
      this.shiftWindow();
    }
    this.settings.language = $('html').attr('lang');
    this.loadUser();
    // console.log('Initialized view', this);
  }

  shiftWindow() {
    const navbarHeight = $('.navbar').height();
    if (navbarHeight) {
      scrollBy(0, -navbarHeight);
    }
  }

  loadUser() {
    this.access_token = UserUtil.get('access_token');;
    const sigel = UserUtil.get('sigel');
    $('.sigelLabel').text(`(${sigel})`);
  }
}
