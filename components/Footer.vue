<template>
  <footer class="bd-footer p-2 p-md-3 bg-dark text-light text-center text-sm-start">
    <div class="container">
      <div class="row">
        <div class="col-md-2 text-center">
          <Logo />
        </div>
        <div class="col-md-5 d-flex flex-column">
          <h4>Stilguide</h4>
          <ul class="bd-footer-links ps-0 mb-3 text-light">
            <li class="d-block"><a class="text-light" href="#">Link 1</a></li>
            <li class="d-block"><a class="text-light" href="#">Link 2</a></li>
            <li class="d-block"><a class="text-light" href="#">Link 3</a></li>
          </ul>
        </div>
        <div class="col-md-5 d-flex flex-column">
          <h4>Om KB</h4>
          <ul class="bd-footer-links ps-0 mb-3 text-light">
            <li class="d-block"><a class="text-light" href="https://www.kb.se">Mer om KB</a></li>
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
