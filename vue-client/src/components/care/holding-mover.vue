<script>
import { mapGetters } from 'vuex';
import { filter } from 'lodash-es';
import * as StringUtil from 'lxljs/string';
import * as RecordUtil from '@/utils/record';
import { translatePhrase } from '@/utils/filters';
import RecordPicker from '@/components/care/record-picker.vue';
import HoldingList from '@/components/care/holding-list.vue';
import ModalComponent from '@/components/shared/modal-component.vue';

export default {
  name: 'holding-mover',
  components: {
    'record-picker': RecordPicker,
    HoldingList,
    ModalComponent,
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
      progress: {},
      allSuccessDialog: false,
      loading: false,
      showInfoBox: false,
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
    translatePhrase,
    toggleInfoBox() {
      this.showInfoBox = !this.showInfoBox;
    },
    clearProgress() {
      this.progress = {};
    },
    acceptUntag() {
      this.untagSender();
      this.allSuccessDialog = false;
    },
    openModal() {
      this.allSuccessDialog = true;
      this.$nextTick(() => {
        this.$refs.acceptUntagButton.focus();
      });
    },
    closeModal() {
      this.allSuccessDialog = false;
    },
    untagSender() {
      this.$store.dispatch('unmark', { tag: 'Flagged', documentId: this.directoryCare.sender });
    },
    checkAllDone() {
      const selected = this.directoryCare.selectedHoldings;
      if (filter(this.progress, (o) => o === 'done').length === selected.length) {
        this.allDone();
      }
    },
    allDone() {
      const self = this;
      setTimeout(() => {
        self.loading = false;
        self.$refs.sender.doneMoving();
        self.$refs.reciever.doneMoving();
        if (self.directoryCare.holdingsMoved.length === filter(self.progress, (o) => o === 'done').length) {
          self.openModal();
        }
      }, 1500);
    },
    doMove() {
      this.clearProgress();
      this.loading = true;
      const promiseCollection = [];
      const selected = this.directoryCare.selectedHoldings;

      for (let i = 0; i < selected.length; i++) {
        this.progress[selected[i]] = 'loading';
        promiseCollection.push(
          RecordUtil.moveHolding(selected[i], this.directoryCare.reciever, this.user)
            .then(() => {
              // Success
              const changeObj = { holdingsMoved: this.directoryCare.holdingsMoved };
              changeObj.holdingsMoved.push(selected[i]);
              this.$store.dispatch('setDirectoryCare', { ...this.directoryCare, ...changeObj });
              this.progress[selected[i]] = 'done';
              this.checkAllDone();
            }, () => {
              // Error
              this.progress[selected[i]] = 'error';
              this.checkAllDone();
            })
            .catch((error) => {
              // Catch
              this.progress[selected[i]] = 'error';
              console.warn(error);
              this.checkAllDone();
            }),
        );
      }
    },
    switchInstances() {
      const switchObj = { sender: this.directoryCare.reciever,
        reciever: this.directoryCare.sender };
      this.$store.dispatch('setDirectoryCare', { ...this.directoryCare, ...switchObj });
    },
  },
  computed: {
    ...mapGetters([
      'userFlagged',
      'directoryCare',
      'settings',
      'resources',
      'user',
    ]),
    infoBoxTooltip() {
      if (this.showInfoBox) {
        return StringUtil.getUiPhraseByLang('Hide instructions', this.user.settings.language, this.resources.i18n);
      }
      return StringUtil.getUiPhraseByLang('Show instructions', this.user.settings.language, this.resources.i18n);
    },
    anySelected() {
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
    <div class="HoldingMover-infoBoxToggle" v-if="flaggedInstances.length > 0">
      <span class="icon icon--md">
        <i
          v-tooltip="infoBoxTooltip"
          class="fa fa-fw fa-question-circle"
          tabindex="0"
          aria-haspopup="true"
          ref="helpIcon"
          @mouseover="infoBoxHover = true"
          @mouseleave="infoBoxHover = false"
          @click="toggleInfoBox"
          @keyup.enter="toggleInfoBox" />
      </span>
    </div>
    <div class="HoldingMover-infoBox" v-if="flaggedInstances.length === 0 || showInfoBox">
      <div class="HoldingMover-infoBoxColumn">
        <div class="iconCircle"><i class="fa fa-fw fa-flag" /></div>
        <span class="header">Flagga post</span>
        <p>
          För att kunna flytta bestånd behöver du först flagga de bibliografiska poster du vill flytta bestånd mellan.
        </p>
        <p>
          Flaggan finns i den bibliografiska posten.
        </p>
      </div>
      <div class="HoldingMover-infoBoxColumn">
        <div class="iconCircle"><i class="fa fa-fw fa-exchange" /></div>
        <span class="header">Flytta bestånd</span>
        <p>
          När en post är flaggad kan du flytta beståndsposter som tillhör något av dina sigel.<br>
        </p>
        <p>
          Du markerar bestånden i den avsändande posten och klickar på <i>Flytta bestånd</i>.
        </p>
      </div>
      <div class="HoldingMover-infoBoxColumn">
        <div class="iconCircle"><i class="fa fa-fw fa-check" /></div>
        <span class="header">Klart!</span>
        <p>
          Beståndet är nu flyttat. Om du vill flagga av samtliga poster gör du det lättast under <router-link to="/user">din profil</router-link>.
        </p>
      </div>
    </div>
    <div class="HoldingMover-pickers" v-if="flaggedInstances.length > 0">
      <record-picker
        name="sender"
        opposite="reciever"
        :flaggedInstances="flaggedInstances"
        :expand="false">
        <p
          v-if="!directoryCare.sender"
          class="HoldingMover-info"
          slot="info">
          {{ translatePhrase("Holdings are moved from the sender record to the reciever record") }}.</p>
      </record-picker>
      <div class="HoldingMover-separator" v-if="flaggedInstances.length > 0">
        <button
          class="btn btn-primary"
          @click="switchInstances"
          :disabled="!anySelected"
          :aria-label="translatePhrase('Switch place')">
          <i class="fa fa-fw fa-exchange" />
        </button>
      </div>
      <record-picker
        v-if="flaggedInstances.length > 0"
        name="reciever"
        opposite="sender"
        :flaggedInstances="flaggedInstances" />
    </div>
    <div
      class="HoldingMover-resultListContainer"
      :class="{ 'is-empty': !anySelected }"
      v-if="flaggedInstances.length > 0">
      <HoldingList ref="sender" name="sender" :loading="loading" :lock="loading || !bothSelected" @send="doMove" :progress="progress" />
      <div class="HoldingMover-separator" />
      <HoldingList ref="reciever" :lock="true" name="reciever" />
    </div>
    <modal-component
      class="HoldingMover-allSuccessDialog"
      v-if="allSuccessDialog"
      width="500px"
      @close="closeModal"
      title="Move was successful"
      modal-type="info">
      <template #modal-body>
        <div class="HoldingMover-allSuccessDialogBody">
          <p>{{ translatePhrase('All selected holdings has been moved') }}.</p>
          <p>{{ translatePhrase('Do you want to unmark the sender') }}?</p>
          <div class="HoldingMover-allSuccessDialogBtnContainer">
            <button ref="acceptUntagButton" class="btn btn-primary btn--md" @click="acceptUntag">{{ translatePhrase('Yes') }}</button>
            <button class="btn btn-primary btn--md" @click="closeModal">{{ translatePhrase('No') }}</button>
          </div>
        </div>
      </template>
    </modal-component>
  </div>
</template>

<style lang="less">

.HoldingMover  {
  &-infoBoxToggle {
    display: block;
    height: 0;
    text-align: right;
    span {
      position: relative;
      top: -2em;
    }
  }
  &-infoBox {
    margin-bottom: 1em;
    display: flex;
    flex-direction: row;
    @media (max-width: @screen-sm) {
      flex-direction: column;
      align-items: center;
    }
    justify-content: space-around;
    background-color: @white;
    border: 1px solid @grey-lighter;
  }
  &-infoBoxColumn {
    padding: 2em 1% 1em 1%;
    @media (max-width: @screen-sm) {
      padding: 2em;
    }
    display: flex;
    flex-direction: column;
    flex-basis: 28%;
    align-items: center;
    .header {
      margin: 0.5em 0 1em 0;
      font-weight: 600;
      font-size: 18px;
    }
    p {
      width: 100%;
    }
    .iconCircle {
      border: 1px solid @grey-lighter;
      border-radius: 1em;
      width: 2em;
      height: 2em;
      line-height: 2em;
      text-align: center;
      color: @brand-primary;
    }
  }

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
    justify-content: center;

    @media (max-width: @screen-sm) {
      margin: 10px;
    }
  }

  &-resultListContainer {
    margin-top: 1em;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    background-color: @white;
    border: 1px solid @grey-lighter;

    &.is-empty {
      background-color: unset;
      border-color: transparent;
      height: 30vh;
    }
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
  }

  &-info {
    margin: 0;
    padding-top: 15px;
  }

  &-allSuccessDialog {
    .ModalComponent-container {
      top: 20%;
    }
  }
  &-allSuccessDialogBody {
    width: 100%;
    padding: 20px;
    text-align: center;
  }

  &-allSuccessDialogBtnContainer {
    margin-top: 20px;
  }

}

</style>
