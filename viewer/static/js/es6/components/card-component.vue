<script>
import * as _ from 'lodash';
import LodashProxiesMixin from './mixins/lodash-proxies-mixin';
import EntitySummary from './entity-summary';
import { changeStatus } from '../vuex/actions';

export default {
  name: 'card-component',
  mixins: [LodashProxiesMixin],
  vuex: {
    actions: {
      changeStatus,
    },
  },
  props: {
    focusData: {},
    key: '',
    title: {},
    shouldShow: false,
    uri: '',
    floating: false,
  },
  data() {
    return {
      keyword: '',
      active: false,
      toBeActive: false,
    };
  },
  methods: {
  },
  computed: {
    hasUri() {
      if (typeof this.uri !== 'undefined' && this.uri.length > 0) {
        return true;
      }
      return false;
    }
  },
  components: {
    'entity-summary': EntitySummary,
  },
  watch: {
    shouldShow(v) {
      if (v) {
        this.toBeActive = true;
        setTimeout(() => {
          if (this.toBeActive) {
            this.active = true;
          }
        }, 500);
      } else {
        this.toBeActive = false;
        this.active = false;
      }
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
  <div class="card-info-container" :class="{ 'active': active, 'to-be-active': toBeActive, 'floating': floating }">
    <entity-summary :focus-data="focusData" :render-link="hasUri" :lines="5"></entity-summary>
  </div>
</template>

<style lang="less">
  .card-info-container {
    width: 100%;
    &.floating {
      width: 600px;
      box-shadow: 0px 3px 5px 0px rgba(0, 0, 0, 0.3);
    }
    .entity-summary {
      border-width: 1px 1px 3px 1px;
    }
  }
</style>
