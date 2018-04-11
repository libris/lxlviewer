<script>
import * as DataUtil from '@/utils/data';
import * as VocabUtil from '@/utils/vocab';
import * as _ from 'lodash';
import { mapGetters } from 'vuex';

export default {
  props: {
    parentPath: '',
  },
  data(){
    return {
      removed: false,
    }
  },
  methods: {
    removeThis(animate = false) {
      const parentValue = _.cloneDeep(_.get(this.inspector.data, this.parentPath));
      parentValue.splice(this.index, 1);
      if (animate) {
        this.$store.dispatch('setInspectorStatusValue', { property: 'removing', value: true });
        this.removed = true;
        setTimeout(() => {
          this.$store.dispatch('updateInspectorData', {
            path: `${this.parentPath}`,
            value: parentValue,
            addToHistory: true,
          });
        }, 500);
      } else {
        this.$store.dispatch('updateInspectorData', {
          path: `${this.parentPath}`,
          value: parentValue,
          addToHistory: true,
        });
      }
    },
  },
  events: {
    'remove-entity'(){
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
      const parentValue = _.get(this.inspector.data, this.parentPath);
      if (_.isArray(parentValue)) {
        return `${this.parentPath}[${this.index}]`;
      } else {
        return this.parentPath;
      }
    },
    recordType() {
      return VocabUtil.getRecordType(this.item['@type'], this.vocab, this.settings);
    },
    focusData() {
      if (!this.item['@id']) {
        return this.item;
      }
      if (_.isArray(this.item) || !_.isObject(this.item)) {
        throw new Error('Item is not an object.');
      }
      return DataUtil.getLinked(
        this.item['@id'],
        this.editorData.quoted
      );
    },
  },
  watch: {
    'status.removing': {
      handler: function(newValue) {
        if (!newValue) {
          this.removed = false;
        }
      },
    },
  },
};
</script>
