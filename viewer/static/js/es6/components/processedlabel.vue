<script>
import * as _ from 'lodash';

export default {
  template: '{{label}}',
  props: {
    item: {},
    language: '',
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
        case 'Agent':
          return item.label;
        case 'ProviderEvent':
          return item.providerName;
        case 'Language':
          return item.prefLabelByLang[this.language];
        case 'ConceptScheme':
        case 'Concept':
        case 'Organization':
          return item.notation;
        case 'Aggregate':
          return item.title;
        case 'PublicationVolume':
          return item.uniformTitle;
        case 'Person':
          if (item.givenName) {
            tlabel = `${item.givenName} ${item.familyName}`;
          } else {
            tlabel = `${item.name}`;
          }
          if (item.numeration) {
            tlabel += ` ${item.numeration}`
          }
          if (item.birthYear && item.deathYear) {
            tlabel += ` (${item.birthYear}-${item.deathYear})`;
          } else if (item.birthYear) {
            tlabel += ` (${item.birthYear}-)`;
          }
          return tlabel;
        default:
          if (item['@id'] && item['@id'].length > 40) {
            return `${item['@id'].substr(0, 37)}...`;
          }
          return item['@id'];
      }
    },
  },
};
</script>
