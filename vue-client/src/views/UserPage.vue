<script>
import UserSettings from '@/components/usersettings/user-settings.vue';
// import UserBookmarks from '@/components/usersettings/user-bookmarks';

export default {
  name: 'user-page-component',
  computed: {
    user() {
      return this.$store.getters.user;
    },
  },
  components: {
    'user-settings': UserSettings,
    // 'user-bookmarks': UserBookmarks,
  },
};
</script>

<template>
  <div>
    <user-settings />
    <!-- <user-bookmarks></user-bookmarks> -->
  </div>
</template>

<style lang="less">

</style>
