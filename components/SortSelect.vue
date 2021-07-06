<template>
  <div class="SortSelect">
    <select v-model="selectedSort">
      <option v-for="option in options" :key="option">{{ option }}</option>
    </select>
  </div>
</template>

<script>
export default {
  data() {
    return {
      selectedSort: 'relevans',
      options: [
        'relevans',
        'prefLabel',
      ]
    }
  },
  props: {
    pageData: {
      type: Object,
      default: null,
    },
  },
}
</script>

<style lang="scss">
.SortSelect {
  select {
    border: 0;
    background-color: transparent;
    font-weight: 500;
  }
}

</style>
