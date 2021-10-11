<template>
  <footer class="bd-footer p-2 p-md-3 bg-dark text-light text-center text-sm-start" :class="{
    'offset-md-4 offset-lg-3 offset-xl-4 offset-xxl-3': $route.name.startsWith('marcframe'),
    'offset-md-4 offset-lg-4 offset-xl-3 offset-xxl-3': $route.name.startsWith('vocab')
    }">
    <div class="container">
      <div class="row">
        <div class="col-md-2 col-lg-1 text-center">
          <Logo />
        </div>
        <div class="col-md-5 offset-lg-1 d-flex flex-column">
          <h4>{{ translateUi('Information') }}</h4>
          <ul class="bd-footer-links ps-0 mb-3 text-light">
            <li class="d-block"><a class="text-light" href="https://www.kb.se/digital-tillganglighet">{{ translateUi('Accessibility statement') }}</a></li>
          </ul>
        </div>
        <div class="col-md-5 d-flex flex-column">
          <h4>{{ translateUi('Contact') }}</h4>
          <ul class="bd-footer-links ps-0 mb-3 text-light">
            <li class="d-block"><a class="text-light" href="mailto:libris@kb.se">libris@kb.se</a></li>
          </ul>
        </div>
      </div>
    </div>
  </footer>
</template>

<script>
import Logo from '@/components/Logo';


export default {
  data() {
    return {
    }
  },
  computed: {
  },
  methods: {
  },
  props: {
  },
  components: {
    Logo,
  }
}
</script>

<style lang="scss">
  footer {
    .Logo {
      max-width: 25vw;
    }
  }

</style>
