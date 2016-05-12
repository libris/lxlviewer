import * as _ from 'lodash';

export default {
  template: '{{label}}',
  props: {
    item: {},
  },
  computed: {
    label() {
      const item = this.item;
      if (!_.isPlainObject(item)) {
        return item;
      }
      let tlabel = '';
      switch (item['@type']) {
        case 'TopicalTerm':
          return item.prefLabel;
        case 'Product':
          return item.edition;
        case 'Place':
          return item.label;
        case 'ProviderEvent':
          return item.providerName;
        case 'ConceptScheme':
        case 'Concept':
          return item.notation;
        case 'Person':
          tlabel = `${item.givenName} ${item.familyName}`;
          if (item.birthYear && item.deathYear) {
            tlabel += ` (${item.birthYear}-${item.deathYear})`;
          } else if (item.birthYear) {
            tlabel += ` (${item.birthYear}-)`;
          }
          return tlabel;
        default:
          return item['@id'];
      }
    },
  },
};
