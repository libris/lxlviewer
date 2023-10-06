<script>
import { mapActions, mapState } from 'pinia';
import { useUserStore } from '@/stores/user';
import { cloneDeep } from 'lodash-es';
import ItemMixin from '../mixins/item-mixin.vue';
import { useInspectorStore } from '@/stores/inspector';

export default {
  name: 'item-error',
  mixins: [ItemMixin],
  props: {
    item: {},
    isLocked: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      keyword: '',
    };
  },
  computed: {
    ...mapState(useUserStore, ['user']),
    itemAsJson() {
      const cleanItem = cloneDeep(this.item);
      if (cleanItem.hasOwnProperty('_uid')) {
        delete cleanItem._uid;
      }
      return cleanItem;
    },
    failedValidations() {
      const failedValidations = [];
      if (this.user.settings.appTech === false) {
        return failedValidations;
      }
      failedValidations.push({
        text: 'The entity is missing crucial data',
      });

      this.setValidation({ path: this.path, validates: false, reasons: failedValidations });
      return failedValidations;
    },
  },
  methods: {
    ...mapActions(useInspectorStore, ['setValidation']),
  },
  watch: {
    keyword(value, oldval) {
      console.log('keyword changed', value, oldval);
    },
  },
  beforeUnmount() {
   this.setValidation({ path: this.path, validates: true });
  },
};
</script>

<template>
  <div class="ItemError" :id="`formPath-${path}`" :class="{ 'has-failed-validations': failedValidations.length > 0 }">
    <table>
      <tr v-for="(value, key) in itemAsJson" :key="key">
        <td class="ItemError-key">{{ key }}</td><td class="ItemError-value">{{ value }}</td>
      </tr>
    </table>
  </div>
</template>

<style lang="scss">

.ItemError {
  line-height: 1.6;
  width: 100%;
  display: inline-block;
  font-family: monospace;
  &-key {
    padding-right: 1em;
  }
  code {
    color: $black;
    background-color: transparent;
  }
  &.has-failed-validations {
    outline: 1px dotted red;
  }
}

</style>
