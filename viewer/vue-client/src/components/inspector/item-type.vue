<script>
import { uniq, sortBy } from 'lodash-es';
import * as VocabUtil from '@/utils/vocab';
import * as StringUtil from '@/utils/string';
import * as HttpUtil from '@/utils/http';
import ItemVocab from '@/components/inspector/item-vocab';
import ModalComponent from '@/components/shared/modal-component';
import VueSimpleSpinner from 'vue-simple-spinner';

export default {
  name: 'item-type',
  extends: ItemVocab,
  props: {
  },
  data() {
    return {
      numberOfRelations: null,
      checkingRelations: false,
      unlockedByUser: false,
      unlockModalOpen: false,
    };
  },
  computed: {
    range() {
      const docType = VocabUtil.getRecordType(this.entityType, this.resources.vocab, this.resources.context);
      return [docType].concat(VocabUtil.getSubClasses(docType, this.resources.vocabClasses, this.resources.context));
    },
    onMainEntity() {
      return this.path === 'mainEntity.@type';
    },
    unlockTooltip() {
      const activeLinks = StringUtil.getUiPhraseByLang('This entity has active links', this.user.settings.language);
      const clickToUnlock = StringUtil.getUiPhraseByLang('Click to unlock editing', this.user.settings.language);
      return `${activeLinks}. ${clickToUnlock}.`;
    },
    isDisabled() {
      return this.onMainEntity && this.numberOfRelations !== 0 && this.unlockedByUser === false;
    },
  },
  methods: {
    unlockEdit() {
      this.unlockedByUser = true;
      this.closeUnlockModal();
    },
    openUnlockModal() {
      this.unlockModalOpen = true;
      setTimeout(() => {
        this.$refs.cancelUnlockButton.focus();
      }, 200);
    },
    closeUnlockModal() {
      this.unlockModalOpen = false;
    },
    getPossibleValues() {
      let values = uniq(this.range);
      return sortBy(values, value => StringUtil.getLabelByLang(
        value, 
        this.settings.language, 
        this.resources.vocab, 
        this.resources.context,
      ));
    },
    getRelationsInfo() {
      this.checkingRelations = true;
      const query = {
        _limit: 0,
        o: this.inspector.data.mainEntity['@id'],
      };
      HttpUtil.getRelatedPosts(query, this.settings.apiPath)
        .then((response) => {
        this.numberOfRelations = response.totalItems;
        this.checkingRelations = false;
      }, (error) => {
        console.log('Error checking for relations', error);
      });
    },
  },
  watch: {
    isLocked(newVal, oldVal) {
      if (newVal === false && oldVal === true) {
        this.unlockedByUser = false;
      }
    }
  },
  mounted() {
    this.$nextTick(() => {
      if (this.numberOfRelations === null && this.onMainEntity) {
        this.getRelationsInfo();
      }
    });
  },
  components: {
    VueSimpleSpinner,
    ModalComponent,
  },
};

</script>

<template>
  <div class="ItemType" :id="`formPath-${path}`" v-bind:class="{'is-locked': isLocked, 'is-unlocked': !isLocked, 'distinguish-removal': removeHover, 'removed': removed}">
    <div v-if="!isLocked && checkingRelations">
      <vue-simple-spinner size="small"></vue-simple-spinner>
    </div>
    <div class="ItemType-selectContainer" v-if="!isLocked && !checkingRelations && possibleValues.length > 0">
      <select 
        :disabled="isDisabled"
        v-model="selected" 
        class="ItemType-select customSelect" 
        :aria-label="fieldKey | labelByLang">
        <option 
          v-for="option in possibleValues" 
          :key="option"
          v-bind:value="option">{{ option | labelByLang }}</option>
      </select>
      <i class="ItemType-lockIcon fa fa-lock icon icon-sm" tabindex="0" v-tooltip.top="unlockTooltip" @keyup.enter="openUnlockModal()" @click="openUnlockModal()" v-if="isDisabled"></i>
    </div>
    <span class="ItemType-text" 
      v-if="isLocked">{{fieldValue | labelByLang}}
    </span>
    <modal-component title="Warning" modal-type="warning" @close="closeUnlockModal()" class="ChangeTypeWarningModal" 
      v-if="unlockModalOpen">
      <div slot="modal-body" class="ChangeTypeWarningModal-body">
        <p>
          Posten används som länk i <strong>{{ numberOfRelations }}</strong> {{ numberOfRelations === 1 ? 'annan post' : 'andra poster' }}.
        </p>
        <p>
          Observera att byte av typ kan påverka datan hos dessa andra entiter. Om du är osäker på konsekvenserna av detta, tryck avbryt.
        </p>
        <p><strong>Vill du låsa upp byte av typ för denna post?</strong></p>
        <div class="ChangeTypeWarningModal-buttonContainer">
          <button class="btn btn-warning btn--md" @click="unlockEdit()">{{ 'Yes' | translatePhrase }}, {{ 'Unlock' | translatePhrase | lowercase }}</button>
          <button class="btn btn-gray btn--md" ref="cancelUnlockButton" @click="closeUnlockModal()">{{ 'No' | translatePhrase }}, {{ 'Cancel' | translatePhrase | lowercase }}</button>
        </div>
      </div>
    </modal-component>
  </div>
</template>

<style lang="less">

.ItemType {
  &.is-locked {
    line-height: 2;
    // padding-left: 5px;
  }

  &-text {
    word-break: break-word;
  }

  &-selectContainer {
    display: flex;
    align-items: center;
  }

  &-lockIcon {
    flex-grow: 1;
  }

  &-select {
    flex-grow: 1;
    margin-top: 0.2em;
    margin-right: 0.5em;
    display: inline-block;
    &:disabled {
      opacity: 0.5;
    }
  }
}

.ChangeTypeWarningModal {
  &-body {
    height: 80%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 15px 45px;
  }
  &-buttonContainer {
    margin: 10px 0;
    & > * {
      margin-right: 15px;
    }
  }
}

</style>
