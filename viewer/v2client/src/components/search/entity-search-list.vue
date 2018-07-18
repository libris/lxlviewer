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
    index: Number,
  },
  data() {
    return {
      keyword: '',
      active: false,
      selectedIndex: -1,
      fieldListBottom: false,
    }
  },
  methods: {
    addItem(item) {
      this.$emit('add-item', item);
    },
    select(index) {
      this.selectedIndex = index;
    },
    selectNext() {
      if (this.active) {
        if (this.selectedIndex >= 0) {
          const fieldList = document.getElementsByClassName('js-field-list')[0];
          const threshold =
            fieldList.getBoundingClientRect().top +
            fieldList.getBoundingClientRect().height;
          
          const selectedElement = document.getElementsByClassName('is-selected')[0];
          const selectedPosition =
            selectedElement.getBoundingClientRect().top +
            selectedElement.getBoundingClientRect().height * 2;
          if (selectedPosition > threshold) {
            fieldList.scrollTop += selectedElement.getBoundingClientRect().height * 2;
          }
        } 
        this.selectedIndex += 1;
      }
    },
    selectPrev() {
      if (this.active) {
        if (this.selectedIndex > 0) {
          this.selectedIndex -= 1;
          const fieldList = document.getElementsByClassName('js-field-list')[0];
          const threshold = fieldList.getBoundingClientRect().top;
          const selectedElement = document.getElementsByClassName('is-selected')[0];
          const selectedPosition =
            selectedElement.getBoundingClientRect().top -
            selectedElement.getBoundingClientRect().height;
          if (selectedPosition < threshold) {
            fieldList.scrollTop -= selectedElement.getBoundingClientRect().height * 2;
          }
        }
      }
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
    'entity-search-item': EntitySearchItem,
  },
  watch: {
    'status.keyActions'(value) {
      this.$emit(value[value.length-1]);
    }
  },
  events: {
  },
  mounted: function () {
    this.active = true;
    this.$store.dispatch('setStatusValue', { 
      property: 'keybindState', 
      value: 'entity-search-list' 
    });
    this.$on('select-next', () => this.selectNext());
    this.$on('select-prev', () => this.selectPrev());
  }
};
</script>

<template>
  <div class="EntitySearchResult">
    <ul class="EntitySearchResult-list js-field-list" v-show="results.length > 0" >
      <entity-search-item tabindex="0"
        v-for="(item, index) in results" 
        :class="{'is-selected': index == selectedIndex }" 
        @mouseover.native="select(index)"
        @focus.native="select(index)"
        :focus-data="item" 
        :disabled-ids="disabledIds" 
        :add-link="false"
        :path="path"
        :key="index"
        @add-item="addItem(item)"
        ></entity-search-item>
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
