<template>
  <div class="Article container-fluid">
    <div class="row">
      <div class="col-12 col-md-12 col-lg-10 col-xl-8 col-xxl-6 py-4">
        <div v-if="error.statusCode">
          <h1>{{ translateUi(codeText.heading) }}</h1>
          <p v-for="extra in codeText.extra">
            {{ translateUi(extra) }}
          </p>
        </div>
        <h1 v-else>{{ translateUi('An error occurred') }}</h1>
        <a href="" @click.prevent="$router.back()">{{ translateUi('Go back') }}</a>
        <hr>
        <a href="/">{{ translateUi('Return to homepage') }}</a>
      </div>
    </div>
  </div>
</template>

<script>

export default {
  props: ['error'],
  layout: 'error', // you can set a custom layout for the error page
  head() {
    return { title: `${this.translateUi(this.codeText.heading)} | ${this.appState.domain}` }
  },
  computed: {
    codeText() {
      if (this.error.statusCode == 404) {
        return {
          heading: "Page not found",
          extra: [
            "If you entered a web address, check that it is correct.",
            "If you got here by following a link on our website, you can report it to us. See contact information in the footer."
          ]
        };
      } else if (this.error.statusCode == 410) {
        return {
          heading: "410 Gone",
          extra: [
            "The resource has been removed."
          ]
        };
      } else {
        return {
          heading: "There is a problem with the service",
          extra: [
            "Try again later."
          ]
        };
      }
    }
  }
}
</script>