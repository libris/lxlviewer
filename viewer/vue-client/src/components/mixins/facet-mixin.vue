<script>
import { mapGetters } from 'vuex';
import * as MathUtil from '@/utils/math';
import * as VocabUtil from '@/utils/vocab';
import LensMixin from '@/components/mixins/lens-mixin';

export default {
  mixins: [LensMixin],
  props: {
  },
  data() {
    return {
    };
  },
  methods: {
    getByLang(object, property, lang) {
      const langDict = object[`${property}ByLang`];
      if (typeof langDict === 'object' && typeof langDict[lang] === 'string') {
        return langDict[lang];
      }
      return object[property];
    },
    getRecordType(object) {
      return VocabUtil.getRecordType(
        object['@type'],
        this.resources.vocab,
        this.resources.context,
      );
    },
    determineLabel(object) {
      if (object.hasOwnProperty('mainEntity')) {
        object = object.mainEntity;
      }
      const lang = this.user.settings.language;
      
      for (const prop of ['@id', '_key']) {
        if (object.hasOwnProperty(prop)) {
          const chains = this.settings.propertyChains;
          const id = object[prop];
          if (chains.hasOwnProperty(id)) {
            return chains[id][this.user.settings.language];
          }
        }
      }

      if (object.hasOwnProperty('propertyChainAxiom')) {
        return object.propertyChainAxiom
          .map(o => this.$options.filters.capitalize(this.determineLabel(o)))
          .join('/');
      } 
      
      // TODO: Add chip functionality instead?
      const label = this.getByLang(object, 'prefLabel', lang)
        || this.getByLang(object, 'label', lang)
        || this.getByLang(object, 'title', lang);

      if (label) {
        return label;
      }

      if (this.getRecordType(object) === 'Agent') {
        return this.getLabel(object);
      }
      
      const idArray = object['@id'].split('/');
      return `${idArray[idArray.length - 1]} [has no label]`;
    },
    getCompactNumber(observation) {
      return MathUtil.getCompactNumber(observation.totalItems);
    },
  },
  computed: {
    ...mapGetters([
      'resources',
    ]),
    user() {
      return this.$store.getters.user;
    },
    settings() {
      return this.$store.getters.settings;
    },
  },

};
</script>
