<template>
  <div id="app" class="App">
    <global-message />
    <navbar-component />
    <main class="MainContent" :class="{ 'container': !status.panelOpen, 'container-fluid': status.panelOpen }" role="main">
        <div v-if="status.loadingIndicators.length > 0" class="text-center MainContent-spinner">
          <vue-simple-spinner size="large" :message="status.loadingIndicators[0] | translatePhrase"></vue-simple-spinner>
        </div>
        <div v-if="resourcesLoadingError" class="ResourcesLoadingError">
          <i class="fa fa-warning fa-4x text-danger"></i>
          <div>
            <h2>Kunde inte hämta nödvändiga resurser</h2>
            <p>Testa att ladda om sidan.</p>
            <p>Om felet kvarstår, kontakta <a href="mailto:libris@kb.se">libris@kb.se</a>.</p>
          </div>
        </div>
        <router-view v-if="resourcesLoaded" />
    </main>
    <portal-target name="sidebar" multiple />
    <footer-component></footer-component>
    <notification-list></notification-list>
  </div>
</template>

<script>
import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';
import NotificationList from '@/components/shared/notification-list';
import ModalComponent from '@/components/shared/modal-component';
import GlobalMessage from '@/components/layout/global-msg';
import VueSimpleSpinner from 'vue-simple-spinner';

export default {
  name: 'App',
  computed: {
    inspector() {
      return this.$store.getters.inspector;
    },
    status() {
      return this.$store.getters.status;
    },
    resourcesLoaded() {
      return this.$store.getters.resources.resourcesLoaded;
    },
    resourcesLoadingError() {
      return this.$store.getters.resources.loadingError;
    }
  },
  watch: {
  },
  methods: {
  },
  mounted() {
    this.$nextTick(() => {
      this.$store.dispatch('setStatusValue', { 
        property: 'keybindState', 
        value: 'default' 
      });
    });
  },
  components: {
    'navbar-component': Navbar,
    'footer-component': Footer,
    'notification-list': NotificationList,
    'modal-component': ModalComponent,
    'global-message': GlobalMessage,
    'vue-simple-spinner': VueSimpleSpinner,
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
  .ResourcesLoadingError {
    display: flex;
    align-items: center;
    justify-content: center;
    i {
      margin-right: 0.5em;
    }
  }
}

.MainContent {
  flex: 1 0 auto;

  &.container-fluid {
    margin-right: 0px;
    margin-left: 0px;
  }

  &-spinner {
    margin-top: 2em;
  }

  @media screen and (max-width: @screen-lg-min){
    width: 100%;
  }
}

</style>
