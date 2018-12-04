<script>
import UserSettings from '@/components/usersettings/user-settings';

export default {
  name: 'user-page-component',
  computed: {
    user() {
      return this.$store.getters.user;
    },
  },
  components: {
    'user-settings': UserSettings,
  },
};
</script>

<template>
    <user-settings></user-settings>
</template>

<style lang="less">

</style>
