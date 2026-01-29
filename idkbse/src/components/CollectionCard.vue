<template>
  <div class="CollectionCard" @click="navigateToSearch">
    <div class="CollectionCard-content">
      <div class="CollectionCard-header">
        <span class="CollectionCard-title">
          <a onclick="event.stopPropagation()" :href="searchUrl">
            {{ title }}
          </a>
        </span>
        <span class="CollectionCard-counter">
          {{ collectionData.totalItems }} {{ translateUi('terms') }}
        </span>
      </div>
      <div class="CollectionCard-body">
        <a onclick="event.stopPropagation()" :href="removeBaseUri(collectionData.object['@id'])">{{ translateUi('More about') }} {{ title }}</a>
      </div>
    </div>
    <div class="CollectionCard-arrow">
      <i class="bi-chevron-right"></i>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  data() {
    return {
      show: false
    }
  },
  props: {
    collectionData: {
      type: Object,
      default: null,
    },
  },
  computed: {
    ...mapGetters(['settings']),
    title() {
      if (this.collectionData.object.titleByLang) {
        return this.collectionData.object.titleByLang[this.settings.language] || this.collectionData.object.titleByLang[Object.keys(this.collectionData.object.titleByLang)[0]];
      }
      return this.collectionData.object['@id'];
    },
    searchUrl() {
      const params = new URLSearchParams({
        q: '*',
        'inScheme.@id': this.collectionData.object['@id'],
      });
      return `/find?${params.toString()}`;
    },
  },
  methods: {
    navigateToSearch() {
      this.$router.push({
        path: '/find',
        query: {
          q: '*',
          'inScheme.@id': this.collectionData.object['@id'],
        },
      });
    },
  },
}
</script>

<style lang="scss">
.CollectionCard {
  cursor: pointer;
  &:hover {
    box-shadow: 0px 2px 6px 2px rgb(0, 0, 0, 0.08);
    .CollectionCard-arrow {
      color: $gray-600;
    }
  }
  transition: box-shadow 0.25s ease;
  box-shadow: 0px 2px 4px 0 rgb(0, 0, 0, 0.08);
  background-color: $white;
  // background-color: $gray-100;
  border: 1px solid $gray-200;
  border-radius: 3px;
  padding: 1em;
  margin: 0em 0em 1em 0;
  @media (min-width: 768px) {
    margin: 0em 1em 1em 0;
  }
  display: flex;
  flex-direction: row;
  &-arrow {
    transition: color 0.25s ease;
    font-size: 2rem;
    display: flex;
    align-items: center;
    color: $gray-400;
  }
  &-content {
    display: flex;
    flex-grow: 1;
    overflow: hidden;
    justify-content: space-between;
    flex-direction: column;
    gap: 1em;
  }
  &-header {
    display: flex;
    flex-direction: column; 
  }
  &-title {
    font-weight: 500;
    font-size: 1.1rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    a {
      text-decoration: none;
      &:hover {
        text-decoration: none;
      }
    }
  }
  &-counter {
    font-size: 0.9rem;
    color: $gray-600;
  }
  &-body {
    font-size: 0.9rem;
    a {
      color: $kb-secondary-turquoise;
      text-decoration: none;
      white-space: nowrap;
      &:hover {
        text-decoration: underline;
      }
    }
  }
}

</style>
