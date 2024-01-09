<script>
import { cloneDeep } from 'lodash-es';
import ItemMixin from '../mixins/item-mixin.vue';

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
  methods: {
  },
  computed: {
    itemAsJson() {
      const cleanItem = cloneDeep(this.item);
      if (cleanItem.hasOwnProperty('_uid')) {
        delete cleanItem._uid;
      }
      return cleanItem;
    }
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
  beforeUnmount() {
    this.$store.dispatch('setValidation', { path: this.path, validates: true });
  },
};
</script>

<template>
  <div class="ItemError" :id="`formPath-${path}`">
    <table>
      <tr v-for="(value, key) in itemAsJson" :key="key">
        <td class="ItemError-key">{{ key }}</td><td class="ItemError-value">{{ value }}</td>
      </tr>
    </table>
  </div>
</template>

<style lang="less">

.ItemError {
  line-height: 1.6;
  width: 100%;
  display: inline-block;
  font-family: monospace;
  &-key {
    padding-right: 1em;
  }
  code {
    color: @black;
    background-color: transparent;
  }
  &.has-failed-validations {
    outline: 1px dotted red;
  }
}

</style>
