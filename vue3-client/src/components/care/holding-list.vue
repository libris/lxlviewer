<script>
import { mapState, mapWritableState } from 'pinia';
import { useUserStore } from '@/stores/user';
import { useSettingsStore } from '@/stores/settings';
import { useResourcesStore } from '@/stores/resources';
import { useDirectoryCareStore } from '@/stores/directoryCare';
import { each, isObject, orderBy } from 'lodash-es';
import * as StringUtil from 'lxljs/string';
import * as DisplayUtil from 'lxljs/display';
import { translatePhrase, lowercase } from '@/utils/filters';

export default {
  name: 'holding-list',
  props: {
    name: {
      type: String,
      required: true,
    },
    progress: {
      type: Object,
      default: null,
    },
    lock: {
      type: Boolean,
      default: false,
    },
    loading: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      selected: [],
      allHoldingsSelected: false,
    };
  },
  computed: {
    ...mapState(useResourcesStore, ['resources']),
    ...mapState(useDirectoryCareStore, ['sender', 'reciever']),
    ...mapState(useUserStore, ['user']),
    ...mapWritableState(useDirectoryCareStore, ['senderHoldings', 'selectedHoldings', 'recieverHoldings', 'holdingsMoved']),
    ...mapState(useSettingsStore, ['settings']),
    registrantPermissions() {
      const collections = this.user.collections.map((x) => {
        if (x.registrant === true) {
          return x.code;
        }
        return false;
      });
      return collections;
    },
    isSender() {
      return this.name === 'sender';
    },
    bothSelected() {
      return (this.sender !== null && this.reciever !== null);
    },
    movableHoldings() {
      const holdings = this.senderHoldings;
      const permitted = [];
      for (let i = 0; i < holdings.length; i++) {
        if (this.userHasPermission(holdings[i]) && !this.holdingExistsOnTarget(holdings[i])) {
          permitted.push(holdings[i]);
        }
      }
      return permitted;
    },
    noPermissionTooltip() {
      return StringUtil.getUiPhraseByLang('You don\'t have permission', this.user.settings.language, this.resources.i18n);
    },
    foundOnDestinationTooltip() {
      return StringUtil.getUiPhraseByLang('Holding already exists on the reciever', this.user.settings.language, this.resources.i18n);
    },
    noRecieverTooltip() {
      return StringUtil.getUiPhraseByLang('No reciever chosen', this.user.settings.language, this.resources.i18n);
    },
    sortedHoldings() {
      const holdings = this[`${this.name}Holdings`];
      each(holdings, (h) => { 
        h._label = DisplayUtil.getItemLabel(
          h,
          this.resources,
          [],
          this.settings,
        );
      });
      
      const sorted = orderBy(holdings, [(o) => {
        const parts = o.heldBy['@id'].split('/');
        const code = parts[parts.length - 1];
        return this.registrantPermissions.indexOf(code) > -1;
      }, o => o._label], ['desc', 'asc']);
      return sorted;
    },
  },
  watch: {
    selected(value) {
      this.selectedHoldings = value;
      if (this.selected.length > 0 && this.movableHoldings.length === this.selected.length) {
        this.allHoldingsSelected = true;
      } else {
        this.allHoldingsSelected = false;
      }
    },
    'sender'() {
      if (this.name === 'sender') {
        this.getHoldings();
      }
      this.clearSelected();
    },
    'reciever'() {
      if (this.name === 'reciever') {
        this.resetMovedStatus();
        this.getHoldings();
      }
      this.clearSelected();
    },
    lock(newValue, oldValue) {
      if (newValue === false && oldValue === true) {
        this.clearSelected();
      }
    },
  },
  methods: {
    translatePhrase, lowercase,
    resetMovedStatus() {
      this.holdingsMoved = [];
    },
    doSend() {
      this.resetMovedStatus();
      this.$emit('send');
    },
    getStatus(holding) {
      const id = holding['@id'];
      if (this.progress !== null && this.progress.hasOwnProperty(id)) {
        return this.progress[id];
      }
      return null;
    },
    userHasPermission(holding) {
      if (this.user.isGlobalRegistrant()) {
        return true;
      }
      let heldBy = '';
      if (isObject(holding)) {
        heldBy = holding.heldBy['@id'];
      } else {
        heldBy = holding;
      }
      const holdingSigel = StringUtil.removeDomain(heldBy, this.settings.removableBaseUris).replace('library/', '');
      if (this.registrantPermissions.indexOf(holdingSigel) > -1) {
        return true;
      }
      return false;
    },
    isSelected(holding) {
      return this.selected.indexOf(holding['@id']) > -1;
    },
    isNewlyMoved(holding) {
      if (this.name === 'reciever') {
        const moved = this.holdingsMoved;
        if (moved.indexOf(holding['@id']) > -1) {
          return true;
        }
      }
      return false;
    },
    doneMoving() {
      if (this.name === 'reciever') {
        this.beforeChange = this.sortedHoldings;
      }
      this.selected = [];
      this.getHoldings();
    },
    selectAllPossible() {
      for (let i = 0; i < this.movableHoldings.length; i++) {
        this.selected.push(this.movableHoldings[i]['@id']);
      }
    },
    clearSelected() {
      this.beforeChange = null;
      this.selected = [];
    },
    toggleAll() {
      if (this.allHoldingsSelected) {
        this.clearSelected();
      } else {
        this.selectAllPossible();
      }
    },
    handleCheckbox($event, holding) {
      if ($event.target.checked === true) {
        this.selected.push(holding['@id']);
      } else {
        for (let i = 0; i < this.selected.length; i++) {
          if (this.selected[i] === holding['@id']) {
            this.selected.splice(i, 1);
          }
        }
      }
    },
    holdingExistsOnTarget(holdingObj) {
      const sigel = holdingObj.heldBy['@id'];
      for (let i = 0; i < this.recieverHoldings.length; i++) {
        if (this.recieverHoldings[i].heldBy['@id'] === sigel) {
          return true;
        }
      }
      return false;
    },
    getHoldings() {
      const bibId = this[this.name];
      const queryPairs = {
        'itemOf.@id': bibId,
        '@type': 'Item',
      };
      let url = `${this.settings.apiPath}/find.jsonld?`;
      each(queryPairs, (v, k) => {
        url += (`${encodeURIComponent(k)}=${encodeURIComponent(v)}&`);
      });
      fetch(url).then(response => response.json()).then((result) => {
        this[`this.name}Holdings`] = result.items;
      }, (error) => {
        console.warn('Couldnt find holdongs for', bibId, error);
      });
    },
  },
};
</script>

