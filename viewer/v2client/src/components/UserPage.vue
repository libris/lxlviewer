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
  }
};
</script>

<template>
  <div class="panel panel-default about-content">
    <user-settings></user-settings>
  </div>
</template>

<style lang="less">

.about-content {
  margin-top: 15vh;
  > img {
    width: 100%;
  }
  > div > div {
    padding: 0 4em 4em 4em;
    .header {
      font-size: 3em;
    }
    .abstract {
      font-weight: bold;
    }
    .section {
      margin: 2em 0 0 0;
      .section-header {
        font-size: 1.2em;
      }
      .section-text {
        font-size: 1em;
      }
    }
  }
}

</style>
