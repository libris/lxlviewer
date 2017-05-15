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
      baseMaterials: [
        'https://id.kb.se/vocab/Instance',
        'https://id.kb.se/vocab/Work',
        'https://id.kb.se/vocab/Person',
        'https://id.kb.se/vocab/Organization',
        'https://id.kb.se/vocab/Meeting',
        'https://id.kb.se/vocab/Event',
        'https://id.kb.se/vocab/GenreForm',
        'https://id.kb.se/vocab/Topic',
      ],
      removableBaseUris: [
        'http://libris.kb.se/',
        'https://libris.kb.se/',
        'http://id.kb.se/',
        'https://id.kb.se/',
      ],
      specialProperties: [
        '@type',
        '@id',
        'issuanceType',
      ],
      disallowLocal: [
        'instanceOf',
      ],
      expandKeys: [
        'instanceOf',
        'itemOf',
      ],
      propertyChains: {
        '@type': {
          sv: 'Typ',
          en: 'Type',
        },
        'carrierType': {
          sv: 'Bärartyp',
          en: 'Carrier type',
        },
        'instanceOf.@type': {
          sv: 'Verkstyp',
          en: 'Type of work',
        },
        'instanceOf.contentType': {
          sv: 'Verksinnehållstyp',
          en: 'Content type of work',
        },
        'instanceOf.language': {
          sv: 'Verksspråk',
          en: 'Language of work',
        },
        'publication.date': {
          sv: 'Utgivningsdatum',
          en: 'Publication date',
        },
      },
      validSearchTags: [
        'isbn',
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
