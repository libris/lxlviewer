<template>
  <div class="Article container-fluid">
    <div class="row">
      <div class="col-12 col-md-12 col-lg-10 col-xl-8 col-xxl-6 py-4">
        <div v-if="error.statusCode">
          <h1>{{ error.statusCode }}</h1>
          <p>{{ translateUi(codeText) }}</p>
        </div>
        <h1 v-else>An error occurred</h1>
        <a href="" @click.prevent="$router.back()">{{ translateUi('Go back') }}</a>
      </div>
    </div>
  </div>
</template>

<script>

export default {
  props: ['error'],
  layout: 'error', // you can set a custom layout for the error page
  computed: {
    codeText() {
      switch(this.error.statusCode) {
        case 404:
          return 'Page not found';
          break;
        default:
          return '';
      }
    },
  },
}
</script>