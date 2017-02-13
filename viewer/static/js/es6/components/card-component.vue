<script>
import * as _ from 'lodash';
import LodashProxiesMixin from './mixins/lodash-proxies-mixin';
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
    item: {},
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
        <span class="title" v-if="uri">
          <a :href="uri" v-if="key!=='instanceOf'">{{ title }}</a>
          <a href="#" v-if="key==='instanceOf'" @click="changeStatus('level', 'work')"> {{title}} </a>
        </span>
        <span class="title" v-if="!uri">
          <span>{{ title }}</span>
        </span>
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
          <ul class="value" v-show="isObject(v)">
            <li class="card-data-value-row" v-for="(x,y) in v" track-by="$index">{{y}}</li>
          </ul>
        </li>
      </ul>
    </div>
  </div>
</template>

<style lang="less">

</style>
