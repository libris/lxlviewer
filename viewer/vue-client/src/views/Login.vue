<script>
import { mapGetters } from 'vuex';

export default {
  name: 'Login',
  data() {
    return {
      showButton: false,
      failedLogin: false,
    };
  },
  watch: {
  },
  computed: {
    ...mapGetters([
      'inspector',
      'resources',
      'user',
      'settings',
      'status',
    ]),
  },
  methods: {
  },
  mounted() {
    this.$nextTick(() => {
      if (this.user.isLoggedIn) {
        const path = localStorage.getItem('lastPath') || '/';
        this.$router.push({ path: path });
      } else window.location = `${this.settings.apiPath}/login/authorize`;
    });
  },
};
</script>

<template>
  <div class="Login">
    <div v-if="failedLogin">
      {{ 'Something went wrong' | translatePhrase }}
    </div>
  </div>
</template>

<style lang="less">

.Login {

}
</style>
