<template>
  <img class="Logo" alt="Kungliga bibliotekets logotyp" src="@/assets/images/kb_logo_white.svg">
</template>

<script>
export default {
  data() {
    return {
      show: false
    }
  },
  props: {
  },
}
</script>

<style>
.Logo {
  animation: 1s appear;
  margin: auto;
  height: 100%;
}

@keyframes appear {
  0% {
    opacity: 0;
  }
}
</style>
