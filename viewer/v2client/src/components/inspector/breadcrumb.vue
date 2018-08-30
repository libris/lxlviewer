<script>
/*
 Displays breadcrumbs/between post navigation in inspector
*/

import { mapGetters } from 'vuex';

export default {
  name: 'breadcrumb',
  data() {
    return {
    };
  },
  computed: {
    ...mapGetters([
      'inspector',
      'resources',
      'user',
      'settings',
      'status',
    ]),
    searchResultUrl() {
      return this.inspector.breadcrumb.searchUrl;
    },
    currentPost() {
      return this.inspector.data.mainEntity['@id'];
    },
    currentPostNumber() {
      if (this.inspector.breadcrumb === undefined || this.inspector.breadcrumb.length == 0) return;
      let items = this.inspector.breadcrumb.result.items;
      
      const item = items.find(item => item['@id'] === this.currentPost);
      const itemIndex = items.indexOf(item)

      return itemIndex+1;
    },
    totalPostNumber() {
      if (this.inspector.breadcrumb === undefined || this.inspector.breadcrumb.length == 0) return;

      return this.inspector.breadcrumb.result.totalItems;
    },
    prevPostIndex() {
      if (this.inspector.breadcrumb === undefined || this.inspector.breadcrumb.length == 0) return;

      let items = this.inspector.breadcrumb.result.items;
      
      const item = items.find(item => item['@id'] === this.currentPost);
      const itemIndex = items.indexOf(item)
     
      return itemIndex-1;
    },
    prevPostPath() {
      if (this.inspector.breadcrumb === undefined || this.inspector.breadcrumb.length == 0) return;

      if(this.prevPostIndex < 0) return '';

      let items = this.inspector.breadcrumb.result.items;
      let prevItem = items[this.prevPostIndex];
      if (prevItem.hasOwnProperty('@id')) {
        const uriParts = prevItem['@id'].split('/');
        const fnurgel = uriParts[uriParts.length-1];
        return `/${fnurgel}`;
      }

      return '';
    },
    nextPostIndex() {
      if (this.inspector.breadcrumb === undefined || this.inspector.breadcrumb.length == 0) return;

      let items = this.inspector.breadcrumb.result.items;
      
      const item = items.find(item => item['@id'] === this.currentPost);
      const itemIndex = items.indexOf(item)
     
      return itemIndex+1;
    },
    nextPostPath() {
      if (this.inspector.breadcrumb === undefined || this.inspector.breadcrumb.length == 0) return;

      if(this.prevPostIndex > this.totalPostNumber) return '';

      let items = this.inspector.breadcrumb.result.items;
      let nextItem = items[this.nextPostIndex];
      if (nextItem.hasOwnProperty('@id')) {
        const uriParts = nextItem['@id'].split('/');
        const fnurgel = uriParts[uriParts.length-1];
        return `/${fnurgel}`;
      }

      return '';
    },
  },
  methods: {
  },
  watch: {
  },
  mounted() {
    this.$nextTick(() => {
    });
  },
};
</script>

<template>
  <div class="Breadcrumb">
    <router-link class="Breadcrumb-back"
      :to="this.searchResultUrl">Till träfflistan</router-link>
    <div class="Breadcrumb-postData">
      <span class="Breadcrumb-postNumbers">{{this.currentPostNumber}} av {{this.totalPostNumber}}</span>
      <div class="Breadcrumb-postLinks">
        <router-link class="Breadcrumb-prev"
          v-if="this.prevPostPath != ''"
          :to="this.prevPostPath">Föregående post</router-link>
          |
        <router-link class="Breadcrumb-next"
          v-if="this.nextPostPath != ''"
          :to="this.nextPostPath">Nästa post</router-link>
      </div>
    </div>
  </div>
</template>

<style lang="less">
.Breadcrumb {
  display: flex;
  justify-content: space-between;
  margin: 0 0 30px 0;

  &-postNumbers {
    margin: 0 30px 0 0;
  }

  &-postData {
    display: flex;
  }

  &-postLinks {
    display: flex;
  }

  &-back {
    color: @brand-primary;
  }

  &-next {
    margin: 0 0 0 10px;
    color: @brand-primary;
  }

  &-prev {
    margin: 0 10px 0 0;
    color: @brand-primary;
  }
}
</style>