<template>
  <div class="HoldingList" :class="{ 'is-sender': isSender }" v-if="this[this.name]">
    <div class="HoldingList-topBar">
        <button v-if="isSender" class="btn btn--md btn-light SelectAll-btn" @click="toggleAll" :disabled="lock || movableHoldings.length === 0">
          <i class="fa fa-fw fa-square-o" v-show="!allHoldingsSelected"></i>
          <i class="fa fa-fw fa-check-square-o" v-show="allHoldingsSelected"></i>
          <!-- <input v-model="allHoldingsSelected" type="checkbox" :disabled="lock || movableHoldings.length === 0" @change="handleAllSelect" /> -->
          {{ translatePhrase('Select all') }}
        </button>
        <button class="btn btn--md SendHoldings-btn btn-primary" v-if="isSender && !loading" :disabled="lock || selectedHoldings.length === 0" @click="doSend">{{ translatePhrase('Move holdings') }}</button>
        <button class="btn btn--md SendHoldings-btn btn-primary" v-if="isSender && loading" :disabled="true"><i class="fa fa-circle-o-notch fa-spin"></i> {{ translatePhrase('Moving holdings') }}</button>
        <span v-if="isSender">{{ selectedHoldings.length }} / {{ senderHoldings.length }} {{ lowercase(translatePhrase('Holdings chosen')) }}</span>
        <div v-if="!isSender"></div>
        <span v-if="!isSender">{{ recieverHoldings.length }} {{ lowercase(translatePhrase('Holdings')) }}</span>
    </div>
    <div class="HoldingList-body">
      <div class="HoldingList-items">
        <div class="HoldingList-item" :key="index" v-for="(holding, index) in sortedHoldings">
          <div class="HoldingList-itemBody" :class="{ 'selected': isSelected(holding), 'newly-moved': isNewlyMoved(holding), 'is-first': index === 0 }">
            <div class="HoldingList-input" v-if="isSender && !lock && userHasPermission(holding) && !holdingExistsOnTarget(holding)">
              <input
                :checked="isSelected(holding)" 
                type="checkbox" :disabled="lock" 
                @change="handleCheckbox($event, holding)" 
                :id="`checkbox-${holding.heldBy['@id']}`"/>
              <!-- <div class="customCheckbox-icon"></div> -->
            </div>
            <div class="HoldingList-noReciever" v-if="reciever === null && userHasPermission(holding)">
              <span v-tooltip.top="noRecieverTooltip">
              <input disabled type="checkbox" />
              </span>
            </div>
            <div class="HoldingList-noPermission" v-if="isSender && !userHasPermission(holding)">
              <i v-tooltip.top="noPermissionTooltip" class="fa fa-fw fa-lock"></i>
            </div>
            <div class="HoldingList-foundOnDestination" v-if="isSender && userHasPermission(holding) && holdingExistsOnTarget(holding)">
              <i v-tooltip.top="foundOnDestinationTooltip" class="fa fa-fw fa-warning"></i>
            </div>
            <div class="HoldingList-status" v-if="lock && isSender && userHasPermission(holding) && !holdingExistsOnTarget(holding) && reciever">
              <i class="statusItem-loading fa fa-fw fa-circle-o-notch fa-spin" v-show="getStatus(holding) === 'loading'" />
              <i class="statusItem-success fa fa-fw fa-check" v-show="getStatus(holding) === 'done'" />
              <i class="statusItem-error fa fa-fw fa-times" v-show="getStatus(holding) === 'error'" />
            </div>
            <entity-summary 
            :exclude-components="['categorization', 'id']"
            :exclude-properties="['itemOf']"
            :focus-data="holding"
            :shouldOpenTab="true"></entity-summary>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">

