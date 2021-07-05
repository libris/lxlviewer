<template>
  <div class="CollectionCard col-4">
    <b><a :href="collectionData.view['@id']">{{ collectionData.object.titleByLang['sv'] }}</a> <span class="badge bg-kb-primary-grey text-dark">{{ collectionData.totalItems }}</span></b>
    <p><a :href="collectionData.object['@id'] | filterBaseUri">Mer om {{collectionData.object.titleByLang['sv']}}</a></p>
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
  border: 1px solid $kb-primary-grey;
  border-radius: 2px;
}

</style>
