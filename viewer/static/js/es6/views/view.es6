import * as UserUtil from '../utils/user';
import * as StringUtil from '../utils/string';

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
      embeddedTypes: [
        'StructuredValue',
        'ProvisionActivity',
        'Contribution',
      ],
      baseMaterials: [
        'https://id.kb.se/vocab/Instance',
        'https://id.kb.se/vocab/Work',
        'https://id.kb.se/vocab/Agent',
        // 'https://id.kb.se/vocab/Person'
        // 'https://id.kb.se/vocab/Organization',
        // 'https://id.kb.se/vocab/Meeting',
        // 'https://id.kb.se/vocab/Event',
        // 'https://id.kb.se/vocab/GenreForm',
        // 'https://id.kb.se/vocab/Topic',
      ],
      removableBaseUris: [
        'http://libris.kb.se/',
        'https://libris.kb.se/',
        'http://id.kb.se/vocab/',
        'https://id.kb.se/vocab/',
        'http://id.kb.se/',
        'https://id.kb.se/',
      ],
      specialProperties: [
        '@id',
        'sameAs',
        '@type',
      ],
      lockedProperties: [
        'heldBy',
        'itemOf',
      ],
      disallowLocal: [
        'instanceOf',
      ],
      expandKeys: [
        'instanceOf',
        'itemOf',
      ],
      nonExtractableClasses: [
        'Place',
        'Library',
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
        'issuanceType': {
          sv: 'Utgivningssätt',
          en: 'Issuance type',
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
      dataSetFilters: {
        libris: [
          'https://id.kb.se/vocab/Instance',
          'https://id.kb.se/vocab/Work',
          'https://id.kb.se/vocab/Agent',
          'https://id.kb.se/vocab/Concept',
        ],
      },
    };
  }

  initialize() {
    if (window.location.hash) {
      this.shiftWindow();
    }
    this.settings.userSettings = UserUtil.loadUserSettings();
    this.settings.language = this.settings.userSettings.language || $('html').attr('lang');
    this.translate();
    $('.sigelLabel').text(`(${this.settings.userSettings.currentSigel})`);
    // console.log('Initialized view', this);
  }

  translate() {
    const langCode = this.settings.userSettings.language || this.settings.language;
    $('.js-translateable').each(function () {
      const originalText = $(this).attr('data-translateable');
      const newText = StringUtil.getUiPhraseByLang(originalText, langCode);
      $(this).text(newText);
    });
  }

  shiftWindow() {
    const navbarHeight = $('.navbar').height();
    if (navbarHeight) {
      scrollBy(0, -navbarHeight);
    }
  }
}
