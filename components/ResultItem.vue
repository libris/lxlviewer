<template>
  <div class="ResultItem">
    <span class="ResultItem-title">{{ itemData['@id'] }}</span>
    <span class="ResultItem-scheme chip">{{ itemData['inScheme'].titleByLang['sv'] }}</span>
    <span class="ResultItem-type chip">{{ itemData['@type'] }}</span>
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
    itemData: {
      type: Object,
      default: null,
    },
  },
}
</script>

<style lang="scss">
.ResultItem {
  border: 1px solid $gray-200;
  display: flex;
  flex-direction: row;
  padding: 0.5em 1em;
  gap: 1em;
  .chip {
    background-color: $gray-100;
    border-radius: 2em;
    padding: 0.5em 0.75em;
  }
  > span {
    padding: 0.5em;
    &:first-child {
      flex-grow: 1;
    }
  }
}

</style>
