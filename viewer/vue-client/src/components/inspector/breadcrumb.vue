<script>
/*
  Displays breadcrumbs/between post navigation in inspector
*/

import { mapGetters } from 'vuex';
import { each } from 'lodash-es';

export default {
  name: 'breadcrumb',
  props: {
    recordType: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      // recordTypeChange: false,
    };
  },
  computed: {
    ...mapGetters([
      'inspector',
      'settings',
    ]),
    // showFromPost() {
    //   if (!this.fromPostUrl || !this.recordTypeChange) return false;
    //   if ((this.fromPostUrl !== '') && (this.fromPostUrl !== this.currentPost)) {
    //     return true;
    //   }  
    //   return false;
    // },
    searchResultUrl() {
      return this.$route.meta.breadcrumb.resultUrl;
    },
    // fromPostUrl() {
    //   const breadcrumbTrail = this.inspector.breadcrumb;
    //   let fromPostId;

    //   if (breadcrumbTrail.length > 1) {
    //     const result = breadcrumbTrail.filter(breadcrumb => breadcrumb.type === 'fromPost');
    //     fromPostId = result[0].postUrl;
    //   } else if (breadcrumbTrail.length > 0) {
    //     fromPostId = breadcrumbTrail[0].postUrl;
    //   } else {
    //     fromPostId = '';
    //   }

    //   return fromPostId;
    // },
    // fromPostType() {
    //   const breadcrumbTrail = this.inspector.breadcrumb;
    //   let fromPostType;

    //   if (breadcrumbTrail.length > 1) {
    //     const result = breadcrumbTrail.filter(breadcrumb => breadcrumb.type === 'fromPost');
    //     fromPostType = result[0].recordType;
    //   } else if (breadcrumbTrail.length > 0) {
    //     fromPostType = breadcrumbTrail[0].recordType;
    //   } else {
    //     fromPostType = '';
    //   }

    //   return fromPostType;
    // },
    // currentPost() {
    //   return this.inspector.data.mainEntity['@id'];
    // },
    // currentPostNumber() {
    //   if (this.inspector.breadcrumb === undefined || this.inspector.breadcrumb.length === 0) return null;
    //   const items = this.inspector.breadcrumb[0].result.items;

    //   const item = items.find(itemObj => itemObj['@id'] === this.currentPost);
    //   const itemIndex = items.indexOf(item);

    //   return itemIndex + 1;
    // },
    totalItems() {
      return this.$route.meta.breadcrumb.totalItems;
    },
    absoluteOffset() {
      return this.$route.meta.breadcrumb.absoluteOffset;
    },
    relativeOffset() {
      return this.$route.meta.breadcrumb.relativeOffset;
    },
    prevOutOfBounds() {
      if (this.absoluteOffset > 0 && this.relativeOffset === 0) {
        return true;
      } return false;
    },
    prevPath() {
      if (!this.prevOutOfBounds) {
        return this.$route.meta.breadcrumb.paths[this.relativeOffset - 1];
      } return false;
    },
    nextOutOfBounds() {
      if (this.absoluteOffset + 1 < this.totalItems && this.relativeOffset + 1 > this.$route.meta.breadcrumb.paths.length - 1) {
        return true;
      } return false;
    },
    nextPath() {
      if (!this.nextOutOfBounds) {
        return this.$route.meta.breadcrumb.paths[this.relativeOffset + 1];
      } return false;
    },
    // prevPostIndex() {
    //   if (this.inspector.breadcrumb === undefined || this.inspector.breadcrumb.length === 0) return null;

    //   const items = this.inspector.breadcrumb[0].result.items;
      
    //   const item = items.find(itemObj => itemObj['@id'] === this.currentPost);
    //   const itemIndex = items.indexOf(item);
    //   return itemIndex - 1;
    // },
    // prevPath() {
    //   return 'www.google.se';
    //   // if (this.inspector.breadcrumb === undefined || this.inspector.breadcrumb.length === 0) return '';

    //   // if (this.prevPostIndex < 0) return '';

    //   // const items = this.inspector.breadcrumb[0].result.items;

    //   // const prevItem = items[this.prevPostIndex];
    //   // if (prevItem.hasOwnProperty('@id')) {
    //   //   const uriParts = prevItem['@id'].split('/');
    //   //   const fnurgel = uriParts[uriParts.length - 1];
    //   //   return `/${fnurgel}`;
    //   // }

    //   // return '';
    // },
    // nextPostIndex() {
    //   if (this.inspector.breadcrumb === undefined || this.inspector.breadcrumb.length === 0) {
    //     return null;
    //   }

    //   const items = this.inspector.breadcrumb[0].result.items;
      
    //   const item = items.find(itemObj => itemObj['@id'] === this.currentPost);
    //   const itemIndex = items.indexOf(item);
    //   return itemIndex + 1;
    // },
    // nextPath() {
    //   return 'www.google.se';
    //   // if (this.inspector.breadcrumb === undefined || this.inspector.breadcrumb.length === 0) return '';
      
    //   // if (this.nextPostIndex > this.totalPostNumber) return '';

    //   // const items = this.inspector.breadcrumb[0].result.items;

    //   // const nextItem = items[this.nextPostIndex];

    //   // if (nextItem && nextItem.hasOwnProperty('@id')) {
    //   //   const uriParts = nextItem['@id'].split('/');
    //   //   const fnurgel = uriParts[uriParts.length - 1];
    //   //   return `/${fnurgel}`;
    //   // }

    //   // return '';
    // },
  },
  methods: {
    getQuery(direction) {
      const queryObj = Object.assign({}, this.$route.meta.breadcrumb.query);
      switch (direction) {
        case 'prev':
          queryObj._offset = this.absoluteOffset - 1;
          break;
        case 'next': 
          queryObj._offset = this.$route.meta.breadcrumb.range.end;
          break;
        default:
          break;
      }
      let queryString = `${this.settings.apiPath}/find.json?`;
      each(queryObj, (v, k) => {
        queryString += (`${encodeURIComponent(k)}=${encodeURIComponent(v)}&`);
      });
    },

    //   return [queryString, direction];
    // },
    // fetchLink(url, direction) {
    //   fetch(url)
    //     .then((res) => {
    //       if (res.ok) {
    //         res.json().then((json) => {
    //           if (json.items.length === 1 && direction === 'prev') {
    //             this.prevPath = json.items[0]['@id'];
    //           } else if (json.items.length === 1 && direction === 'next') {
    //             this.nextPath = json.items[0]['@id'];
    //           }
    //         });
    //       }
    //     })
    //     .catch(err => console.log('Error fetching breadcrumb data', err));
    // },
    reduceOffset() {
      const meta = Object.assign({}, this.$route.meta);
      meta.breadcrumb.relativeOffset--;
      meta.breadcrumb.absoluteOffset--;
      this.$route.meta = meta;
    },
    addOffset() {
      const meta = Object.assign({}, this.$route.meta);
      meta.breadcrumb.relativeOffset++;
      meta.breadcrumb.absoluteOffset++;
      this.$route.meta = meta;
    },
  },
  watch: {
  },
  mounted() {
    this.$nextTick(() => {
      if (this.nextOutOfBounds) {
        this.fetchLink(...this.getQuery('next'));
      } else if (this.prevOutOfBounds) {
        this.fetchLink(...this.getQuery('prev'));
      }
    });
  },
};
</script>

