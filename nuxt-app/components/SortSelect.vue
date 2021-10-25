<template>
  <div class="SortSelect">
    <select v-model="selectedSort">
      <option v-for="option in options" :key="option.value" :value="option.value">{{ translateUi(option.label) }}</option>
    </select>
  </div>
</template>

<script>
export default {
  data() {
    return {
      selectedSort: '',
      options: [
        {value: '', label: 'Relevance' },
        {value: 'prefLabel', label: 'Preferred label (A-Z)' },
        {value: '-prefLabel', label: 'Preferred label (Z-A)' },
      ],
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
