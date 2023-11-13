// NOTE: This is intentionally JSON-LD shaped, to support moving from this
// hardcoded data to a dataset with minimal effort.

const IDKBSE = 'https://id.kb.se/changenote/';

export default [
  {
    '@id': `${IDKBSE}primarycontribution`,
    appliesToPattern: {
      onPredicate: 'contribution',
      objectMatches: { '@type': 'PrimaryContribution' },
    },
  },
  {
    '@id': `${IDKBSE}maintitle`,
    appliesToPattern: {
      onPredicateChain: ['hasTitle', 'mainTitle'],
    },
  },
  {
    '@id': `${IDKBSE}primarytitle`,
    appliesToPattern: {
      onPredicate: 'hasTitle',
      objectMatches: { '@type': 'Title' },
    },
  },
  {
    '@id': `${IDKBSE}primarypublication`,
    appliesToPattern: {
      onPredicate: 'publication',
      objectMatches: { '@type': 'PrimaryPublication' },
    },
  },
  {
    '@id': `${IDKBSE}intendedaudience`,
    appliesToPattern: {
      onPredicate: 'intendedAudience',
    },
  },
  {
    '@id': `${IDKBSE}ddcclassification`,
    appliesToPattern: {
      onPredicate: 'classification',
      objectMatches: { '@type': 'ClassificationDdc' },
    },
  },
  {
    '@id': `${IDKBSE}sabclassification`,
    appliesToPattern: {
      onPredicate: 'classification',
      objectMatches: {
        inScheme: { code: 'kssb' },
      },
    },
  },
  {
    '@id': `${IDKBSE}serialrelation`,
    appliesToPattern: {
      subjectMatches: {
        issuanceType: 'Serial',
      },
      onPredicate: {
        unionOf: ['precededBy', 'succeededBy'],
      },
    },
  },
  {
    '@id': `${IDKBSE}serialtermination`,
    appliesToPattern: {
      subjectMatches: {
        issuanceType: 'Serial',
      },
      onPredicate: 'publication',
      showProperties: ['endDate'],
    },
  },
];
