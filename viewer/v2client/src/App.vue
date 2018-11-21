<template>
  <div id="app" class="App">
    <global-message />
    <navbar-component />
    <div class="debug-mode-indicator" v-if="user.settings.appTech" @click="disableDebugMode">
      {{ 'Debug mode activated. Click here to disable.' | translatePhrase }}
    </div>
    <main class="MainContent" :class="{ 'container': !status.panelOpen, 'container-fluid': status.panelOpen, 'debug-mode': user.settings.appTech }" role="main">
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
    user() {
      return this.$store.getters.user;
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
    disableDebugMode() {
      const userObj = this.user;
      userObj.settings.appTech = false;
      this.$store.dispatch('setUser', userObj);
    },
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

.debug-mode-indicator {
  width: 100%;
  height: 2em;
  text-align: center;
  background-color: @brand-warning;
  cursor: pointer;
  box-shadow: 0px 5px 5px 0px rgba(0, 0, 0, 0.25);
  font-variant: all-small-caps;
  color: #222222;
  font-weight: bold;
  &:hover {
    background-color: darken(@brand-warning, 10%);
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
