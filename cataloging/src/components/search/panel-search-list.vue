<script>
import { mapGetters } from 'vuex';
import PanelSearchItem from '@/components/search/panel-search-item.vue';

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
    icon: {
      default: null,
    },
    text: {
      type: String,
      default: '',
    },
    path: {
      type: String,
      default: '',
    },
    index: Number,
    isCompact: {
      type: Boolean,
      default: false,
    },
    hasAction: {
      type: Boolean,
      default: false,
    },
    listItemSettings: {
      type: Object,
      default: () => {},
    },
  },
  emits: ['use-item'],
  data() {
    return {
      keyword: '',
      active: false,
    };
  },
  methods: {
    itemIsAdded(item) {
      return this.disabledIds.indexOf(item['@id']) > -1;
    },
    isBlocked(item) {
      const blocked = this.settings.blockedForAddition;
      for (const b in blocked) {
        if (item.hasOwnProperty(b)) {
          return blocked[b] === '' || blocked[b] === item[b]['@id'];
        }
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
  mounted() {
    this.active = true;
  },
};
</script>

<template>
  <div class="PanelSearchResult">
    <ul class="PanelSearchResult-list js-field-list" v-show="results.length > 0">
      <panel-search-item
        v-for="(item, index) in results"
        :is-blocked="isBlocked(item)"
        :focus-data="item"
        :is-disabled="itemIsAdded(item)"
        :add-link="false"
        :path="path"
        :key="index"
        :icon="icon"
        :list-item-settings="listItemSettings"
        :text="text"
        :is-compact="isCompact"
        :has-action="hasAction"
        @use-item="useItem(item)"
      />
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
