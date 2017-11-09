<script>
import * as _ from 'lodash';

export default {
  template: '{{label}}',
  props: {
    item: {},
  },
  vuex: {
    getters: {
      lang(state) {
        return state.settings.language;
      },
    },
  },
  methods: {
    formatId(id) {
      if (typeof id === 'undefined') {
        return '{no id}';
      }
      // Strip domain and protocol from label
      let label = id;
      if (label.indexOf('http://') > -1 || label.indexOf('https://') > -1) {
        label = label.split('//')[1];
        const labelArr = label.split('/');
        labelArr.splice(0, 1);
        label = labelArr.join('/');
      }
      return label;
    },
  },
  computed: {
    label() {
      const lang = this.lang;
      const item = this.item;
      let tlabel;
      if (item['@type']) {
        switch (item['@type']) {
          case 'TopicalTerm':
            tlabel = item.prefLabel;
            break;
          case 'Product':
            tlabel = item.edition;
            break;
          case 'Place':
          case 'Agent':
            tlabel = item.label;
            break;
          case 'ProviderEvent':
            tlabel = item.providerName;
            break;
          case 'Language':
            if (item.prefLabelByLang) {
              tlabel = item.prefLabelByLang[lang] || '';
            }
            break;
          case 'ConceptScheme':
          case 'Concept':
            tlabel = item.notation;
            break;
          case 'Organization':
            if (item.name) {
              tlabel = item.name;
            } else if (item.notation) {
              tlabel = item.notation;
            } else {
              tlabel = item['@id'];
            }
            break;
          case 'Aggregate':
          case 'UniformWork':
            tlabel = item.title;
            break;
          case 'PublicationVolume':
            tlabel = item.uniformTitle;
            break;
          case 'Person':
            if (item.givenName) {
              tlabel = `${item.givenName} ${item.familyName}`;
            } else {
              tlabel = `${item.name}`;
            }
            if (item.numeration) {
              tlabel += ` ${item.numeration}`;
            }
            if (item.birthYear && item.deathYear) {
              tlabel += ` (${item.birthYear}-${item.deathYear})`;
            } else if (item.birthYear) {
              tlabel += ` (${item.birthYear}-)`;
            }
            break;
        }
      }
      if (typeof tlabel === 'undefined' || tlabel.length === 0) {
        tlabel = this.formatId(item['@id']);
      }
      return tlabel;
    },
  },
};
</script>
