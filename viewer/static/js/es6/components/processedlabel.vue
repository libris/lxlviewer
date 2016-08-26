<script>
import * as _ from 'lodash';

export default {
  template: '{{label}}',
  props: {
    item: {},
  },
  computed: {
    label() {
      const lang = this.$root.lang;
      const item = this.item;
      if (!_.isPlainObject(item)) {
        return item;
      }
      let tlabel = '';
      switch (item['@type']) {
        case 'TopicalTerm':
          tlabel = item.prefLabel;
        case 'Product':
          tlabel = item.edition;
        case 'Place':
        case 'Agent':
          tlabel = item.label;
        case 'ProviderEvent':
          tlabel = item.providerName;
        case 'Language':
          if (item.prefLabelByLang) {
            tlabel = item.prefLabelByLang[lang] || '';
          }
        case 'ConceptScheme':
        case 'Concept':
          tlabel = item.notation;
        case 'Organization':
          if (item.name) {
            tlabel = item.name;
          } else if (item.notation) {
            tlabel = item.notation
          } else {
            tlabel = item['@id'];
          }
        case 'Aggregate':
          tlabel = item.title;
        case 'PublicationVolume':
          tlabel = item.uniformTitle;
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
        default:
          tlabel = item['@id'];
      }
      if (!tlabel || tlabel.length === 0) {
        tlabel = item['@id'];
      }
      if (tlabel.indexOf('//') > 0) {
        tlabel = tlabel.split('//')[1];
        const labelArr = tlabel.split('/');
        labelArr.splice(0,1);
        tlabel = labelArr.join('/');
      }
      return tlabel;
    },
  },
};
</script>
