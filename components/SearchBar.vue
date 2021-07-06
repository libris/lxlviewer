<template>
  <div class="SearchBar">
    <div class="container-fluid">
      <div class="row">
        <div class="col-8 col-md-4">
          <i class="bi-search SearchInput-icon"></i><input type="text" v-model="keyword" id="search" @keyup.enter="submit()" class="form-control SearchInput-input">
        </div>
        <div class="col-4 col-md-2">
          <button type="button" @keyup.enter="submit()" @click="submit()" class="btn btn-kb-secondary-turquoise">sök</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      keyword: '',
    }
  },
  methods: {
    submit() {
      if (this.keyword.length === 0) return;
      this.$router.push({
        name: 'find',
        query: Object.assign({}, this.query),
      });
    },
  },
  computed: {
    query() {
      const queryObj = {
        'q': this.keyword,
      }
      return queryObj;
    },
  },
  props: {
  },
}
</script>

<style lang="scss">
  .SearchBar {
    background-color: $gray-100;
    padding: 1em 0;
    border: solid $gray-200;
    border-width: 0px 0px 1px 0px;
  }
  .SearchInput {
    &-icon {
      position: absolute;
      margin-top: 0.6rem;
      margin-left: 1rem;
      font-size: 125%;
    }
    &-input {
      padding-left: 3em !important;
    }
  }

</style>
