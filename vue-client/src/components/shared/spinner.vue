<script setup>
const props = defineProps({
  size: {
    type: String,
    default: null,
    required: false,
  },
  message: {
    type: String,
    default: '',
  },
});

</script>

<template>
  <div class="spinner">
    <i
      class="fa fa-fw fa-circle-o-notch fa-spin animated"
      :class="props.size ? `fa-${props.size}` : undefined"
    />
    <span v-if="message" class="message">
      {{ message }}
    </span>
  </div>
</template>

<style scoped lang="less">
  .spinner {
    display: flex;
    flex-direction: column;
    align-items: center;
    color: @grey-darker;
  }

  .message {
    margin-top: 0.5rem;
    color: @grey-darker;
    font-size: 2rem;
    color: @grey-dark;
  }
</style>
