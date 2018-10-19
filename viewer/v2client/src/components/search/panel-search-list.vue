<script>
import PanelSearchItem from './panel-search-item';
import { mapGetters } from 'vuex';

export default {
  name: 'panel-search-list',
  props: {
    results: {
      type: Array,
      default: () => [],
    },
    disabledIds: {
      type: Array,
      default: () => [],
    },
    icon: null,
    path: '',
    index: Number,
    isCompact: false,
    hasAction: false,
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
    useItem(item) {
      this.$emit('use-item', item);
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
  <div class="PanelSearchResult">
    <ul class="PanelSearchResult-list js-field-list" v-show="results.length > 0" >
      <panel-search-item
        v-for="(item, index) in results" 
        :is-replaced="isReplaced(item)"
        :focus-data="item" 
        :is-disabled="itemIsAdded(item)" 
        :add-link="false"
        :path="path"
        :key="index"
        :icon="icon"
        :is-compact="isCompact"
        :has-action="hasAction"
        @use-item="useItem(item)"
        ></panel-search-item>
    </ul>
  </div>
</template>

<style lang="less">

.PanelSearchResult {
  &-list {
    padding: 0px;
    margin-bottom: 0px;
  }
}
</style>
