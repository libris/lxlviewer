<script>
import * as StringUtil from '@/utils/string';

export default {
  name: 'modal-pagination',
  props: {
    numberOfPages: {
      default: 10,
      type: Number,
    },
    currentPage: {
      default: 5,
      type: Number,
    }
  },
  methods: {
    go(n) {
      this.$emit('go', n);
    },
  },
  computed: {
  },
  components: {
  },
  watch: {
  },
  mounted() { // Ready method is deprecated in 2.0, switch to "mounted"
    this.$nextTick(() => {
      
    });
  },
};
</script>

<template>
  <div class="ModalPagination">
    <ul>
      <li @click="go(currentPage-1)" :class="{'disabled': currentPage-1 < 0 }">{{'Previous' | translatePhrase}}</li>
      <li @click="go(n-1)" :key="n" v-for="(n, index) in numberOfPages+1" :class="{'active': index === currentPage}">{{n}}</li>
      <li @click="go(currentPage+1)" :class="{'disabled': currentPage+1 > numberOfPages }">{{'Next' | translatePhrase}}</li>
    </ul>
  </div>
</template>

<style lang="less">

.ModalPagination {
  padding: 0.5em;
  width: 100%;
  text-align: center;
  font-size: 10pt;
  ul {
    list-style-type: none;
    margin: 0px;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    li {
      margin: 0px;
      border: 1px solid @brand-primary;
      padding: 0px 5px;
      display: inline-block;
      cursor: pointer;
      &.active {
        background-color: @brand-primary;
        cursor: default;
        color: white;
      }
      &.disabled {
        opacity: 0.5;
        cursor: default;
        visibility: visible;
      }
    }
  }
}
</style>
