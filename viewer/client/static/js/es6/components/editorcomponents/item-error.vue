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
  <div class="erroneous-object"><code>{{itemAsJson}}</code></div>
</template>

<style lang="less">
@import '../shared/_variables.less';

.erroneous-object {
  line-height: 1.6;
  width: 100%;
  display: inline-block;
  padding: 3px;
  border: 1px solid #d9d9d9;
  code {
    color: #000;
    background-color: none;
  }
}

</style>
