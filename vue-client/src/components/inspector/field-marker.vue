<script>
export default {
  name: 'field-marker',
  emits: ['markForAdd', 'markForRemove'],
  methods: {
    markForAdd() {
      this.$emit('markForAdd');
    },
    markForRemove() {
      this.$emit('markForRemove');
    },
  },
};
</script>

<template>
  <div class="FieldMarker">
    <button
      class="FieldMarker-add"
      v-on:click="markForAdd"
    >
      <i class="FieldMarker-icon fa fa-plus plus-icon" aria-hidden="true" />
    </button>
    <button
      class="FieldMarker-remove"
      v-on:click="markForRemove"
    >
      <i class="FieldMarker-remove fa fa-minus minus-icon" aria-hidden="true" />
    </button>
  </div>

</template>

<style scoped lang="less">
.FieldMarker {
  display: flex;
  &-add {
    font-size: 14px;
    font-size: 1.4rem;
    padding-right: 5px;
  }
  &-remove {
    font-size: 14px;
    font-size: 1.4rem;
    padding-right: 5px;
  }
}
</style>
