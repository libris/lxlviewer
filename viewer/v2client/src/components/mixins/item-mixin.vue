<script>
import * as DataUtil from '@/utils/data';
import * as VocabUtil from '@/utils/vocab';
import * as _ from 'lodash';
import { getStatus, getVocabulary, getSettings } from '../../vuex/getters';
import { changeStatus } from '../../vuex/actions';

export default {
  vuex: {
    actions: {
      changeStatus,
    },
    getters: {
      status: getStatus,
      vocab: getVocabulary,
      settings: getSettings,
    },
  },
  data(){
    return {
      removed: false,
    }
  },
  methods: {
    removeThis(animate = false) {
      if (animate) {
        this.changeStatus('removing', true);
        this.removed = true;
        setTimeout(() => {
          this.$dispatch('remove-item', this.index);
        }, 500);
      } else {
        this.$dispatch('remove-item', this.index);
      }
    },
  },
  events: {
    'remove-entity'(){
      this.removeThis();
    },
  },
  computed: {
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
