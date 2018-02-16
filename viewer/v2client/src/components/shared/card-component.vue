<script>
import * as _ from 'lodash';
import LodashProxiesMixin from '../mixins/lodash-proxies-mixin';
import EntitySummary from './entity-summary';
import { changeStatus } from '../../vuex/actions';

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
    isLocked: false,
    isLocal: false,
    isExtractable: false,
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
    <entity-summary :focus-data="focusData" :is-extractable="isExtractable" :add-link="hasUri" :lines="5" :actions="!floating && !isLocked" :is-local="isLocal"></entity-summary>
  </div>
</template>

<style lang="less">

  .card-info-container {
    width: 100%;
    background-color: @white;
    .card-mixin(@brand-primary, @white);
    &.floating {
      width: 600px;
      margin: 0 0 0 2.1em;
      border-radius: 0.5em;
      box-shadow: @shadow-card-elevated;
    }
  }
</style>
