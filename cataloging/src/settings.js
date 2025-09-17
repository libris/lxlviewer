import { ANY_TYPE, BNODE_ID_KEY, HAS_ID_KEY, MATCHING_MODE_KEY } from "@/utils/bulk.js";

export default {
  title: 'Libris katalogisering',
  language: 'sv',
  debounceTimer: 500, // Wait this long for input to stop before reacting
  version: runtimeConfig.VITE_APP_VERSION || import.meta.env.VITE_APP_VERSION,
  gitDescribe: runtimeConfig.VITE_APP_GIT_DESCRIBE || import.meta.env.VITE_APP_GIT_DESCRIBE,
  environment: runtimeConfig.ENV_LABEL || import.meta.env.VITE_APP_ENV_LABEL || 'local',
  dataPath: runtimeConfig.API_PATH || import.meta.env.VITE_APP_API_PATH,
  apiPath: runtimeConfig.API_PATH || import.meta.env.VITE_APP_API_PATH,
  verifyPath: runtimeConfig.VERIFY_PATH || import.meta.env.VITE_APP_VERIFY_PATH,
  idPath: runtimeConfig.ID_PATH || import.meta.env.VITE_APP_ID_PATH,
  authPath: runtimeConfig.AUTHORIZE_PATH || import.meta.env.VITE_APP_AUTHORIZE_PATH,
  redirectPath: runtimeConfig.REDIRECT_PATH || import.meta.env.VITE_APP_REDIRECT_PATH,
  clientId: runtimeConfig.CLIENT_ID || import.meta.env.VITE_APP_CLIENT_ID,
  siteAlias: runtimeConfig.SITE_ALIAS || import.meta.env.VITE_APP_SITE_ALIAS,
  mockDisplay: import.meta.env.VITE_APP_MOCK_DISPLAY_BOOL === 'true',
  mockHelp: import.meta.env.VITE_APP_MOCK_HELP_BOOL === 'true',
  scopes: 'read write',
  appPaths: {
    '/find?': '/search/libris?',
  },
  embeddedTypes: [
    'StructuredValue',
    'QualifiedRole',
  ],
  extractableTypes: [
    'Item',
    'Instance',
    // 'Agent',
    // 'Concept', - Blocking this per request of MSS
    'Work',
  ],
  extractableMappedTypes: {
    Item: 'SingleItem',
  },
  showTypeChangerFor: [
    'Instance',
    'Work',
    'PlaceholderRecord',
    'CacheRecord',
    'ComplexSubject.termComponentList',
    ANY_TYPE
  ],
  keysToClear: {
    duplication: [
      'record.bibliography',
      'record.controlNumber',
      'record.descriptionUpgrader',
      'record.generationProcess',
      'record.generationDate',
      'record.identifiedBy',
      'record.inDataset',
      'record.sameAs',
      'mainEntity.sameAs',
      'mainEntity.bulk:execution',
      'mainEntity.image',
      'work.sameAs',
      "record['@reverse']", // prevent visual bugs
      "mainEntity['@reverse']", // prevent visual bugs
    ],
    remoteImport: [
      'record.generationProcess',
      'record.generationDate',
      'record.sameAs',
      'mainEntity.sameAs',
      'work.sameAs',
    ],
  },
  removableBaseUris: [
    'http://libris.kb.se/',
    'https://libris.kb.se/',
    'http://id.kb.se/vocab/',
    'https://id.kb.se/vocab/',
    'http://id.kb.se/',
    'https://id.kb.se/',
  ],
  filteredCategories: [
    'pending',
    'shorthand',
    'unstable',
  ],
  hiddenProperties: [
    '@id',
    'created',
    'modified',
    'mainEntity',
    BNODE_ID_KEY,
    MATCHING_MODE_KEY,
    HAS_ID_KEY
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
    'descriptionCreator',
    'descriptionLastModifier',
    'generationDate',
    'generationProcess',
    'recordStatus',
  ],
  unlockableProperties: [
    'itemOf',
    'heldBy',
  ],
  defaultExpandedProperties: [
    'hasComponent',
    '@reverse/reproductionOf',
    '@reverse/supplementTo',
  ],
  dataSetFilters: {
    libris: [
      {
        value: 'Instance',
        label: 'Instance',
      },
      {
        value: 'Work',
        label: 'Work',
      },
      {
        value: 'Agent',
        label: 'Agent',
      },
      {
        value: 'Concept',
        label: 'Concept',
      },
      {
        value: '*',
        label: 'All',
      },
    ],
  },
  protectedProperties: [
    'usageAndAccessPolicy',
    'nextShelfControlNumber'
  ],
  warnOnSave: {
    'record.encodingLevel': ['marc:PrepublicationLevel', 'marc:PartialPreliminaryLevel'],
  },
  warnOnSaveConcerning: {
    concerning: 'concerning',
  },
  propertyChains: {
    '@reverse.itemOf.heldBy.@id': {
      sv: 'Har bestånd',
      en: 'Has holding',
      facet: {
        order: -1,
      },
    },
    o: {
      sv: 'Länkar till',
      en: 'Links to',
    },
    'instanceOf.@type': {
      sv: 'Verkstyp',
      en: 'Type of work',
      facet: {
        order: 0,
      },
    },
    'instanceOf.category.@id': {
      sv: 'Kategori på verket',
      en: 'Category of work',
      facet: {
        order: 1,
      },
    },
    issuanceType: {
      sv: 'Utgivningssätt',
      en: 'Issuance type',
      facet: {
        order: 1,
      },
    },
    '@type': {
      sv: 'Typ',
      en: 'Type',
      facet: {
        order: 2,
      },
    },
    'category.@id': {
      sv: 'Kategori',
      en: 'Category',
      facet: {
        order: 3,
      },
    },
    'meta.encodingLevel': {
      sv: 'Beskrivningsnivå',
      en: 'Encoding level',
      facet: {
        order: 4,
      },
    },
    'publication.year': {
      sv: 'Utgivningsår',
      en: 'Publication year',
      facet: {
        order: 5,
      },
    },
    'instanceOf.language.@id': {
      sv: 'Verksspråk',
      en: 'Language of work',
      facet: {
        order: 6,
      },
    },
    'inScheme.@id': {
      sv: 'Termsystem',
      en: 'Term System',
      facet: {
        order: 7,
      },
    },
    'inCollection.@id': {
      sv: 'Termsamling',
      en: 'Term Collection',
      facet: {
        order: 8,
      },
    },
    'nationality.@id': {
      sv: 'Nationalitet',
      en: 'Nationality',
      facet: {
        order: 9,
      },
    },
    'language.@id': {
      sv: 'Språk',
      en: 'Language',
      facet: {
        order: 10,
      },
    },
    'genreForm.@id': {
      sv: 'Genre/form',
      en: 'Genre/form',
      facet: {
        order: 11,
      },
    },
    'instanceOf.genreForm.@id': {
      sv: 'Genre/form på verket',
      en: 'Genre/form of work',
      facet: {
        order: 12,
      },
    },
    'contribution.agent.@id': {
      sv: 'Medverkan eller primär medverkan',
      en: 'Contribution or primary contribution',
      facet: {
        order: 13,
      },
    },
    'contentType.@id': {
      sv: 'Innehållstyp',
      en: 'Content type',
      facet: {
        order: 14,
      },
    },
    'carrierType.@id': {
      sv: 'Bärartyp',
      en: 'Carrier type',
      facet: {
        order: 15,
      },
    },
    'instanceOf.subject.@id': {
      sv: 'Ämne',
      en: 'Subject',
      facet: {
        order: 17,
      },
    },
    'subject.@id': {
      sv: 'Ämne',
      en: 'Subject',
      facet: {
        order: 18,
      },
    },
    'intendedAudience.@id': {
      sv: 'Målgrupp',
      en: 'Intended audience',
      facet: {
        order: 19,
      },
    },
    'meta.bibliography.@id': {
      sv: 'Ingår i bibliografi',
      en: 'In bibliography',
      facet: {
        order: 20,
      },
    },
    'concerning.@reverse.itemOf.heldBy.@id': {
      sv: 'Har bestånd',
      en: 'Has holding',
      facet: {
        order: 22,
      },
    },
    'concerning.issuanceType': {
      sv: 'Utgivningssätt',
      en: 'Issuance type',
      facet: {
        order: 23,
      },
    },
    '@reverse': {
      sv: 'Relation',
      en: 'Relation',
      facet: {
        order: 0,
      },
    },
  },
  interestingFacets: {
    '@reverse': [
      'contribution.agent',
      'https://id.kb.se/vocab/subject',
    ],
  },
  sortOptions: {
    Instance: [
      {
        query: '',
        label: 'Relevance',
      },
      {
        query: '_sortKeyByLang',
        label: 'A-Z',
      },
      {
        query: '-_sortKeyByLang',
        label: 'Z-A',
      },
      {
        query: '-publication.year',
        label: 'Publication year (descending)',
      },
      {
        query: 'publication.year',
        label: 'Publication year (ascending)',
      },
      {
        query: '-meta.modified',
        label: 'Last updated',
      },
      {
        query: '-reverseLinks.totalItems',
        label: 'Most linked',
      },
    ],
    Work: [
      {
        query: '',
        label: 'Relevance',
      },
      {
        query: '_sortKeyByLang',
        label: 'A-Z',
      },
      {
        query: '-_sortKeyByLang',
        label: 'Z-A',
      },
      {
        query: '-meta.modified',
        label: 'Last updated',
      },
      {
        query: '-reverseLinks.totalItems',
        label: 'Most linked',
      },
    ],
    Concept: [
      {
        query: '',
        label: 'Relevance',
      },
      {
        query: '_sortKeyByLang',
        label: 'A-Z',
      },
      {
        query: '-_sortKeyByLang',
        label: 'Z-A',
      },
      {
        query: '-meta.modified',
        label: 'Last updated',
      },
      {
        query: '-reverseLinks.totalItems',
        label: 'Most linked',
      },
    ],
    Item: [
      {
        query: '',
        label: 'Relevance',
      },
      {
        query: 'heldBy.@id',
        label: 'Sigel (A-Z)',
      },
      {
        query: '-heldBy.@id',
        label: 'Sigel (Z-A)',
      },
    ],
    Agent: [
      {
        query: '',
        label: 'Relevance',
      },
      {
        query: '_sortKeyByLang',
        label: 'A-Z',
      },
      {
        query: '-_sortKeyByLang',
        label: 'Z-A',
      },
      {
        query: '-meta.modified',
        label: 'Last updated',
      },
      {
        query: '-reverseLinks.totalItems',
        label: 'Most linked',
      },
    ],
    Common: [
      {
        query: '',
        label: 'Relevance',
      },
      {
        query: '_sortKeyByLang',
        label: 'A-Z',
      },
      {
        query: '-_sortKeyByLang',
        label: 'Z-A',
      },
      {
        query: '-meta.modified',
        label: 'Last updated',
      },
      {
        query: '-reverseLinks.totalItems',
        label: 'Most linked',
      },
    ],
  },
  availableUserSettings: {
    languages: [
      {
        label: 'Swedish',
        value: 'sv',
      },
      {
        label: 'English (experimental)',
        value: 'en',
      },
    ],
    appTechs: [
      {
        label: 'On',
        value: 'on',
      },
      {
        label: 'Off',
        value: 'off',
      },
    ],
  },
  cookieConsent: {
    categories: {
      necessary: {
        readOnly: true,
        enabled: true
      },
      analytics: {
        autoClear: {
          cookies: [
            {
              // Matomo cookies
              name: /^_pk.*/
            }
          ]
        }
      }
    },
    language: {
      translations: {
        sv: {
          preferencesModal: {
            sections: [
              {
                title: "Om användning av kakor",
                description: "Den här tjänsten använder kakor (cookies). En kaka är en liten textfil som lagras i besökarens dator. KB:s tjänster är designade för att minska risken för spridning av dina uppgifter. Informationen som lagras via kakor kan aldrig användas av tredje part i marknadsföringssyfte."
              },
              {
                title: "Nödvändiga kakor",
                description: "Dessa kakor krävs för att tjänsten ska vara säker och fungera som den ska. Därför går de inte att inaktivera.",
                linkedCategory: "necessary",
                cookieTable: {
                  title: "Lista över kakor",
                  headers: {
                    name: "Namn",
                    description: "Beskrivning",
                    duration: "Varaktighet"
                  },
                  body: [
                    {
                      name: "cc_cookie",
                      description: "Används för att spara dina kakinställningar.",
                      duration: "6 månader"
                    }
                  ]
                }
              },
              {
                title: "Analytiska kakor",
                description:
                  "Kakor som ger oss information om hur webbplatsen används som gör att vi kan underhålla, driva och förbättra användarupplevelsen.",
                linkedCategory: "analytics",
                cookieTable: {
                  title: "Lista över kakor",
                  headers: {
                    name: "Namn",
                    description: "Beskrivning",
                    duration: "Varaktighet"
                  },
                  body: [
                    {
                      name: "_pk_id",
                      description: "Används för att komma ihåg besökaren genom ett unikt och slumpmässigt utformat ID.",
                      duration: "13 månader"
                    },
                    {
                      name: "_pk_ses",
                      description: "Används för att spara tillfällig data om besöket.",
                      duration: "30 minuter"
                    },
                    {
                      name: "mtm_consent",
                      description: "Används för att spara samtycke till analytiska kakor.",
                      duration: "400 dagar"
                    },
                    {
                      name: "mtm_consent_removed",
                      description: "Används för att spara nekat samtycke till analytiska kakor.",
                      duration: "400 dagar"
                    }
                  ]
                }
              },
              {
                title: "Mer information",
                description: "Du kan alltid ändra dina val genom att klicka på “Hantera cookies” längst ner på sidan i sidfoten."
              }
            ]
          }
        }
      }
    },
    onConsent: ({ cookie }) => {
      if (cookie.categories.includes('analytics')) {
        window._paq = window._paq || [];
        window._paq.push(['rememberConsentGiven']);
      }
    },
    onChange: ({ cookie }) => {
      if (cookie.categories.includes('analytics')) {
        window._paq = window._paq || [];
        window._paq.push(['rememberConsentGiven']);
      } else {
        window._paq.push(['forgetConsentGiven']);
      }
    }
  }
};
