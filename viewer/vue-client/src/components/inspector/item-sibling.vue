<script>
/*
  This component is used for the special case for when we want to show a sibling (ie a work in an instance)
  as an item-local in mainEntity. Most of the functionality is similar to those in item-local, but with some
  important differences. Examples of this is the path-variables as they are pointing to one place for what data to show,
  and to another for what data to edit.
*/
import { cloneDeep } from 'lodash-es';
import * as StringUtil from '@/utils/string';
import ItemLocal from '@/components/inspector/item-local';

export default {  
  name: 'item-sibling',
  extends: ItemLocal,
  props: {
    id: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
    };
  },
  computed: {
    focusData() {
      const item = cloneDeep(this.inspector.data[this.suffix]);
      if (typeof item === 'undefined' || item === null) {
        this.$store.dispatch('pushNotification', {
          type: 'danger',
          message: `${StringUtil.getUiPhraseByLang('Data is missing a reference, please verify file', this.settings.language)}`,
        });
        throw new Error('A sibling-item was undefined. This is probably a reference error in the data.');
      }
      return item;
    },
    suffix() {
      return this.id.split('#')[1];
    },
    isSibling() {
      return true;
    },
    getPath() {
      return this.suffix;
    },
  },
  methods: {
    removeThis() {
      const changeList = [
        {
          path: `${this.parentPath}`,
          value: null,
        },
      ];
      if (this.fieldKey === 'instanceOf') {
        changeList.push({
          path: 'work',
          value: null,
        });
      }
      this.$store.dispatch('updateInspectorData', {
        addToHistory: true,
        changeList: changeList,
      });
    },
    replaceWith(value) {
      const newValue = { '@id': value['@id'] };
      this.$store.dispatch('addToQuoted', value);
      const changeList = [
        {
          // Remove the link
          path: `${this.parentPath}`,
          value: newValue,
        },
        {
          // Remove the #work
          path: `${this.getPath}`,
          value: null,
        },
      ];
      this.$store.dispatch('updateInspectorData', {
        addToHistory: true,
        changeList: changeList,
      });
      this.$store.dispatch('pushNotification', { type: 'success', message: `${StringUtil.getUiPhraseByLang('Linking was successful', this.settings.language)}` });
      this.$store.dispatch('setInspectorStatusValue', { 
        property: 'lastAdded', 
        value: `${this.parentPath}.{"@id":"${newValue['@id']}"}`,
      });
      this.closeExtractDialog();
    },
  },
  watch: {
  },
  mounted() {
  },

  components: {
  },
};
</script>

<style lang="less">


</style>
