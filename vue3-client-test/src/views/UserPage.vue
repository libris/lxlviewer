<script>
import UserSettings from '@/components/usersettings/user-settings.vue';

export default {
  name: 'user-page-component',
  components: {
    'user-settings': UserSettings,
  },
};
</script>

<template>
  <div>
    <user-settings></user-settings>
  </div>
</template>

<style lang="scss">

</style>
