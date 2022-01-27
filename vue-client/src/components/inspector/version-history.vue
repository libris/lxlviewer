<script>
/*
  The full version history view
*/
import { mapGetters } from 'vuex';
import * as VocabUtil from 'lxljs/vocab';

export default {
  props: {
  },
  data() {
    return {
    };
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
  watch: {
  },
  methods: {
  },
  components: {
  },
  mounted() {
  },
};
</script>

<template>
  <div class="VersionHistory">
    hehe
  </div>
</template>

<style lang="less">

.VersionHistory {

}

</style>
