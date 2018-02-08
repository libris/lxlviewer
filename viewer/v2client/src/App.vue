<template>
  <div id="app">
    <navbar-component />
    <main class="container">
      <div v-if="!resourcesLoaded" class="text-center">
        <i class="fa fa-circle-o-notch fa-4x fa-spin"></i><br/>
        <h3>{{ 'Loading' | translatePhrase | capitalize }}</h3>
      </div>
      <router-view v-if="resourcesLoaded" />
    </main>
    <notification-list></notification-list>
  </div>
</template>

<script>
import Navbar from '@/components/layout/navbar';
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
    'notification-list': NotificationList,
   },
}
</script>

<style lang="less">
@import "~bootstrap/less/bootstrap";
@import "~kungbib-styles/dist/less/kb-style";
@import "./less/main";

</style>
