<script>
import { mapGetters } from 'vuex';
import * as StringUtil from '@/utils/string';
import * as HttpUtil from '@/utils/http';
import * as User from '@/models/user';

export default {
  name: 'Login',
  data() {
    return {
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
