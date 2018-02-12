<script>
import EntitySearchItem from './entity-search-item';
import { changeStatus } from '../../vuex/actions';
import { getSettings, getVocabulary, getContext } from '../../vuex/getters';

export default {
  name: 'entity-search-list',
  props: {
    results: [],
    disabledIds: [],
    index: Number,
    active: false
  },
  data() {
    return {
      keyword: '',
      selectedIndex: -1
    }
  },
  vuex: {
    actions: {
      changeStatus,
    },
  },
  events: {
     'select-next'() {
      if (this.active) {
        console.log('active');
        if (this.selectedIndex >= 0) {
          const fieldList = document.getElementsByClassName('field-list')[0];
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
      if (this.active) {
        if (this.selectedIndex > 0) {
          this.selectedIndex -= 1;
          const fieldList = document.getElementsByClassName('field-list')[0];
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
    },
  },
  methods: {
    loadStatus() {
      this.active = true;
      this.changeStatus('keybindState', 'entity-search-list');
    }
  },
  computed: {
  },
  components: {
    'entity-search-item': EntitySearchItem,
  },
  watch: {
  },
  ready() { // Ready method is deprecated in 2.0, switch to "mounted"
    this.loadStatus();
  },
};
</script>

<template>
  <div class="search-result">
    <ul class="search-result-list field-list" v-show="results.length > 0">
      <entity-search-item :tabindex="0" :class="{'already-added': (disabledIds.indexOf(item['@id']) !== -1) }" :focus-data="item" :disabled-ids="disabledIds" :add-link="false" v-for="item in results" track-by="$index"></entity-search-item>
    </ul>
  </div>
</template>

<style lang="less">
@import '../shared/_variables.less';

.search-result {
  .search-result-list {
    width: 100%;
    padding: 0px;
    list-style-type: none;
    border: solid #ccc;
    border-width: 1px 0px 0px 0px;
  }
}

</style>
