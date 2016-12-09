<script>
import * as _ from 'lodash';
import * as DisplayUtil from '../utils/display';
import * as VocabUtil from '../utils/vocab';
import * as EditUtil from '../utils/edit';
import { getVocabulary, getSettings, getEditorData, getDisplayDefinitions } from '../vuex/getters';

export default {
  name: 'header-component',
  vuex: {
    getters: {
      vocab: getVocabulary,
      settings: getSettings,
      editorData: getEditorData,
      display: getDisplayDefinitions,
    },
  },
  props: {
    status,
  },
  data() {
    return {
      showChipHeader: false,
    };
  },
  ready() { // Ready method is deprecated in 2.0, switch to "mounted"
    this.$nextTick(() => {
      window.addEventListener('scroll', (e) => {
        const cardHeader = document.getElementById('card-header');
        const chipHeaderThreshold = cardHeader.offsetTop + (cardHeader.offsetHeight / 2);
        const scrollPosition = e.target.body.scrollTop;
        if (chipHeaderThreshold < scrollPosition) {
          this.showChipHeader = true;
        } else {
          this.showChipHeader = false;
        }
      });
    });
  },
  methods: {
    isArray(o) {
      return _.isArray(o);
    },
    isTitle(key) {
      const k = key.toLowerCase();
      return ~k.indexOf('title');
    },
    isObject(obj) {
      return _.isObject(obj);
    },
    showKey(k) {
      const listOfKeys = ['ISBN']; // TODO: Fix list of keys to show.
      return _.indexOf(listOfKeys, k) > -1;
    },
    getValue(value) {
      if (this.isObject(value)) {
        if (typeof value['@id'] !== 'undefined') {
          // return EditUtil.getLinked(value['@id'], this.editorData.linked);
          return value['@id'];
        }
      }
      return value;
    },
    getHeaderInfo(level) { // TODO: Make acceptList a parameter
      const acceptList = ['value'];
      const result = {};
      const levelInfo = this.getDisplay(level, this.status.state);
      // console.log(levelInfo);
      _.each(levelInfo, (cardValue, cardKey) => {
        if (_.isArray(cardValue)) {
          _.each(cardValue, (deepValue) => {
            _.each(deepValue, (deepestValue, deepestKey) => {
              if (deepestKey === '@type') {
                result[deepestValue] = '';
              }
            });
            _.each(deepValue, (deepestValue, deepestKey) => {
              // if (_.indexOf(acceptList, deepestKey) > -1 || this.isTitle(deepestKey)) {
              if (deepestKey !== '@type') {
                result[deepValue['@type']] += `${this.getValue(deepestValue)} `;
              }
            });
          });
        } else {
          result[cardKey] = this.getValue(cardValue);
        }
      });
      return result;
    },
    getDisplay(lens, level) {
      const displayObj = {};
      let item = '';
      if (level === 'it') {
        item = this.editorData.it;
      } else if (level === 'work') {
        item = this.editorData.work;
      }

      let propertyList = DisplayUtil.getProperties(item['@type'], lens, this.display);
      if (propertyList.length === 0) {
        const baseClasses = VocabUtil.getBaseClassesFromArray(
          item['@type'],
          this.vocab,
          this.settings.vocabPfx
        );
        for (const baseClass of baseClasses) {
          propertyList = DisplayUtil.getProperties(
            baseClass.replace(this.settings.vocabPfx, ''),
            lens,
            this.display
          );
          if (propertyList.length > 0) {
            break;
          }
        }
      }
      for (const property of propertyList) {
        if (item[property]) {
          displayObj[property] = item[property];
        }
      }
      return displayObj;
    },
  },
  computed: {
    state() {
      const state = this.status.state;
      if (state === 'it') {
        return 'Instance';
      } else if (state === 'work') {
        return 'Work';
      }
      return 'Unknown';
    },
    getCard() {
      return DisplayUtil.getCard(
        this.editorData[this.status.state],
        this.display,
        this.editorData.linked,
        this.vocab,
        this.settings
      );
    },
    getHeaderCard() {
      return this.getHeaderInfo('cards');
    },
    getHeaderChip() {
      return this.getHeaderInfo('chips');
    },
  },
  components: {
  },
};
</script>

<template>
  <div class="header-component">
    <div class="main-header" id="card-header">
      <ul>
        <li v-for="(k, v) in getCard" v-bind:class="{'large-title': isTitle(k)}">{{v}}</li>
      </ul>
<!--
    <div class="large-title">
      {{state}}
    </div>
      <ul>
        <li v-for="(k, v) in getHeaderCard">
          <div v-if="isTitle(k)">
            <span class="large-title">{{v}}</span>
            <span class="medium-text"> ({{k}})</span>
          </div>
          <div v-if="!isTitle(k)">
            <span v-if="showKey(k)">{{k}}: {{v}}</span>
            <span v-if="!showKey(k)">{{v}}</span>
          </div>
        </li>
      </ul>
    </div> -->
    <div class="container">
      <div class="row">
      <div class="fixed-header" v-show="showChipHeader">
        <span v-for="(k, v) in getCard">
          <span v-if="isTitle(k)">
            <span class="small-title">{{v}}</span>
          </span>
          <span v-if="!isTitle(k)" class="minimum-text">
            <span v-if="showKey(k)">{{k}}: {{v}}</span>
            <span v-if="!showKey(k)">{{v}}</span>
          </span>
        </span>
      </div>
    </div>
    </div>
  </div>
</template>

<style lang="less">
@import './variables.less';

.header-component {
  padding: 0px;

  .container {
    top: 32px;
    position: fixed;
    padding: 0px;
    z-index: @header-z;
    .row {
      margin: 0px;
    }
    .fixed-header {
      text-align: center;
      padding: 5px;
      width: inherit;
      background-color: white;
      box-shadow: 0px 6px 10px -6px rgba(0, 0, 0, 0.6);
    }
  }

  .main-header {
    ul {
      padding: 20px;
    }
  }

  ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }


  .large-title {
    font-size: 20px;
    font-weight: bold;
  }

  .work-title {
    font-size: 22px;
    border-bottom: 1px solid white;
  }

  .small-title {
    font-size: 16px;
    font-weight: bold;
  }

  .medium-text {
    font-size: 14px;
  }

  .small-text {
    font-size: 12px;
  }

  .minimum-text {
    font-size: 10px;
    font-style: italic;
  }
}

</style>