.HoldingList {
  flex-basis: @directorycare-sidewidth;
  max-width: @directorycare-sidewidth;
  padding: 0;
  display: flex;
  flex-direction: column;

  .EntitySummary-detailsKey {
    flex-basis: 9em;
  }

  &-topBar {
    height: 4em;
    padding: 15px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    .btn {
      min-width: unset;
    }
    & > * {
      margin: 5px;
    }

    & span {
      white-space: nowrap;
    }

    @media (max-width: @screen-sm) {
      height: auto;
      flex-wrap: wrap;
    }
  }

  &-body {
    border: solid @grey-lighter;
    border-width: 1px 0px 0px 1px;
    padding: 0 1em;
    flex-grow: 1;
    .is-sender & {
      border-width: 1px 1px 0px 0px;
    }
  }
  &-items {
    max-height: 50vh;
    overflow-y: scroll;
    overflow-x: hidden;
  }
  &-item {
    flex-direction: row;
    display: flex;
    align-items: center;

    &:first-of-type {
      margin-top: 1em;
    }

    &:last-of-type {
      margin-bottom: 1em;
    }
  }
  &-itemIndex {
    padding: 0.5em;
    flex-basis: 8%;
    color: @grey-dark;
  }
  &-itemBody {
    flex-direction: row;
    display: flex;
    flex: 1;
    min-width: 0%;
    border: solid @grey-lighter;
    border-width: 0px 1px 1px 1px;
    &.is-first {
      border-width: 1px 1px 1px 1px;
    }
    &.selected {
      background-color: @brand-faded;
    }
    &.newly-moved {
      background-color: @brand-faded;
    }
  }
  &-itemInfo {
    padding: 1em;
    font-weight: normal;
    margin: 0;
  }
  &-input, &-status, &-noPermission, &-foundOnDestination, &-noReciever {
    display: flex;
    flex-direction: row;
    width: 50px;
    padding: 0 10px;
    justify-content: center;
    align-items: center;
    input {
      margin: 0;
    }
    & .customCheckbox-icon {
        margin-left: 0;
    }

    & + .EntitySummary {
      padding-left: 0;
    }
  }
  &-noPermission {
    color: @grey-light;
  }
  &-foundOnDestination {
    color: @brand-warning;
  }

  .SendHoldings-btn {
    // font-weight: 800;
  }

  & .EntitySummary-title {
    font-size: 1.6rem;
    white-space: unset;
  }

  & .EntitySummary-info {
    word-break: break-word;
  }

  @media (max-width: @screen-sm) {
    flex-basis: 100%;
    max-width: 100%;

    &:not(.is-sender) {
      display: none;
    }
  }
}

</style>
