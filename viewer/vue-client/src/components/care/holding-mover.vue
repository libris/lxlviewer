<script>
import { mapGetters } from 'vuex';
import { filter } from 'lodash-es';
import PostPicker from '@/components/care/post-picker';
import HoldingList from '@/components/care/holding-list';
import * as RecordUtil from '@/utils/record';

export default {
  name: 'holding-mover',
  components: {
    'post-picker': PostPicker,
    HoldingList,
  },
  props: {
    flaggedInstances: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      destinationId: '',
      // loadingStatus: '',
      progress: {},
      loading: false,
    };
  },
  watch: {
    'directoryCare.selectedHoldings'(newValue, oldValue) {
      if (newValue !== oldValue) {
        this.clearProgress();
      }
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
        self.loading = false;
        self.$refs.sender.doneMoving();
        self.$refs.reciever.doneMoving();
      }, 1500);
    },
    doMove() {
      this.clearProgress();
      this.loading = true;
      const promiseCollection = [];
      const selected = this.directoryCare.selectedHoldings;

      for (let i = 0; i < selected.length; i++) {
        this.$set(this.progress, selected[i], 'loading');
        promiseCollection.push(
          RecordUtil.moveHolding(selected[i], this.directoryCare.reciever, this.user)
            .then(() => {
              // Success
              const changeObj = { holdingsMoved: this.directoryCare.holdingsMoved };
              changeObj.holdingsMoved.push(selected[i]);
              this.$store.dispatch('setDirectoryCare', { ...this.directoryCare, ...changeObj });
              this.$set(this.progress, selected[i], 'done');
              this.checkAllDone();
            }, () => {
              // Error
              this.$set(this.progress, selected[i], 'error');
              this.checkAllDone();
            })
            .catch((error) => {
              // Catch
              this.$set(this.progress, selected[i], 'error');
              console.warn(error);
              this.checkAllDone();
            }),
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
      return !!(this.directoryCare.sender && this.directoryCare.reciever);
    },
  },
  mounted() {
    this.$nextTick(() => {
      const changeObj = { sender: null, reciever: null, selectedHoldings: [] };
      this.$store.dispatch('setDirectoryCare', { ...this.directoryCare, ...changeObj });
    });
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
        :expand="true">
        <p v-if="flaggedInstances.length === 0"
          class="HoldingMover-info" 
          slot="info">
          {{ "There are no instances flagged for directory care" | translatePhrase }}.</p>
        <p v-else-if="!directoryCare.sender"
          class="HoldingMover-info" 
          slot="info">
          {{ "Holdings are moved from the sender post to the reciever post" | translatePhrase }}.</p>
      </post-picker>
      <div class="HoldingMover-separator" v-if="flaggedInstances.length > 0">
        <button class="btn btn-primary" 
          @click="switchInstances" 
          :disabled="!canSwitchInstances"
          :aria-label="'Switch place' | translatePhrase">
          <i class="fa fa-fw fa-exchange"></i>
        </button>
      </div>
      <post-picker 
        v-if="flaggedInstances.length > 0"
        name="reciever"
        opposite="sender"
        :flaggedInstances="flaggedInstances"/>
    </div>
    <div class="HoldingMover-resultListContainer" v-if="flaggedInstances.length > 0">
      <HoldingList ref="sender" name="sender" :loading="loading" :lock="loading || !bothSelected" @send="doMove" :progress="progress" />
      <div class="HoldingMover-separator"></div>
      <HoldingList ref="reciever" :lock="true" name="reciever" />
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

    @media (max-width: @screen-sm) {
      flex-direction: column;
      align-items: center;
    }
  }

  &-separator {
    display: flex;
    align-items: baseline;
    margin: 80px 10px;
    
    @media (max-width: @screen-sm) {
      margin: 20px;
    }
  }

  &-resultListContainer {
    margin-top: 1em;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    background-color: @white;
    border: 1px solid @grey-lighter;
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

  &-info {
    margin: 20px 0 0;
  }

}

</style>
