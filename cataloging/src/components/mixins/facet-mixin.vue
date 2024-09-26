<script>
import { mapGetters } from 'vuex';
import * as DisplayUtil from 'lxljs/display';
import * as VocabUtil from 'lxljs/vocab';
import * as MathUtil from '@/utils/math';
import { capitalize } from '@/utils/filters';
import LensMixin from '@/components/mixins/lens-mixin.vue';

export default {
  mixins: [LensMixin],
  props: {
  },
  data() {
    return {
    };
  },
  methods: {
    capitalize,
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
    getCompactNumber(observation) {
      return MathUtil.getCompactNumber(observation.totalItems);
    },
    determineLabel(object) {
      if (object.hasOwnProperty('mainEntity')) {
        object = object.mainEntity;
      }

      for (const prop of ['@id', '_key']) {
        if (object.hasOwnProperty(prop)) {
          const chains = this.settings.propertyChains;
          const id = object[prop];
          if (chains.hasOwnProperty(id)) {
            return chains[id][this.user.settings.language];
          }
          if (chains.hasOwnProperty(`${id}.@id`)) {
            return chains[`${id}.@id`][this.user.settings.language];
          }
        }
      }

      if (object.hasOwnProperty('propertyChainAxiom')) {
        return object.propertyChainAxiom
          .map((o) => capitalize(this.determineLabel(o)))
          .join('/');
      }

      const label = DisplayUtil.getItemLabel(
        object,
        this.resources,
        this.inspector.data.quoted,
        this.settings,
        object['@type'],
      );

      if (label) {
        return label;
      }
      if (this.getRecordType(object) === 'Agent') {
        return this.getLabel(object);
      }

      const idArray = object['@id'].split('/');
      return `${idArray[idArray.length - 1]} [has no label]`;
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
    changeCollections() {
      return this.$store.getters.userChangeCollections;
    },
  },

};
</script>
