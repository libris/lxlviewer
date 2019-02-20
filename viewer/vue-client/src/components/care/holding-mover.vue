<script>
import { mapGetters } from 'vuex';
import PostPicker from '@/components/care/post-picker';
import * as RecordUtil from '@/utils/record';

export default {
  name: 'holding-mover',
  components: {
    'post-picker': PostPicker,
  },
  props: {
    fetchedItems: {
      type: Array,
      required: true,
    },
    fetchComplete: {
      type: Boolean,
    },
    error: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      holdingId: '',
      destinationId: '',
      loadingStatus: '',
    };
  },
  methods: {
    doMove() {
      this.loadingStatus = 'loading...';
      RecordUtil.moveHolding(this.holdingId, this.destinationId, this.user).then((result) => {
        this.loadingStatus = 'success!';
      }, (error) => {
        this.loadingStatus = error;
      });
    },
  },
  computed: {
    ...mapGetters([
      'userCare',
    ]),
  },
  mounted() {
  },
};
</script>

<template>
  <div class="HoldingMover">
    <div class="HoldingMover-pickers">
      <post-picker 
        name="sender"
        :fetchedItems="fetchedItems"
        :fetchComplete="fetchComplete"
        info="Från den avsändande posten flyttar du bestånd eller annan information till den mottagande parten"/>
      <post-picker 
        name="reciever"
        :fetchedItems="fetchedItems"
        :fetchComplete="fetchComplete"/>
    </div>
    <p class="HoldingMover-error" v-if="error">{{error}}</p>
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

.HoldingMover  {
  &-pickers {
    width: 100%;
    display: flex;
  }

  &-error {
    color: red;
  }

}

</style>
