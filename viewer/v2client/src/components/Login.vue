<script>
import { mapGetters } from 'vuex';
import * as StringUtil from '@/utils/string';
import * as HttpUtil from '@/utils/http';
import * as User from '@/models/user';

export default {
  name: 'Login',
  data() {
    return {
      token: '',
      showButton: false,
      failedLogin: false,
    }
  },
  watch: {
    token(val, oldVal) {
      if (val && val !== oldVal) {
        this.verify();
      }
    }
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
    verify() {
      HttpUtil.get({ url: 'https://login.libris.kb.se/oauth/verify', token: this.token }).then((result) => {
        const userObj = User.getUserObject(result.user)
        this.$store.dispatch('setUser', userObj);
        this.$router.push({ path: `/` });
      }, (error) => {
        this.failedLogin = true;
      });
    },
  },
  mounted() {
    this.$nextTick(() => {
      if (this.$route.name === 'LoggedIn') {
        this.token = StringUtil.getParamValueFromUrl(this.$route.hash, 'access_token');
      }
    });
  }
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
