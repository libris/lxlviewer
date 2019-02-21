<script>
import { mapGetters } from 'vuex';
import VueSimpleSpinner from 'vue-simple-spinner';
import PostPicker from '@/components/care/post-picker';
import HoldingList from '@/components/care/holding-list';
import * as RecordUtil from '@/utils/record';
import * as MathUtil from '@/utils/math';

export default {
  name: 'holding-mover',
  components: {
    'vue-simple-spinner': VueSimpleSpinner,
    'post-picker': PostPicker,
    HoldingList,
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
      destinationId: '',
      loadingStatus: '',
      statuses: [],
    };
  },
  watch: {
  },
  methods: {
    doMove() {
      const promiseCollection = [];
      this.statuses = [];
      for (let i = 0; i < 50; i++) {
        this.statuses.push('loading');
        promiseCollection.push(
          new Promise((resolve, reject) => {
            setTimeout(() => {
              if (MathUtil.getRandomInt(0, 2) > 0) {
                resolve(i);
              } else {
                reject(i);
              }
            }, MathUtil.getRandomInt(0, 4000));
          }).then((result) => {
            this.$set(this.statuses, result, 'done');
          }).catch((error) => {
            this.$set(this.statuses, error, 'error');
          })
        );
      }
      // Promise.all(promiseCollection)
      // .then(values => {
      //   console.log(values);
      // })
      // .catch(error => console.log(error));
      // this.loadingStatus = 'loading...';
      // RecordUtil.moveHolding(this.holdingId, this.destinationId, this.user).then((result) => {
      //   console.log(result);
      //   this.loadingStatus = 'success!';
      // }, (error) => {
      //   this.loadingStatus = error;
      // });
    },
  },
  computed: {
    ...mapGetters([
      'userCare',
      'directoryCare',
      'settings',
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
      <div class="HoldingMover-separator"></div>
      <post-picker 
        name="reciever"
        :fetchedItems="fetchedItems"
        :fetchComplete="fetchComplete"/>
    </div>
    <div class="HoldingMover-resultListContainer">
      <HoldingList name="sender" />
      <div class="HoldingMover-separator"></div>
      <HoldingList name="reciever" />
    </div>
    <p class="HoldingMover-error" v-if="error">{{error}}</p>
    <div class="">
      <h3>Testlåda för flytt</h3>
      {{ directoryCare.selectedHoldings}}<br>
      <label for="destinationInput">ID på NYA bibposten (mottagare)</label>
      <input name="destinationInput" size="50" v-model="destinationId" /><br>
      <button @click="doMove">Flytta</button>
      <span>Status:</span>
      <ul>
        <li class="statusItem" v-for="(status, index) in statuses">
          <i class="statusItem-loading fa fa-circle-o-notch fa-spin" v-show="status === 'loading'" />
          <i class="statusItem-success fa fa-check" v-show="status === 'done'" />
          <i class="statusItem-error fa fa-times" v-show="status === 'error'" />
        </li>
      </ul>
    </div>
  </div>
</template>

<style lang="less">

.HoldingMover  {
  &-pickers {
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
  }
  &-separator {
    
  }

  &-error {
    color: red;
  }
  &-resultListContainer {
    margin-top: 1em;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    background-color: #ffffff;
    border: 1px solid @grey-light;
  }
  .statusItem {
    list-style: none;
    margin: 0;
    &-success {
      color: @brand-success;
    }
    &-error {
      color: @brand-danger;
    }
    &-loading {

    }
  }

}

</style>
