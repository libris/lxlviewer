<script>
import { mapGetters } from 'vuex';
import TabMenu from '@/components/shared/tab-menu';
import * as RecordUtil from '@/utils/record';
import HoldingMover from '@/components/care/holding-mover';

export default {
  name: 'DirectoryCare',
  components: {
    'tab-menu': TabMenu,
    'holding-mover': HoldingMover,
  },
  data() {
    return {
      holdingId: '',
      destinationId: '',
      loadingStatus: '',
    };
  },
  computed: {
    ...mapGetters([
      'userCare',
      'user',
    ]),
  },
  methods: {
    switchTool(id) {
      this.$router.push({ path: `/directory-care/${id}` });
    },
    doMove() {
      this.loadingStatus = 'loading...';
      RecordUtil.moveHolding(this.holdingId, this.destinationId, this.user).then((result) => {
        this.loadingStatus = 'success!';
      }, (error) => {
        this.loadingStatus = error;
      });
    },
  },
  mounted() {
    if (this.$route.params.tool === '' || typeof this.$route.params.tool === 'undefined') {
      this.$router.push({ path: '/directory-care/holdings' });
    }
  },
};
</script>

<template>
  <div class="DirectoryCare">
    <tab-menu @go="switchTool" :tabs="[
      { 'id': 'holdings', 'text': 'Move holdings' },
      { 'id': 'merge', 'text': 'Merge posts' },
    ]" :active="$route.params.tool"></tab-menu>
    <hr class="menuDivider">
    <holding-mover v-if="$route.params.tool === 'holdings'" />
    <div class="" v-if="$route.params.tool === 'merge'">
      <h1>merge posts</h1>
      <!-- replace this whole div with the component -->
    </div>
    <div class="">
      <h3>Testlåda för flytt</h3>
      <label for="holdingInput">ID på beståndsposten</label>
      <input name="holdingInput" size="50" v-model="holdingId" /><br>
      <label for="destinationInput">ID på NYA bibposten (mottagare)</label>
      <input name="destinationInput" size="50" v-model="destinationId" /><br>
      <button @click="doMove">Flytta</button>
      <span>Status: {{loadingStatus}}</span>
    </div>
  </div>
</template>

<style lang="less">

.DirectoryCare {
  .menuDivider {
    margin: -23px 0px 2em 0px;
    border-width: 3px;
  }
}
</style>
