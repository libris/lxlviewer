<script>
import PanelSearchItem from './panel-search-item';
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
    index: Number,
  },
  data() {
    return {
      keyword: '',
      active: false,
    }
  },
  methods: {
    itemIsAdded(item) {
      return this.disabledIds.indexOf(item['@id']) > -1;
    },
    isReplaced(item) {
      if ('isReplacedBy' in item) {
        return true;
      } 

      return false;
    },
    addItem(item) {
      this.$emit('add-item', item);
    },
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
    'panel-search-item': PanelSearchItem,
  },
  watch: {
  },
  events: {
  },
  mounted: function () {
    this.active = true;
  }
};
</script>

<template>
  <div class="EntitySearchResult">
    <ul class="EntitySearchResult-list js-field-list" v-show="results.length > 0" >
      <panel-search-item
        v-for="(item, index) in results" 
        :is-replaced="isReplaced(item)"
        :focus-data="item" 
        :is-disabled="itemIsAdded(item)" 
        :add-link="false"
        :path="path"
        :key="index"
        @add-item="addItem(item)"
        ></panel-search-item>
    </ul>
  </div>
</template>

<style lang="less">

.EntitySearchResult {
  &-list {
    padding: 0px;
  }
}
</style>