<template>
  <div class="Breadcrumb">
    <div class="Breadcrumb-back">
      <router-link class="Breadcrumb-backLink"
        :to="searchResultUrl">{{ 'To result list' | translatePhrase }}</router-link>
      <!-- <span v-if="this.showFromPost"> ›
        <router-link class="Breadcrumb-backLink" 
          :to="this.fromPostUrl">Tillbaka till {{this.fromPostType | labelByLang }}</router-link>
      </span> -->
    </div>
    <div class="Breadcrumb-postData">
      <span class="Breadcrumb-postNumbers">{{ absoluteOffset + 1 }} {{ 'of' | translatePhrase }} {{ totalItems }}</span>
      <div class="Breadcrumb-postLinks" v-if="prevPath || nextPath">
        <router-link class="Breadcrumb-prev" 
          v-if="prevPath"
          :to="prevPath | asFnurgelLink"><span @click="reduceOffset">{{ ['Previous', 'post'] | translatePhrase }}</span></router-link>
        <span v-if="prevPath && nextPath"> | </span>
        <router-link class="Breadcrumb-next"
          v-if="nextPath"
          :to="nextPath | asFnurgelLink"><span @click="addOffset">{{ ['Next', 'post'] | translatePhrase }}</span></router-link>
      </div>
      absolute: {{ absoluteOffset }} relative: {{relativeOffset}} getnext: {{nextOutOfBounds}} getprev: {{prevOutOfBounds}}
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
