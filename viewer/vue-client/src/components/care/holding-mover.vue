<script>
import { mapGetters } from 'vuex';
import { filter } from 'lodash-es';
import VueSimpleSpinner from 'vue-simple-spinner';
import PostPicker from '@/components/care/post-picker';
import HoldingList from '@/components/care/holding-list';
// import * as RecordUtil from '@/utils/record';
import * as MathUtil from '@/utils/math';

export default {
  name: 'holding-mover',
  components: {
    // 'vue-simple-spinner': VueSimpleSpinner,
    'post-picker': PostPicker,
    HoldingList,
  },
  props: {
    flaggedInstances: {
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
      progress: {},
      loading: false,
    };
  },
  watch: {
    'directoryCare.selectedHoldings'() {
      this.clearProgress();
    },
  },
  methods: {
    clearProgress() {
      this.progress = {};
    },
    checkAllDone() {
      const selected = this.directoryCare.selectedHoldings;
      if (filter(this.progress, o => o !== 'loading').length === selected.length) {
        this.allDone();
      }
    },
    allDone() {
      const self = this;
      setTimeout(() => {
        this.loading = false;
        self.$refs.sender.resetList();
        self.$refs.reciever.resetList();
      }, 1500);
    },
    doMove() {
      this.clearProgress();
      this.loading = true;
      const promiseCollection = [];
      const selected = this.directoryCare.selectedHoldings;
      const id = this.directoryCare.reciever;

      for (let i = 0; i < selected.length; i++) {
        this.$set(this.progress, selected[i], 'loading');
        promiseCollection.push(
          RecordUtil.moveHolding(selected[i], this.directoryCare.reciever, this.user)
          .then((result) => {
            this.$set(this.progress, selected[i], 'done');
            this.checkAllDone();
          }, (error) => {
            this.$set(this.progress, selected[i], 'error');
            this.checkAllDone();
          })
          .catch((error) => {
            this.$set(this.progress, selected[i], 'error');
            this.checkAllDone();
          })
        );
      }
    },
    switchInstances() {
      const switchObj = { sender: this.directoryCare.reciever, reciever: this.directoryCare.sender };
      this.$store.dispatch('setDirectoryCare', { ...this.directoryCare, ...switchObj });
    },
  },
  computed: {
    ...mapGetters([
      'userCare',
      'directoryCare',
      'settings',
      'user',
    ]),
    canSwitchInstances() {
      return !!(this.directoryCare.sender || this.directoryCare.reciever);
    },
    bothSelected() {
      return (this.directoryCare.sender && this.directoryCare.reciever);
    },
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
        opposite="reciever"
        :flaggedInstances="flaggedInstances"
        :fetchComplete="fetchComplete">
        <p slot="info">
          <span v-if="flaggedInstances.length === 0">Det finns inga instanser markerade för katalogvård.</span>
          <span v-else="">Från den avsändande posten flyttar du bestånd till den mottagande posten.</span>
        </p>
      </post-picker>
      <div class="HoldingMover-separator">
        <button @click="switchInstances" class="btn btn-primary" :disabled="!canSwitchInstances">
          <i class="fa fa-fw fa-exchange"></i>
        </button>
      </div>
      <post-picker 
        name="reciever"
        opposite="sender"
        :flaggedInstances="flaggedInstances"
        :fetchComplete="fetchComplete"/>
    </div>
    <div class="HoldingMover-resultListContainer">
      <HoldingList ref="sender" name="sender" :lock="loading || !bothSelected" @send="doMove" :progress="progress" />
      <div class="HoldingMover-separator"></div>
      <HoldingList ref="reciever" :lock="true" name="reciever" />
    </div>
    <p class="HoldingMover-error" v-if="error">{{error}}</p>
  </div>
</template>

<style lang="less">

.HoldingMover  {
  &-pickers {
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: space-between;

    @media (max-width: @screen-sm) {
      flex-direction: column;
      align-items: center;
    }
  }

  &-separator {
    display: flex;
    align-items: baseline;
    margin: 40px 10px;
    
    @media (max-width: @screen-sm) {
      margin: 20px;
    }
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
