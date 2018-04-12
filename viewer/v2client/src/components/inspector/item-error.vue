<script>
import * as _ from 'lodash';

export default {
  name: 'item-error',
  props: {
    item: {},
  },
  data() {
    return {
      keyword: '',
    }
  },
  methods: {
  },
  computed: {
    itemAsJson() {
      const cleanItem = _.cloneDeep(this.item);
      if (cleanItem.hasOwnProperty('_uid')) {
        delete cleanItem['_uid'];
      }
      return JSON.stringify(cleanItem);
    },
  },
  components: {
  },
  watch: {
    keyword(value, oldval) {
      console.log("keyword changed", value, oldval);
    },
  },
  ready() { // Ready method is deprecated in 2.0, switch to "mounted"
    this.$nextTick(() => {
      // Do stuff
    });
  },
};
</script>

<template>
  <div class="ItemError">
    <code>{{itemAsJson}}</code>
  </div>
</template>

<style lang="less">

.ItemError {
  line-height: 1.6;
  width: 100%;
  display: inline-block;
  code {
    color: black;
    background-color: transparent;
  }
}

</style>
