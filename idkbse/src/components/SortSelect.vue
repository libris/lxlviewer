<template>
  <div class="SortSelect">
    <select v-model="selectedSort">
      <option v-for="option in sortOptions" :key="option.value" :value="option.value">{{ translateUi(option.label) }}</option>
    </select>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  data() {
    return {
      selectedSort: '',
    }
  },
  props: {
    pageData: {
      type: Object,
      default: null,
    },
  },
  watch: {
    selectedSort(newVal, oldVal) {
      if (newVal !== oldVal) {
        this.$emit('change', this.selectedSort);
      }
    },
  },
  computed: {
    ...mapGetters(['settings']),
    sortOptions() {
      return [
        {value: '', label: 'Relevance' },
        {value: `_sortKeyByLang.${this.settings.language}`, label: 'A-Z' },
        {value: `-_sortKeyByLang.${this.settings.language}`, label: 'Z-A' },
      ];
    },
  },
  methods: {
  },
  mounted() {
    this.$nextTick(() => {
      this.selectedSort = this.$route.query['_sort'] || '';
    });
  },
}
</script>

<style lang="scss">
.SortSelect {
  select {
    border: 1px solid $gray-300;
    background-color: transparent;
    font-weight: 500;
    padding: 0.25em;
    border-radius: 4px;
  }
}

</style>
