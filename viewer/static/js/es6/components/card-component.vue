<script>
import * as _ from 'lodash';
import LodashProxiesMixin from './mixins/lodash-proxies-mixin';

export default {
  name: 'card-component',
  mixins: [LodashProxiesMixin],
  props: {
    item: {},
    title: {},
    shouldShow: false,
    uri: '',
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
  },
  components: {
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
  <div class="card-info-container" :class="{ 'active': active, 'to-be-active': toBeActive }">
    <div class="card" :class="{ 'locked': isLocked, 'work-state': isWork, 'instance-state': isInstance }">
      <div class="header">
        <span class="title"><a :href="uri">{{ title }}</a></span>
        <span class="type" v-if="item['@type']">{{ item['@type'] | labelByLang | capitalize }}</span>
        <span class="type" v-if="!item['@type']">[missing type]</span>
      </div>
      <ul class="card-data">
        <li v-for="(k,v) in item" v-show="k !== '@type'">
          <span class="key">{{ k | labelByLang | capitalize }}</span>
          <span class="value" v-show="!isObject(v)">{{v}}</span>
          <ul class="value" v-show="isObject(v)"><li class="card-data-value-row" v-for="(x,y) in v" track-by="$index">{{y}}</li></ul>
        </li>
      </ul>
    </div>
  </div>
</template>

<style lang="less">
@import './_variables.less';

.card-info-container {
  position: absolute;
  display: none;
  opacity: 0;
  max-height: 0px;
  overflow-y: hidden;
  transition: opacity 0.25s ease;
  z-index: @active-component-z;
  &.to-be-active {
    display: block;
  }
  &.active {
    opacity: 1;
    max-height: 500px;
  }
  .card {
    border: solid;
    background-color: white;
    width: 400px;
    overflow-x: hidden;
    margin-top: 2px; // To avoid clipping against parent container
    border-radius: 3px;
    border-width: 1px 1px 3px 1px;
    border-color: #b5b5b5;
    border-top-color: #ccc;
    position: relative;
    top: -2px;
    padding: 0px;
    box-shadow: 0px 11px 15px -10px rgba(0,0,0,0.3);
    .header {
      width: 100%;
      background-color: rgb(243, 243, 243);
      height: 2em;
      > * {
        padding: 3px 8px;
        display: inline-block;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .title {
        color: #4c4c4c;
        width: 60%;
        font-weight: 800;
      }
      .type {
        color: #757575;
        text-align: right;
        width: 39%;
        font-weight: 400;
      }
    }
    .card-data {
      list-style: none;
      padding: 0px;
      min-height: 70px;
      margin-bottom: 5px;
      overflow: hidden;
      > li {
        padding: 2px 7px;
        display: block;
        border: solid #efebeb;
        border-width: 0px 0px 1px 0px;
        span {
          word-break: break-word;
          display: inline-block;
        }
        .key {
          width: 35%;
          vertical-align: top;
          text-align: right;
          padding-right: 0.5em;
          color: #6b6b6b;
          font-size: 0.9em;
          line-height: 1.9;
        }
        .value {
          vertical-align: top;
          width: 64%;
          display: inline-block;
          padding: 0px;
          .card-data-value-row {
            display: block;
            word-break: break-all;
          }
        }
      }
    }
  }
}

</style>
