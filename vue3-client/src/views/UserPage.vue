<script>
import UserSettings from '@/components/usersettings/user-settings';
// import UserBookmarks from '@/components/usersettings/user-bookmarks';

export default {
  name: 'user-page-component',
  components: {
    'user-settings': UserSettings,
    // 'user-bookmarks': UserBookmarks,
  },
};
</script>

<template>
  <div>
    <user-settings></user-settings>
    <!-- <user-bookmarks></user-bookmarks> -->
  </div>
</template>

<style lang="scss">

</style>
