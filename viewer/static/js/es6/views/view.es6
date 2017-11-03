
import * as User from '../models/user';
import * as StringUtil from '../utils/string';
import * as VocabUtil from '../utils/vocab';
import * as DisplayUtil from '../utils/display';

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
        '@type',
        'created',
        'modified',
        'mainEntity'
      ],
      lockedProperties: [
        'sameAs',
        'controlNumber',
        'systemNumber',
        'heldBy',
        'itemOf',
        'mainEntity',
        'created',
        'modified',
      ],
      disallowLocal: [
        // 'instanceOf',
      ],
      expandKeys: [
        // 'instanceOf',
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
      availableUserSettings: {
        languages: [
          {
            'label': 'Swedish',
            'value': 'sv',
          },
          {
            'label': 'English (experimental)',
            'value': 'en',
          },
        ],
        appTechs: [
          {
            'label': 'On',
            'value': 'on',
          },
          {
            'label': 'Off',
            'value': 'off',
          },
        ],
      },
    };
  }

  initialize() {
    this.user = User.getUserObject(window.userInfo);
    this.initializeTracking();
    this.initiateWarnBeforeUnload();
    if (window.location.hash) {
      this.shiftWindow();
    }
    this.settings.language = $('html').attr('lang');
    if (this.user) {
      this.settings.language = this.user.settings.language;
    }
    this.translate();
  }

  getLdDepencendies() {
    return new Promise((resolve, reject) => {
      VocabUtil.getVocab().then((vocab) => {
        this.vocabMap = new Map(vocab['@graph'].map((entry) => [entry['@id'], entry]));
        this.vocab = vocab['@graph'];
        // $('#loadingText .status').text('Hämtar visningsdefinitioner');
        DisplayUtil.getDisplayDefinitions().then((display) => {
          this.display = display;
          VocabUtil.getForcedListTerms().then((result) => {
            this.forcedListTerms = result;
            VocabUtil.getContext().then((context) => {
              this.context = context['@context'];
              resolve();
            }, (error) => {
              reject(error);
            });
          }, (error) => {
            reject(error);
          });
        }, (error) => {
          reject(error);
        });
      }, (error) => {
        reject(error);
      });
    });
  }

  translate() {
    const langCode = this.settings.language;
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

  trackEvent(category, action, name) {
    if (typeof this._paq === 'undefined') {
      this.initializeTracking();
    }
    if (typeof this._paq !== 'undefined') {
      this._paq.push(['trackEvent', category, action, name]);
    }
  }

  initializeTracking() {
    const self = this;
    if (self.settings.siteInfo.piwikId) {
      self._paq = self._paq || [];
      self._paq.push(['trackPageView']);
      self._paq.push(['enableLinkTracking']);
      (function() {
        var u="//analytics.kb.se/";
        self._paq.push(['setTrackerUrl', u+'piwik.php']);
        self._paq.push(['setSiteId', self.settings.siteInfo.piwikId]);
        var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
        g.type='text/javascript'; g.async=true; g.defer=true; g.src=u+'piwik.js'; s.parentNode.insertBefore(g,s);
      })();
    }
  }

  initiateWarnBeforeUnload() {
    this.dirty = false;
    window.addEventListener("beforeunload", (e) => {
      if (!this.dirty) {
        return undefined;
      }
      const confirmationMessage = 'You have unsaved changes. Do you want to leave the page?';

      (e || window.event).returnValue = confirmationMessage; //Gecko + IE
      return confirmationMessage; //Gecko + Webkit, Safari, Chrome etc.
    });
  }

}
