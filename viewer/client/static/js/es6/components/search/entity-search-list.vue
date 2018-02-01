<script>
import EntitySearchItem from './entity-search-item';

export default {
  name: 'entity-search-list',
  props: {
    results: [],
    disabledIds: [],
  },
  data() {
    return {
      keyword: '',
    }
  },
  methods: {
  },
  computed: {
  },
  components: {
    'entity-search-item': EntitySearchItem,
  },
  watch: {
  },
  ready() { // Ready method is deprecated in 2.0, switch to "mounted"
  },
};
</script>

<template>
  <div class="search-result">
    <ul class="search-result-list" v-show="results.length > 0">
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
