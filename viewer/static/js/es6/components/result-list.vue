<script>
import ResultListItem from './result-list-item';

export default {
  name: 'result-list',
  props: {
    results: [],
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
    'result-list-item': ResultListItem,
  },
  watch: {
  },
  ready() { // Ready method is deprecated in 2.0, switch to "mounted"
  },
};
</script>

<template>
  <div class="result">
    <ul class="result-list" v-show="results.length > 0">
      <result-list-item :focus-data="item" v-for="item in results" track-by="$index"></result-list-item>
    </ul>
  </div>
</template>

<style lang="less">
@import './_variables.less';

.result {
  .result-list {
    width: 100%;
    padding: 0px;
    list-style-type: none;
  }
}

</style>
