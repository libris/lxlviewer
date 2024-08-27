<script>
export default {
  name: 'field-marker',
  data() {
    return {
      activeAddButton: false,
      activeRemoveButton: false,
    };
  },
  emits: ['toggleMarkForAdd', 'toggleMarkForRemove'],
  methods: {
    toggleMarkForAdd() {
      this.activeAddButton = !this.activeAddButton;
      this.activeRemoveButton = false;
      this.$emit('toggleMarkForAdd');
    },
    toggleMarkForRemove() {
      this.activeRemoveButton = !this.activeRemoveButton;
      this.activeAddButton = false;
      this.$emit('toggleMarkForRemove');
    },
  },
};
</script>
<template>
  <div class="FieldMarker">
    <button
      class="FieldMarker-add btn-primary"
        v-bind:class="{ 'is-active': this.activeAddButton }"
        v-on:click="toggleMarkForAdd">
      <i class="FieldMarker-icon fa fa-plus plus-icon" aria-hidden="true" />
    </button>
    <button
      class="FieldMarker-add btn-primary"
        v-bind:class="{ 'is-active': this.activeRemoveButton }"
        v-on:click="toggleMarkForRemove">
      <i class="FieldMarker-remove fa fa-minus minus-icon" aria-hidden="true" />
    </button>
  </div>
</template>

<style scoped lang="less">
.FieldMarker {
  display: flex;
  &-add {
    font-size: 1.4rem;
    &.is-active {
      background-color: @btn-primary--hover;
      border: @btn-primary--hover;
    }
  }
}
</style>
