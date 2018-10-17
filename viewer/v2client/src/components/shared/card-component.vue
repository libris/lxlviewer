<script>
import * as _ from 'lodash';
import LodashProxiesMixin from '../mixins/lodash-proxies-mixin';
import EntitySummary from './entity-summary';

export default {
  name: 'card-component',
  mixins: [LodashProxiesMixin],
  props: {
    focusData: {},
    fieldKey: '',
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
            this.toBeActive = false;
          }
        }, 200);
      } else {
        this.toBeActive = false;
        this.active = false;
      }
    },
  },
  mounted() { // Ready method is deprecated in 2.0, switch to "mounted"
    this.$nextTick(() => {
      // Do stuff
    });
  },
};
</script>

<template>
  <div class="Card" 
    :class="{ 'is-active': active, 'to-be-active': toBeActive, 'is-floating': floating }">
    <entity-summary 
      :focus-data="focusData" 
      :is-extractable="isExtractable" 
      :add-link="hasUri" 
      :actions="!floating && !isLocked" 
      :is-local="isLocal"></entity-summary>
  </div>
</template>

<style lang="less">

.Card {
  width: 100%;
  background-color: @white;
  display: none;
  top: 32px;
  left: 0px; // IE11 needs this
  position: absolute;
  transition: opacity 0.4s ease;

  &.to-be-active {
    pointer-events: none;
    display: block;
    opacity: 0;
    z-index: 2;
  }

  &.is-active {
    display: block;
    opacity: 1;
    z-index: 3;
  }

  &.is-floating {
    width: 600px;
    left: -20px;
    max-width: 80vw;
    border-radius: 0.5em;
    box-shadow: @shadow-panel;
    border: 1px solid @gray-lighter;
  }
}
</style>
