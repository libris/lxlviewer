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
      if (this.$route.name === 'LoggedIn') {
        localStorage.setItem('at', StringUtil.getParamValueFromUrl(this.$route.hash, 'access_token'));
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
