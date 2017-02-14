<script>
import EntitySearchItem from './entity-search-item';

export default {
  name: 'entity-search-list',
  props: {
    results: [],
  },
  data() {
    return {
      keyword: '',
    }
  },
  methods: {
    addLinked(item) {
      this.$dispatch('add-entity', item);
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
  },
};
</script>

<template>
  <div class="search-result">
    <ul class="search-result-list" v-show="results.length > 0">
      <entity-search-item :focus-data="item" v-for="item in results" track-by="$index" v-on:click="addLinked(item)"></entity-search-item>
    </ul>
  </div>
</template>
