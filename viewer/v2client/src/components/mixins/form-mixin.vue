<script>
import * as DataUtil from '@/utils/data';
import * as VocabUtil from '@/utils/vocab';
import * as StringUtil from '@/utils/string';
import * as _ from 'lodash';
import { mapGetters } from 'vuex';

export default {
  props: {
  },
  data(){
    return {
    }
  },
  methods: {
  },
  events: {
  },
  computed: {
    ...mapGetters([
      'inspector',
      'resources',
      'user',
      'settings',
      'status',
    ]),
    allowedProperties() {
      const settings = this.settings;
      const formObj = this.formObj;
      const allowed = this.allowed;
      const language = this.user.settings.language;
      // Add the "added" property
      for (const element of allowed) {
        const oId = StringUtil.getCompactUri(element.item['@id'], this.resources.context);
        element.added = (formObj.hasOwnProperty(oId));
      }
      const extendedAllowed = allowed.map(property => {
        const labelByLang = property.item.labelByLang;
        const prefLabelByLang = property.item.prefLabelByLang;
        if (typeof labelByLang !== 'undefined') {
          // Try to get the label in the preferred language
          let label = (typeof labelByLang[language] !== 'undefined') ? labelByLang[language] : labelByLang.en;
          // If several labels are present, use the first one
          if (_.isArray(label)) {
            label = label[0];
          }
          return {
            added: property.added,
            item: property.item,
            label: label
          };
        } else if (typeof prefLabelByLang !== 'undefined') {
          // Try to get the label in the preferred language
          let label = (typeof prefLabelByLang[language] !== 'undefined') ? prefLabelByLang[language] : prefLabelByLang.en;
          // If several labels are present, use the first one
          if (_.isArray(label)) {
            label = label[0];
          }
          return {
            added: property.added,
            item: property.item,
            label: label
          };
        } else {
          // If no label, use @id as label
          return {
            added: property.added,
            item: property.item,
            label: property.item['@id']
          };
        }
      });
      const sortedAllowed = _.sortBy(extendedAllowed, (prop) => {
        return prop.label.toLowerCase();
      });
      return sortedAllowed;
    },
  },
  watch: {
  },
};
</script>
