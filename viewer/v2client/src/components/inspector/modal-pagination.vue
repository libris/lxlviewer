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
    pageRange() {
      let dotObj = {page: '...', disabled: true, active: false};
      let range = [];
      for (let i = 0; i <= this.numberOfPages; i++) {
        range.push({page: i, disabled: false, active: i === this.currentPage});
      }
      let filtered = range.filter((el) => {
        return el.page <= this.currentPage + 3 && el.page >= this.currentPage - 3;
      })
      if (filtered[0].page > 0) {
        filtered.unshift(dotObj);
      }
      if (filtered[filtered.length -1].page < this.numberOfPages) {
        filtered.push(dotObj);
      }
      return filtered;
    }
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
        <a class="ModalPagination-link" @click="go(0)">{{'First' | translatePhrase}}</a>
      </li>
      <li class="ModalPagination-item" :class="{'is-disabled': currentPage-1 < 0 }">
        <a class="ModalPagination-link" @click="go(currentPage-1)">
          <i class="fa fa-chevron-left"></i>
        </a>  
      </li>
      <li class="ModalPagination-item" :key="n" v-for="n in pageRange" :class="{'is-active': n.active, 'is-disabled': n.disabled}">
        <a class="ModalPagination-link" @click="go(n.page)">{{n.page === '...' ? n.page : n.page + 1}}</a>
      </li>
      <li class="ModalPagination-item" :class="{'is-disabled': currentPage+1 > numberOfPages }">
         <a class="ModalPagination-link" @click="go(currentPage+1)">
           <i class="fa fa-chevron-right"></i>
         </a>
      </li>
      <li class="ModalPagination-item" :class="{'is-disabled': currentPage+1 > numberOfPages }">
        <a class="ModalPagination-link" @click="go(numberOfPages)">{{'Last' | translatePhrase}}</a>
      </li>
    </ul>
  </nav>
</template>

<style lang="less">

.ModalPagination {
  margin: 0 0 20px 0;

  &-list {
    display: flex;
    list-style-type: none;
    font-size: 16px;
    font-size: 1.6rem;
    margin: 0;
    padding: 0;
  }

  &-item {
  display: inline;
  line-height: 1;
    &:first-of-type a {
      padding-left: 0;
    }
  }

  &-link {
    color: @grey;
    font-weight: 600;
    padding: 5px 10px;
    position: relative;
    text-transform: uppercase;
    transition: color 0.2s ease;

    &:hover {
      color: @brand-primary;
      text-decoration: none;
    }

    .is-disabled & {
      color: @gray-light;
      cursor: initial;

      &:hover {
        color: @gray-light;
      }
    }

    .is-active & {
      color: @black;
      z-index: 3;

      &::after {
        content: '';
        position: absolute;
        width: 75%;
        height: 3px;
        background-color: @brand-primary;
        bottom: -5px;
        left: 0;
        right: 0;
        margin: auto;
      }

      &:hover {
        color: @black;
      }
    }

    i {
    }
  }
}
</style>
