<template>
  <nav class="navbar">
    <div class="container">
      <div class="navbar-header" role="banner">
          <div class="navbar-brand navbar-logo">
            <a href="/">
                <img src="/assets/img/kb_logo_black.svg" alt="Kungliga Bibliotekets logotyp">
            </a>
          </div>
          <a class="navbar-brand" href="/" title="Version ???">
              Libris katalogisering
            <span class="environment-label">
              ???
            </span>
          </a>
        </div>
        <ul class="nav navbar-nav pull-right">
          <li class="navbar-item">
            <a href="/help">
              <div class="navbar-circle">
                <i class="fa fa-question-circle" aria-hidden="true"></i>
              </div>
              <span class="js-translateable" data-translateable="Hjälp">Help</span></a>
          </li>
          <li class="navbar-item">
          <a href="/">
            <div class="navbar-circle">
              <i class="fa fa-search" aria-hidden="true"></i>
            </div>
            <span class="js-translateable" data-translateable="Sök">Search</span></a>
          </li>
          <li class="navbar-item">
            <a href="/createnew">
              <div class="navbar-circle">
                <i class="fa fa-file-text" aria-hidden="true"></i>
              </div>
              <span class="js-translateable" data-translateable="Create new">Create new</span>
            </a>
          </li>
          <li class="navbar-item user-settings">
            <a href="/usersettings">
              <div class="navbar-circle">
                <img class="user-gravatar" src="" />
              </div>
              USER_NAME <span v-cloak class="sigelLabel">(ACTIVE_SIGEL)</span>
            </a>
          </li>
          <li class="navbar-item"><a href="/login">
            <div class="navbar-circle">
            <i class="fa fa-fw fa-sign-in"></i>
            </div>
            <span class="js-translateable" data-translateable="Log in">Log in</span></a>
          </li>
        </ul>
    </div>
  </nav>
</template>

<script>

export default {
  name: 'Navbar',
  computed: {
  }
}
</script>

<style>

</style>
