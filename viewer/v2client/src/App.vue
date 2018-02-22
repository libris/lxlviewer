<template>
  <div id="app">
    <navbar-component />
    <main class="container">
      <div v-if="!resourcesLoaded" class="text-center">
        <i class="fa fa-circle-o-notch fa-4x fa-spin"></i><br/>
        <h3>{{ 'Loading' | translatePhrase | capitalize }}</h3>
      </div>
      <transition name="fade">
        <router-view v-if="resourcesLoaded" />
      </transition>
    </main>
    <modal-component title="Error" modal-type="danger" :closeable="false" v-if="resourcesLoadingError" class="ResourceLoadingErrorModal">
      <div slot="modal-header" class="ResourceLoadingErrorModal-header">
        <header>
          Error
        </header>
      </div>
      <div slot="modal-body" class="ResourceLoadingErrorModal-body">
        Couldn't fetch the resources needed for this application.<br><br>
        Try reloading the page.<br><br>
        If the error persists, please contact <a href="mailto:libris@kb.se">libris@kb.se</a>.
      </div>
    </modal-component>
    <footer-component></footer-component>
    <notification-list></notification-list>
  </div>
</template>

<script>
import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';
import NotificationList from '@/components/shared/notification-list';

export default {
  name: 'App',
  computed: {
    resourcesLoaded() {
      return this.$store.getters.resources.resourcesLoaded;
    }
  },
  mounted() {
    this.$nextTick(() => {
    });
  },
  components: {
    'navbar-component': Navbar,
    'footer-component': Footer,
    'notification-list': NotificationList,
   },
}
</script>

<style lang="less">
@import "~bootstrap/less/bootstrap";
@import "~kungbib-styles/dist/less/kb-style";
@import "./less/main";

#app {
  display: flex;
  min-height: 100vh;
  flex-direction: column;
  main {
    flex-grow: 1;
  }
  .fade-enter-active, .fade-leave-active {
    transition-property: opacity;
    transition-duration: .25s;
  }

  .fade-enter-active {
    transition-delay: .25s;
  }

  .fade-enter, .fade-leave-active {
    opacity: 0
  }
}

</style>
