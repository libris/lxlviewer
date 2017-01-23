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
  <div class="card-info-container" :class="{ 'active': active, 'to-be-active': toBeActive, 'floating': floating }">
    <div class="card" :class="{ 'locked': isLocked, 'anonymous': !uri }">
      <div class="header">
        <span class="title"><a :href="uri">{{ title }}</a></span>
        <span class="type" v-if="item['@type']">
          <a href="/vocab/#{{item['@type']}}">
          {{ item['@type'] | labelByLang | capitalize }}
          </a>
        </span>
        <span class="type" v-if="!item['@type']">[missing type]</span>
      </div>
      <ul class="card-data">
        <li v-for="(k,v) in item" v-show="k !== '@type'">
          <span class="key">
            <a href="/vocab/#{{k}}">
            {{ k | labelByLang | capitalize }}
            </a>
          </span>
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
  overflow-y: hidden;
  &.floating {
    z-index: @active-component-z;
    transition: opacity 0.25s ease;
    max-height: 0px;
    opacity: 0;
    position: absolute;
    display: none;
    .card {
      box-shadow: 0px 11px 15px -10px rgba(0,0,0,0.3);
      width: 400px;
      &.anonymous .header {
        background-color: rgb(243, 243, 243);
        border-color: #b3b3b3;
        border-bottom-color: #e0e0e0;
        .title, .title a {
          color: #4c4c4c;
        }
        .type {
          color: #757575;
          a {
            color: #757575;
          }
        }
      }
      .card-data {
        > li {
          .key {
            width: 35%;
          }
          .value {
            width: 64%;
          }
        }
      }
    }
  }
  &.to-be-active {
    display: block;
  }
  &.active {
    opacity: 1;
    max-height: 500px;
  }
  .card {
    border: 0;
    overflow-x: hidden;
    width: @col-value;
    margin-top: 2px; // To avoid clipping against parent container
    position: relative;
    top: -2px;
    padding: 0px;
    .header {
      border: solid;
      border-radius: 3px 3px 0px 0px;
      border-width: 1px;
      border-color: @brand-primary;
      width: 100%;
      background-color: @brand-primary;
      height: 2em;
      > * {
        padding: 3px 8px;
        display: inline-block;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .title, .title a {
        color: @white;
        width: 60%;
        font-weight: 800;
      }
      .type {
        color: @white;
        text-align: right;
        width: 39%;
        font-weight: 400;
        a {
          color: @white;
          cursor: help;
          text-decoration: none;
        }
      }
    }
    .card-data {
      border: solid;
      border-radius: 0px 0px 3px 3px;
      border-width: 0px 1px 3px 1px;
      border-color: #b3b3b3;
      background-color: @white;
      list-style: none;
      padding: 0px;
      min-height: 70px;
      padding-bottom: 5px;
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
          width: 22%;
          vertical-align: top;
          text-align: right;
          padding-right: 0.5em;
          color: #6b6b6b;
          font-size: 0.9em;
          line-height: 1.9;
          a {
            color: #6b6b6b;
            cursor: help;
            text-decoration: none;
          }
        }
        .value {
          vertical-align: top;
          width: 77%;
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
