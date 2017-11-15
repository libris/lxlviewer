
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
    this.lxlDebug = true;
    this.settings = {
      // vocabPfx: 'kbv:',
      vocabPfx: 'https://id.kb.se/vocab/',
      siteInfo: window.siteInfo || {},
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
    this.user = User.getUserObject(window.userInfo || {});
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
    this.initWarningFunc();
  }

  getLdDependencies(fetchIndicator) {
    const promiseArray = [];
    if (fetchIndicator.indexOf('vocab') > -1) {
      const vocabPromise = VocabUtil.getVocab().then((vocab) => {
        this.vocabMap = new Map(vocab['@graph'].map((entry) => [entry['@id'], entry]));
        this.vocab = vocab['@graph'];
      }, (error) => {
        console.log('getVocab', error);
      });
      promiseArray.push(vocabPromise);
    }
    if (fetchIndicator.indexOf('display') > -1) {
      const displayPromise = DisplayUtil.getDisplayDefinitions().then((display) => {
        this.display = display;
      }, (error) => {
        console.log('getDisplayDefinitions', error);
      });
      promiseArray.push(displayPromise);
    }
    if (fetchIndicator.indexOf('listTerms') > -1) {
      const repeatablePromise = VocabUtil.getForcedListTerms().then((result) => {
        this.forcedListTerms = result;
      }, (error) => {
        console.log('getForcedListTerms', error);
      });
      promiseArray.push(repeatablePromise);
    }
    if (fetchIndicator.indexOf('context') > -1) {
      const contextPromise = VocabUtil.getContext().then((context) => {
        this.context = context['@context'];
      }, (error) => {
        console.log('getContext', error);
      });
      promiseArray.push(contextPromise);
    }
    return promiseArray;
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
      const _paq = _paq || [];
      _paq.push(['trackPageView']);
      _paq.push(['enableLinkTracking']);
      (function() {
        var u="//analytics.kb.se/";
        _paq.push(['setTrackerUrl', u+'piwik.php']);
        _paq.push(['setSiteId', self.settings.siteInfo.piwikId]);
        var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
        g.type='text/javascript'; g.async=true; g.defer=true; g.src=u+'piwik.js'; s.parentNode.insertBefore(g,s);
      })();
    }
  }

  initWarningFunc() {
    if (!this.lxlDebug || navigator.userAgent.indexOf('PhantomJS') > -1) {
      window.lxlWarning = function (...strings) {
        return;
      }
      window.lxlError = function (...strings) {
        return;
      }
      return;
    }
    window.lxlWarnStack = [];
    window.lxlWarning = function (...strings) {
      if (window.lxlWarnStack.indexOf(JSON.stringify(strings.join())) === -1) {
        window.lxlWarnStack.push(JSON.stringify(strings.join()));
        return console.warn('%c LXL ', 'background: #009788; color: #fff;', ...strings);
      }
    };
    window.lxlErrorStack = [];
    window.lxlError = function (...strings) {
      if (window.lxlErrorStack.indexOf(JSON.stringify(strings.join())) === -1) {
        window.lxlErrorStack.push(JSON.stringify(strings.join()));
        return console.error('%c LXL ERROR ', 'background: #a50000; color: #fff;', ...strings);
      }
    };
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
