export default {
  title: 'Libris katalogisering',
  language: 'sv',
  debounceTimer: 500, // Wait this long for input to stop before reacting
  version: process.env.VUE_APP_VERSION,
  gitDescribe: JSON.parse(process.env.VUE_APP_GIT_DESCRIBE),
  environment: runtimeConfig.ENV_LABEL || process.env.VUE_APP_ENV_LABEL || 'local',
  dataPath: runtimeConfig.API_PATH || process.env.VUE_APP_API_PATH,
  apiPath: runtimeConfig.API_PATH || process.env.VUE_APP_API_PATH,
  verifyPath: runtimeConfig.VERIFY_PATH || process.env.VUE_APP_VERIFY_PATH,
  idPath: runtimeConfig.ID_PATH || process.env.VUE_APP_ID_PATH,
  authPath: runtimeConfig.AUTHORIZE_PATH || process.env.VUE_APP_AUTHORIZE_PATH,
  redirectPath: runtimeConfig.REDIRECT_PATH || process.env.VUE_APP_REDIRECT_PATH,
  clientId: runtimeConfig.CLIENT_ID || process.env.VUE_APP_CLIENT_ID,
  siteAlias: runtimeConfig.SITE_ALIAS || process.env.VUE_APP_SITE_ALIAS,
  mockDisplay: process.env.VUE_APP_MOCK_DISPLAY_BOOL === 'true',
  mockHelp: process.env.VUE_APP_MOCK_HELP_BOOL === 'true',
  scopes: 'read write',
  matomoId: 23,
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
  showTypeChangerFor: [
    'Instance',
    'Work',
    'PlaceholderRecord',
    'CacheRecord',
    'ComplexSubject.termComponentList',
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
  warnOnSave: {
    'record.encodingLevel': ['marc:PrepublicationLevel', 'marc:PartialPreliminaryLevel'],
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
    issuanceType: {
      sv: 'Utgivningssätt',
      en: 'Issuance type',
      facet: {
        order: 1,
      },
    },
    'meta.encodingLevel': {
      sv: 'Beskrivningsnivå',
      en: 'Encoding level',
      facet: {
        order: 2,
      },
    },
    'publication.year': {
      sv: 'Utgivningsår',
      en: 'Publication year',
      facet: {
        order: 3,
      },
    },
    'instanceOf.language.@id': {
      sv: 'Verksspråk',
      en: 'Language of work',
      facet: {
        order: 4,
      },
    },
    '@type': {
      sv: 'Typ',
      en: 'Type',
      facet: {
        order: 5,
      },
    },
    'inScheme.@id': {
      sv: 'Termsystem',
      en: 'Term System',
      facet: {
        order: 6,
      },
    },
    'inCollection.@id': {
      sv: 'Termsamling',
      en: 'Term Collection',
      facet: {
        order: 7,
      },
    },
    'nationality.@id': {
      sv: 'Nationalitet',
      en: 'Nationality',
      facet: {
        order: 8,
      },
    },
    'language.@id': {
      sv: 'Språk',
      en: 'Language',
      facet: {
        order: 9,
      },
    },
    'genreForm.@id': {
      sv: 'Genre/form',
      en: 'Genre/form',
      facet: {
        order: 10,
      },
    },
    'instanceOf.genreForm.@id': {
      sv: 'Genre/form på verket',
      en: 'Genre/form of work',
      facet: {
        order: 11,
      },
    },
    'contribution.agent.@id': {
      sv: 'Medverkan eller primär medverkan',
      en: 'Contribution or primary contribution',
      facet: {
        order: 12,
      },
    },
    'contentType.@id': {
      sv: 'Innehållstyp',
      en: 'Content type',
      facet: {
        order: 13,
      },
    },
    'carrierType.@id': {
      sv: 'Bärartyp',
      en: 'Carrier type',
      facet: {
        order: 14,
      },
    },
    'instanceOf.subject.@id': {
      sv: 'Ämne',
      en: 'Subject',
      facet: {
        order: 15,
      },
    },
    'subject.@id': {
      sv: 'Ämne',
      en: 'Subject',
      facet: {
        order: 16,
      },
    },
    'intendedAudience.@id': {
      sv: 'Målgrupp',
      en: 'Intended audience',
      facet: {
        order: 17,
      },
    },
    'meta.bibliography.@id': {
      sv: 'Ingår i bibliografi',
      en: 'In bibliography',
      facet: {
        order: 18,
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
};
