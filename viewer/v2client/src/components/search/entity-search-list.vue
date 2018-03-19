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
      selectedIndex: 0,
      fieldListBottom: false,
    }
  },
  methods: {
    select(index) {
      this.selectedIndex = index;
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
    'select-next'() {
      console.log('next');
      if (this.active) {
        console.log('active');
        if (this.selectedIndex >= 0) {
          const fieldList = document.getElementsByClassName('js-field-list')[0];
          const threshold =
            fieldList.getBoundingClientRect().top +
            fieldList.getBoundingClientRect().height;
          
          const selectedElement = document.getElementsByClassName('selected')[0];
          const selectedPosition =
            selectedElement.getBoundingClientRect().top +
            selectedElement.getBoundingClientRect().height * 2;
          if (selectedPosition > threshold) {
            fieldList.scrollTop += selectedElement.getBoundingClientRect().height * 2;
          }
        } 
        this.selectedIndex += 1;
        console.log(this.selectedIndex);
      }
    },
    'select-prev'() {
      console.log('prev');
      if (this.active) {
        if (this.selectedIndex > 0) {
          this.selectedIndex -= 1;
          const fieldList = document.getElementsByClassName('js-field-list')[0];
          const threshold = fieldList.getBoundingClientRect().top;
          const selectedElement = document.getElementsByClassName('selected')[0];
          const selectedPosition =
            selectedElement.getBoundingClientRect().top -
            selectedElement.getBoundingClientRect().height;
          if (selectedPosition < threshold) {
            fieldList.scrollTop -= selectedElement.getBoundingClientRect().height * 2;
          }
        }
      }
    }
  },
  mounted: function () {
    this.active = true;
    this.$store.dispatch('setStatusValue', { 
      property: 'keybindState', 
      value: 'entity-search-list' 
    });
  }
};
</script>

<template>
  <div class="EntitySearchResult">
    <ul class="EntitySearchResult-list js-field-list" v-show="results.length > 0" >
      <entity-search-item tabindex="0"
        :class="{'selected': index == selectedIndex }" 
        @mouseover.native="select(index)"
        :focus-data="item" 
        :disabled-ids="disabledIds" 
        :add-link="false" 
        v-for="(item, index) in results" 
        :track-by="index"
        :key="index"></entity-search-item>
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
