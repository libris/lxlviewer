<script>

export default {
  name: 'sort',
  props: {
    recordType: { // Type to get sort options for (i.e 'Instance', 'Work' etc) 
      type: String,
      required: true,
    },
    currentSort: { // sortparam-value to set initial select option
      type: String,
    },
  },
  data() {
    return {
      boundVal: this.currentSort,
    };
  },
  computed: {
    newSort() {
      if (this.boundVal) {
        return this.boundVal;
      } return '';
    },
    options() {
      const sortOptions = this.$store.getters.settings.sortOptions[this.recordType];
      if (sortOptions) {
        return sortOptions;
      }
      return false;
    },
  },
  methods: {
  },
  mounted() {
  },
};
</script>

<template>
  <div class="Sort" v-if="options">
    <label class="Sort-label" for="sort-select">{{ 'Sorting' | translatePhrase }}:</label>
    <select id="sort-select"
      class="Sort-select customSelect" 
      v-model="boundVal" 
      @change="$emit('change', newSort)">
      <option 
        v-for="(option, index) in options" 
        :value="option.query"
        :key="index">
        {{ option.label | translatePhrase }}
      </option>
    </select>
  </div>
</template>

<style lang="less">
.Sort {
  display: flex;
  flex-wrap: nowrap;

  &-label {
    margin: 0 10px 10px 0;
    font-weight: 600;
  }
  &-select {
    text-align-last: start;
    margin-right: 10px;
  }
}
</style>
