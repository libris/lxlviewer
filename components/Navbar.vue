<template>
  <nav class="Navbar navbar navbar-expand-lg navbar-dark">
    <div class="container-fluid">
      <NuxtLink to="/" class="Navbar-brand navbar-brand">
        <Logo />
        id.kb.se
      </NuxtLink>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <NavMenu />
    </div>
  </nav>
</template>

<style lang="scss">
  .Navbar {
    padding: 0 !important;
    background-color: black;
    color: $kb-primary-white;
    .Navbar-brand {
      display: flex;
      flex-direction: row;
      align-items: center;
      img {
        margin-right: 0.5em;
      }
    }
  }

</style>
