<script>

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
    },
  },
  methods: {
    go(n) {
      this.$emit('go', n);
    },
  },
  computed: {
    pageRange() {
      const dotObj = { page: '...', disabled: true, active: false };
      const range = [];
      for (let i = 0; i < this.numberOfPages; i++) {
        range.push({ page: i, disabled: false, active: i === this.currentPage });
      }
      const filtered = range.filter(el => el.page <= this.currentPage + 3 && el.page >= this.currentPage - 3);
      if (filtered[0].page > 0) {
        filtered.unshift(dotObj);
      }
      if (filtered[filtered.length - 1].page < (this.numberOfPages - 1)) {
        filtered.push(dotObj);
      }
      return filtered;
    },
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
  <nav class="ModalPagination">
    <ul class="ModalPagination-list">
      <li class="ModalPagination-item" :class="{'is-disabled': currentPage-1 < 0 }">
        <a class="ModalPagination-link" 
          @keydown.enter="go(0)" 
          @click="go(0)" 
          :tabindex="currentPage-1 < 0 ? -1 : 0">
          {{'First' | translatePhrase}}
        </a>
      </li>
      <li class="ModalPagination-item" :class="{'is-disabled': currentPage-1 < 0 }">
        <a class="ModalPagination-link" 
          @keydown.enter="go(currentPage-1)" 
          @click="go(currentPage-1)" 
          :tabindex="currentPage-1 < 0 ? -1 : 0">
          <i class="fa fa-chevron-left"></i>
        </a>  
      </li>
      <li class="ModalPagination-item" v-for="(n, index) in pageRange" :key="index"  :class="{'is-active': n.active, 'is-disabled': n.disabled}">
        <a class="ModalPagination-link" 
          :class="{'dots' : n.page === '...' }"
          @keydown.enter="go(n.page)" 
          @click="go(n.page)" 
          :tabindex="n.page === '...' ? -1 : 0">
          {{n.page === '...' ? n.page : n.page + 1}}
        </a>
      </li>
      <li class="ModalPagination-item" :class="{'is-disabled': currentPage+1 > numberOfPages }">
        <a class="ModalPagination-link" 
          @keydown.enter="go(currentPage+1)" 
          @click="go(currentPage+1)" 
          :tabindex="currentPage+1 > numberOfPages ? -1 : 0">
          <i class="fa fa-chevron-right"></i>
        </a>
      </li>
      <li class="ModalPagination-item" :class="{'is-disabled': currentPage+1 > numberOfPages }">
        <a class="ModalPagination-link" 
          @keydown.enter="go(numberOfPages)" 
          @click="go(numberOfPages)" 
          :tabindex="currentPage+1 > numberOfPages ? -1 : 0">
          {{'Last' | translatePhrase}}
        </a>
      </li>
    </ul>
  </nav>
</template>

<style lang="less">

.ModalPagination {
  margin: 10px 0;

  &-list {
    display: flex;
    list-style-type: none;
    font-size: 14px;
    font-size: 1.4rem;
    margin: 0;
    padding: 0;
  }

  &-item {
  display: inline;
  line-height: 1;
  margin-right: 6px;
  position: relative;

    &.is-active::after {
      content: '';
      position: absolute;
      width: 100%;
      height: 3px;
      background-color: @brand-primary;
      bottom: -6px;
      left: 0;
    }
  }

  &-link {
    color: @grey-dark;
    font-weight: 600;
    position: relative;
    text-transform: uppercase;
    transition: color 0.2s ease;
    padding: 0 3px;

      &:hover, 
      &:active, 
      &:focus  {
      color: @brand-primary;
      text-decoration: none;
    }

    .is-disabled & {
      color: @gray-light;
      cursor: initial;

      &:hover, 
      &:active, 
      &:focus {
        color: @gray-light;
        text-decoration: none;
      }
    }

    i {
      font-size: 13px;
      padding: 0 2px;
    }

    .is-active & {
      color: @black;

      &:hover, 
      &:active, 
      &:focus  {
        color: @black;
        text-decoration: none;
      }
    }

    &.dots {
      padding-left: 0;
      padding-right: 0;
    }
  }
}
</style>
