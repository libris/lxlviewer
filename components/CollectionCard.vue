<template>
  <div class="CollectionCard">
    <div class="CollectionCard-header">
      <a :href="collectionData.view['@id']">{{ collectionData.object.titleByLang['sv'] }}</a> <span class="CollectionCard-badge">{{ collectionData.totalItems }}</span>
    </div>
    <div class="CollectionCard-body">
      <a :href="collectionData.object['@id'] | removeBaseUri">Mer om {{collectionData.object.titleByLang['sv']}}</a>
    </div>
  </div>
</template>

<script>
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
}
</script>

<style lang="scss">
.CollectionCard {
  margin: 0.5em 0.5em 0 0;
  a {
    color: $kb-secondary-turquoise;
    text-decoration: none;
    &:hover {
      text-decoration: underline;
    }
  }
  &-badge {
    background-color: $gray-200;
    color: $gray-700 !important;
    font-weight: 500;
    font-size: 75%;
    border-radius: 2em;
    padding: 0.2em 0.5em;
  }
  &-header {
    border: 1px solid $gray-500;
    border-radius: 3px;
    font-weight: 500;
    padding: 0.5rem 1rem;
  }
  &-body {
    font-size: 85%;
    padding: 0.5rem 1rem;
  }
}

</style>
