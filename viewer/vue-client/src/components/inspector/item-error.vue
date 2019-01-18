<script>
import { cloneDeep } from 'lodash-es';
import ItemMixin from '../mixins/item-mixin';

export default {
  name: 'item-error',
  mixins: [ItemMixin],
  props: {
    item: {},
  },
  data() {
    return {
      keyword: '',
    };
  },
  methods: {
  },
  computed: {
    itemAsJson() {
      const cleanItem = cloneDeep(this.item);
      if (cleanItem.hasOwnProperty('_uid')) {
        delete cleanItem._uid;
      }
      return JSON.stringify(cleanItem);
    },
    failedValidations() {
      const failedValidations = [];
      if (this.user.settings.appTech === false) {
        return failedValidations;
      }
      failedValidations.push({
        text: 'The entity is missing crucial data',
      });

      this.$store.dispatch('setValidation', { path: this.path, validates: false, reasons: failedValidations });
      return failedValidations;
    },
  },
  components: {
  },
  watch: {
    keyword(value, oldval) {
      console.log('keyword changed', value, oldval);
    },
  },
  mounted() {
    this.$nextTick(() => {
    });
  },
  beforeDestroy() {
    this.$store.dispatch('setValidation', { path: this.path, validates: true });
  },
};
</script>

<template>
  <div class="ItemError" :id="`formPath-${path}`" :class="{ 'has-failed-validations': failedValidations.length > 0 }">
    <code>{{itemAsJson}}</code>
  </div>
</template>

<style lang="less">

.ItemError {
  line-height: 1.6;
  width: 100%;
  display: inline-block;
  code {
    color: @black;
    background-color: transparent;
  }

  &.has-failed-validations {
    outline: 1px dotted red;
  }
}

</style>
