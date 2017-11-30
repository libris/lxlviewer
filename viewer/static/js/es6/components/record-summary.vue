<script>
import LensMixin from './mixins/lens-mixin';
import { mixin as clickaway } from 'vue-clickaway';
import { getSettings, getStatus, getContext, getVocabulary, getDisplayDefinitions, getEditorData } from '../vuex/getters';
import { changeStatus } from '../vuex/actions';

export default {
  name: 'record-summary',
  mixins: [clickaway, LensMixin],
  vuex: {
    getters: {
      status: getStatus,
      settings: getSettings,
      editorData: getEditorData,
      vocab: getVocabulary,
      context: getContext,
      display: getDisplayDefinitions,
    },
    actions: {
      changeStatus,
    }
  },
  data() {
    return {
      showFull: false,
    }
  },
  methods: {
  },
  computed: {
    focusData() {
      return this.editorData.record;
    },
  },
  components: {
  },
  watch: {
  },
  ready() {
  },
};
</script>

<template>
  <div class="record-summary-container">
    <div>
      <span class="record-chip-element">Skapad {{ getCard.created }} av {{ getCard.descriptionCreator || 'okänd' }}</span> |
      <span class="record-chip-element">Ändrad {{ getCard.modified }} av {{ getCard.descriptionLastModifier || 'okänd' }}</span>
      <!--| <span class="show-record-toggle" v-show="!showRecord" v-on:click="toggleRecord">{{'Show admin metadata' | translatePhrase}}</span>
      <span class="show-record-toggle" v-show="showRecord" v-on:click="toggleRecord">{{'Hide admin metadata' | translatePhrase}}</span> -->
    </div>
    <!-- <div class="container-wrapper" v-if="showFull">
      <div class="full-info-container" v-on-clickaway="showFull = false">
        <div v-for="(k, v) in getCard">
          <span class="record-key">
            {{ k | labelByLang | capitalize }}
          </span>
          <span class="record-value">
            {{v}}
          </span>
        </div>
      </div>
    </div> -->
  </div>
</template>

<style lang="less">
@import './_variables.less';

.record-summary-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  .show-record-toggle {
    cursor: pointer;
    font-size: 13px;
    text-decoration: underline;
  }
  > div {
    &.container-wrapper::before {
      content: '';
      width: 0;
      height: 0;
      position: absolute;
      transform: translate(-5em, 1em);
      border-left: 15px solid transparent;
      border-right: 15px solid transparent;
      border-bottom: 15px solid #f2f2f2;
    }
    .full-info-container {
      cursor: auto;
      background-color: #f2f2f2;
      position: absolute;
      transform: translate(-82%, 2em);
      border-radius: 2px;
      box-shadow: 0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23);
      z-index: 1;
      > div {
        display: flex;
        border: solid;
        border-color: transparent;
        border-bottom-color: #d8d8d8;
        border-top-color: #f3f3f3;
        border-width: 1px;
        background-color: #f2f2f2;
        &:nth-child(odd) {
          background-color: #ededed;
        }
        > span{
          flex: 1 1 50%;
          padding: 0.5em 1em;
          &.record-key {
            text-align: right;
            border: 1px solid #e4e2e2;
            border-width: 0px 1px 0px 0px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          &.record-value {
            font-weight: bold;
          }
        }
      }
    }
    .record-chip-element {
      // font-weight: bold;
    }
  }
}
</style>
