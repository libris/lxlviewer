<script>
import * as DataUtil from '@/utils/data';
import * as VocabUtil from '@/utils/vocab';
import { cloneDeep, isArray, get, isObject } from 'lodash-es';
import { mapGetters } from 'vuex';

export default {
  props: {
    parentPath: {
      type: String,
      default: '',
    },
    fieldKey: {
      type: String,
      default: '',
    },
    isCompositional: {
      type: Boolean,
      default: false,
    },
    index: Number,
  },
  data() {
    return {
      removed: false,
    };
  },
  methods: {
    removeThis(animate = false) {
      let parentValue = cloneDeep(get(this.inspector.data, this.parentPath));
      if (isArray(parentValue)) {
        parentValue.splice(this.index, 1);
      } else {
        parentValue = null;
      }
      if (animate) {
        this.$store.dispatch('setInspectorStatusValue', { property: 'removing', value: true });
        this.removed = true;
        setTimeout(() => {
          this.$store.dispatch('updateInspectorData', {
            changeList: [
              {
                path: `${this.parentPath}`,
                value: parentValue,
              },
            ],
            addToHistory: true,
          });
        }, 500);
      } else {
        this.$store.dispatch('updateInspectorData', {
          changeList: [
            {
              path: `${this.parentPath}`,
              value: parentValue,
            },
          ],
          addToHistory: true,
        });
      }
    },
  },
  events: {
    'remove-entity'() {
      this.removeThis();
    },
  },
  computed: {
    ...mapGetters([
      'inspector',
      'resources',
      'user',
      'settings',
      'status',
    ]),
    path() {
      const parentValue = get(this.inspector.data, this.parentPath);
      if (isArray(parentValue)) {
        return `${this.parentPath}[${this.index}]`;
      }
      return `${this.parentPath}`;
    },
    // recordType() {
    //   return VocabUtil.getRecordType(this.item['@type'], this.resources.vocab, this.settings);
    // },
    isEmbedded() {
      return VocabUtil.isEmbedded(this.item['@type'], this.resources.vocab, this.settings, this.resources.context);
    },
    focusData() {
      if (!this.item['@id']) {
        return this.item;
      }
      if (isArray(this.item) || !isObject(this.item)) {
        throw new Error('Item is not an object.');
      }
      // If items have more than one key, consider them already embellished
      if (Object.keys(this.item).length > 1) {
        return this.item;
      }
      return DataUtil.getEmbellished(
        this.item['@id'],
        this.inspector.data.quoted,
      );
    },
  },
  watch: {
    'status.removing': {
      handler(newValue) {
        if (!newValue) {
          this.removed = false;
        }
      },
    },
  },
};
</script>
