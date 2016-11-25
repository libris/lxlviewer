<script>
import * as _ from 'lodash';
import * as DisplayUtil from '../utils/display';
import * as VocabUtil from '../utils/vocab';
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

    };
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
  },
  computed: {
    getItCard() {
      const displayObj = {};
      const item = this.editorData.it;

      let propertyList = DisplayUtil.getProperties(item['@type'], 'cards', this.display);
      if (propertyList.length === 0) {
        const baseClasses = VocabUtil.getBaseClassesFromArray(
          item['@type'],
          this.vocab,
          this.settings.vocabPfx
        );
        for (const baseClass of baseClasses) {
          propertyList = DisplayUtil.getProperties(
            baseClass.replace(this.settings.vocabPfx, ''),
            'cards',
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
    getWorkCard() {
      const workCard = DisplayUtil.getCard(
        this.editorData.work,
        this.display,
        this.editorData.linked,
        this.vocab,
        this.settings.vocabPfx
      );
      return workCard;
    },
    getHeaderInfo() { // TODO: Make acceptList a parameter
      const acceptList = ['value'];
      const result = {};
      const card = this.getItCard;
      _.each(card, (cardValue, cardKey) => {
        if (_.isArray(cardValue)) {
          _.each(cardValue, (deepValue) => {
            _.each(deepValue, (deepestValue, deepestKey) => {
              if (deepestKey === '@type') {
                result[deepestValue] = '';
              }
            });
            _.each(deepValue, (deepestValue, deepestKey) => {
              if (_.indexOf(acceptList, deepestKey) > -1 || this.isTitle(deepestKey)) {
                result[deepValue['@type']] += deepestValue;
              }
            });
          });
        } else {
          result[cardKey] = cardValue;
        }
      });
      return result;
    },
      // <li v-for="(k,v) in getItCard" track-by="$index">
      //     <div v-if="isArray(v)" v-for="item in v" track-by="$index">
      //       <span v-if="showType(item['@type'])">{{item['@type']}}: {{item.value}}</span>
      //       <span v-for="(x,y) in item" track-by="$index" v-if="isTitle(x)" v-bind:class="{'large-title': isTitle(x), 'medium-text': !isTitle(x)}">
      //         {{y}}
      //       </span>
      //       <span v-if="isTitle(item['@type'])"> ({{item['@type']}})</span>
      //     </div>
      //     <span v-if="!isArray(v)">{{v}}</span>
      //   </li>
  },
  components: {
  },
};
</script>

<template>
  <div class="header-component">
    <div class="instance-info">
      <ul>
        <li v-for="(k, v) in getHeaderInfo">
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
    </div>
  </div>
</template>

<style lang="less">
@import '../../../less/main_libris.less';

.header-component {
  padding: 20px;
  flex-direction: row;
  display: flex;

  .work-info {
    flex-grow: 2;
    color: white;
    background-color: @brand-primary;
    padding: 10px;
    text-align: center;
    border-radius: 2px;
  }

  .instance-info {
    flex-grow: 6;
    padding-right: 40px;
  }

  ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }


  .large-title {
    font-size: 26px;
    font-weight: bold;
  }

  .work-title {
    font-size: 22px;
    border-bottom: 1px solid white;
  }

  .medium-text {
    font-size: 16px;
  }

  .small-text {
    font-size: 13px;
  }
}

</style>
