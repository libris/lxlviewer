<script>
import { mapGetters } from 'vuex';
import TabMenu from '@/components/shared/tab-menu';
import * as RecordUtil from '@/utils/record';

export default {
  name: 'DirectoryCare',
  components: {
    'tab-menu': TabMenu,
  },
  data() {
    return {
      holdingId: '',
      destinationId: '',
      loadingStatus: '',
    }
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
    <div class="" v-if="$route.params.tool === 'holdings'">
      <h1>move holdings</h1>
      <!-- replace this whole div with the component -->
      <h3>Marked for care:</h3>
      <ul>
        <li :key="id" v-for="id in userCare">{{id}}</li>
      </ul>
    </div>
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
