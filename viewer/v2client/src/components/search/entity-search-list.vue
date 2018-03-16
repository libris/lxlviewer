<script>
import EntitySearchItem from './entity-search-item';
import { mapGetters } from 'vuex';

export default {
  name: 'entity-search-list',
  props: {
    results: {
      type: Array,
      default: () => [],
    },
    disabledIds: {
      type: Array,
      default: () => [],
    },
    path: '',
  },
  data() {
    return {
      keyword: '',
      active: false,
    }
  },
  methods: {
    loadStatus() {
      this.active = true;
      this.$store.dispatch('setStatusValue', { 
        property: 'keybindState', 
        value: 'entity-search-list' 
      });
    },
    test() {
      console.log('hello');
    }
  },
  computed: {
    ...mapGetters([
      'inspector',
      'resources',
      'user',
      'settings',
      'status',
    ]),
  },
  components: {
    'entity-search-item': EntitySearchItem,
  },
  watch: {
  },
  events: {
  },
  mounted: function () {
    this.$nextTick(function () {
      this.loadStatus();
    });
  },
  ready() { // Ready method is deprecated in 2.0, switch to "mounted"
  },
};
</script>

<template>
  <div class="EntitySearchResult">
    <ul class="EntitySearchResult-list" v-show="results.length > 0" >
      <entity-search-item
        :focus-data="item" 
        :disabled-ids="disabledIds" 
        :add-link="false" 
        v-for="(item, index) in results" 
        :key='index'></entity-search-item>
    </ul>
  </div>
</template>

<style lang="less">

.EntitySearchResult {
  &-list {
    width: 100%;
    padding: 0px;
    list-style-type: none;
    border: solid #ccc;
    border-width: 1px 0px 0px 0px;   
  }
}
</style>
