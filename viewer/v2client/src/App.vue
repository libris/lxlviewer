<template>
  <div id="app" class="App">
    <global-message />
    <navbar-component />
    <main class="MainContent" :class="{ 'container': !inspector.status.panelOpen, 'container-fluid': inspector.status.panelOpen }" role="main">
      <div v-if="!resourcesLoaded" class="text-center">
        <i class="fa fa-circle-o-notch fa-4x fa-spin"></i><br/>
        <h3>{{ 'Loading application' | translatePhrase | capitalize }}</h3>
      </div>
      <transition name="fade">
        <router-view v-if="resourcesLoaded" />
      </transition>
    </main>
    <modal-component title="Error" modal-type="danger" class="ResourceLoadingErrorModal"
      :closeable="false" 
      v-if="resourcesLoadingError">
      <div slot="modal-body" class="ResourceLoadingErrorModal-body">
        Kunde inte hämta nödvändiga resurser.<br><br>
        Testa att ladda om sidan.<br><br>
        Om felet kvarstår, kontakta <a href="mailto:libris@kb.se">libris@kb.se</a>.
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
import ModalComponent from '@/components/shared/modal-component';
import GlobalMessage from '@/components/layout/global-msg';

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
  methods: {
  },
  mounted() {
    this.$nextTick(() => {
    });
  },
  components: {
    'navbar-component': Navbar,
    'footer-component': Footer,
    'notification-list': NotificationList,
    'modal-component': ModalComponent,
    'global-message': GlobalMessage,
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
  .ResourceLoadingErrorModal {
    &-body {
      text-align: center;
      padding: 2em;
    }
  }
}

.MainContent {
  flex: 1 0 auto;

  &.container-fluid {
    margin-right: 0px;
    margin-left: 0px;
  }

  @media screen and (max-width: @screen-lg-min){
    width: 100%;
  }
}

</style>
