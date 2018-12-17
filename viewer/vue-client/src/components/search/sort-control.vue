<script>

export default {
  name: 'result-controls',
  props: {
    options: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      selected: '',
    };
  },
  computed: {
    query() {
      if (this.selected) {
        return `_sort=${this.selected}`;
      } return '';
    },
  },
  methods: {
  },
  mounted() {
  },
};
</script>

<template>
  <div class="SortControl">
    <select class="customSelect" 
      v-model="selected" 
      @change="$emit('change', query)">
      <option 
        v-for="(option, index) in options" 
        :value="option.query"
        :key="index"
        :selected="option.default">
        {{option.text}}
      </option>
    </select>
  </div>
</template>

<style lang="less">


</style>
