<script>
/*
 Displays breadcrumbs/between post navigation in inspector
*/

import { mapGetters } from 'vuex';

export default {
  name: 'breadcrumb',
  props: {
    recordType: ''
  },
  data() {
    return {
      recordTypeChange: false,
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
    showFromPost() {
      if (!this.fromPostUrl || !this.recordTypeChange) return false;
      if ((this.fromPostUrl !== '') && (this.fromPostUrl !== this.currentPost)) {
        return true;
      }  
      return false;
    },
    searchResultUrl() {
      return this.inspector.breadcrumb[0].resultUrl;
    },
    fromPostUrl() {
      const breadcrumbTrail = this.inspector.breadcrumb;
      let fromPostId;

      if (breadcrumbTrail.length > 1) {
        const result = breadcrumbTrail.filter(breadcrumb => breadcrumb.type === 'fromPost');
        fromPostId = result[0].postUrl;
      } else if (breadcrumbTrail.length > 0) {
        fromPostId = breadcrumbTrail[0].postUrl;
      } else {
        fromPostId = '';
      }

      return fromPostId;
    },
    fromPostType() {
      const breadcrumbTrail = this.inspector.breadcrumb;
      let fromPostType;

      if (breadcrumbTrail.length > 1) {
        const result = breadcrumbTrail.filter(breadcrumb => breadcrumb.type === 'fromPost');
        fromPostType = result[0].recordType;
      } else if (breadcrumbTrail.length > 0) {
        fromPostType = breadcrumbTrail[0].recordType;
      } else {
        fromPostType = '';
      }

      return fromPostType;
    },
    currentPost() {
      return this.inspector.data.mainEntity['@id'];
    },
    currentPostNumber() {
      if (this.inspector.breadcrumb === undefined || this.inspector.breadcrumb.length == 0) return;
      let items = this.inspector.breadcrumb[0].result.items;

      const item = items.find(item => item['@id'] === this.currentPost);
      const itemIndex = items.indexOf(item)

      return itemIndex+1;
    },
    totalPostNumber() {
      if (this.inspector.breadcrumb === undefined || this.inspector.breadcrumb.length == 0) return;

      return this.inspector.breadcrumb[0].result.totalItems;
    },
    prevPostIndex() {
      if (this.inspector.breadcrumb === undefined || this.inspector.breadcrumb.length == 0) return;

      let items = this.inspector.breadcrumb[0].result.items;
      
      const item = items.find(item => item['@id'] === this.currentPost);
      const itemIndex = items.indexOf(item)
     
      return itemIndex-1;
    },
    prevPostPath() {
      if (this.inspector.breadcrumb === undefined || this.inspector.breadcrumb.length == 0) return '';

      if (this.prevPostIndex < 0) return '';

      let items = this.inspector.breadcrumb[0].result.items;

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

      let items = this.inspector.breadcrumb[0].result.items;
      
      const item = items.find(item => item['@id'] === this.currentPost);
      const itemIndex = items.indexOf(item)
     
      return itemIndex+1;
    },
    nextPostPath() {
      if (this.inspector.breadcrumb === undefined || this.inspector.breadcrumb.length == 0) return '';
      
      if (this.nextPostIndex > this.totalPostNumber) return '';

      let items = this.inspector.breadcrumb[0].result.items;

      let nextItem = items[this.nextPostIndex];

      if (nextItem && nextItem.hasOwnProperty('@id')) {
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
    <div class="Breadcrumb-back">
      <router-link class="Breadcrumb-backLink"
        v-if="this.searchResultUrl != ''"
        :to="this.searchResultUrl">Till träfflistan</router-link>
      <span v-if="this.showFromPost"> ›
        <router-link class="Breadcrumb-backLink" 
          :to="this.fromPostUrl">Tillbaka till {{this.fromPostType | labelByLang }}</router-link>
      </span>
    </div>
    <div class="Breadcrumb-postData" v-if="totalPostNumber > 1 && currentPostNumber !== 0">
      <span class="Breadcrumb-postNumbers">{{this.currentPostNumber}} av {{this.totalPostNumber}}</span>
      <div class="Breadcrumb-postLinks"
        v-if="this.prevPostPath || this.nextPostPath">
        <router-link class="Breadcrumb-prev"
          v-if="this.prevPostPath != ''"
          :to="this.prevPostPath">Föregående post</router-link>
        <span v-if="this.prevPostPath && this.nextPostPath"> | </span>
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
  flex-wrap: wrap;
  justify-content: space-between;
  margin: 0 0 30px 0;

  &-postNumbers {
  }

  &-postData {
    display: flex;
    flex: 1;
    justify-content: flex-end;
    white-space: nowrap;

    @media (max-width: @screen-xs) {
      justify-content: space-between;
      flex-direction: column;
      align-items: flex-end;
    }
  }

  &-postLinks {
    display: flex;
    margin: 0 0 0 30px;
  }

  &-back {
    flex: 1;
  }

  &-backLink {
    white-space: nowrap;
    margin-right: 10px;
  } 

  &-next {
    margin: 0 0 0 10px;
  }

  &-prev {
    margin: 0 10px 0 0;
  }
}
</style>
