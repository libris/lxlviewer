<script>
import { mapGetters } from 'vuex';
import { translatePhrase } from '@/utils/filters';

export default {
  name: 'Login',
  data() {
    return {
      showButton: false,
      failedLogin: false,
      loginExpired: false,
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
    translatePhrase,
    renewLogin() {
      window.location = this.$store.getters.oauth2Client.token.getUri();
    },
  },
  mounted() {
    this.$nextTick(() => {
      const token = localStorage.getItem('at');
      if (this.$route.params.state === 'expired') {
        this.loginExpired = true;
      } else if (this.user.isLoggedIn && token !== null) {
        const path = localStorage.getItem('lastPath') || '/';
        this.$router.push(path);
      } else window.location = this.$store.getters.oauth2Client.token.getUri();
    });
  },
};
</script>

<template>
  <div class="Login">
    <div class="Login-content" v-if="failedLogin">
      {{ translatePhrase('Something went wrong') }}
    </div>
    <div class="Login-content" v-if="loginExpired">
      {{ translatePhrase('Your login has expired') }}.
      <hr>
      <button class="btn-primary btn--md" @click="renewLogin" @keyup.enter="renewLogin">
        {{ translatePhrase('Renew') }}
      </button>
    </div>
  </div>
</template>

<style lang="less">

.Login {
  display: flex;
  flex-direction: row;
  justify-content: center;
  &-content {
    display: flex;
    flex-wrap: wrap;
    flex-direction: column;
    justify-content: space-around;
    padding: 20px;
    background-color: @white;
    border-radius: 4px;
    box-shadow: @shadow-panel;
  }
}
</style>
