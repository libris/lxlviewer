<template>
  <footer class="bd-footer p-2 p-md-3 bg-dark text-light text-center text-sm-start">
    <div class="container">
      <div class="row">
        <div class="col-md-2 text-center">
          <Logo />
        </div>
        <div class="col-md-5 d-flex flex-column">
          <h4>Information</h4>
          <ul class="bd-footer-links ps-0 mb-3 text-light">
            <li class="d-block"><a class="text-light" href="https://www.kb.se/digital-tillganglighet">Tillgänglighetsredogörelse</a></li>
          </ul>
        </div>
        <div class="col-md-5 d-flex flex-column">
          <h4>Kontakt</h4>
          <ul class="bd-footer-links ps-0 mb-3 text-light">
            <li class="d-block"><a class="text-light" href="mailto:libris@kb.se">libris@kb.se</a></li>
          </ul>
        </div>
      </div>
    </div>
  </footer>
</template>

<style lang="scss">
  footer {
    .Logo {
      max-width: 25vw;
    }
  }

</style>
