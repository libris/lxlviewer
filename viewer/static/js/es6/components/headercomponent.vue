<script>
import * as _ from 'lodash';
import * as editUtil from '../utils/edit';
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
    showType(type) {
      // TODO: Look into different solution on typeList
      const typeList = ['ISBN'];
      return ~typeList.indexOf(type);
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
        for (let i = 0; i < baseClasses.length; i++) {
          propertyList = DisplayUtil.getProperties(
            baseClasses[i].replace(this.settings.vocabPfx, ''),
            'cards',
            this.display
          );
          if (propertyList.length > 0) {
            break;
          }
        }
      }
      for (let i = 0; i < propertyList.length; i++) {
        if (item[propertyList[i]]) {
          displayObj[propertyList[i]] = item[propertyList[i]];
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
  },
  components: {
  },
};
</script>

<template>
  <div class="header-component">
    <div class="instance-info">
      <ul>
        <li v-for="(k,v) in getItCard" track-by="$index">
          <div v-if="isArray(v)" v-for="item in v" track-by="$index">
            <span v-if="showType(item['@type'])">{{item['@type']}}: {{item.value}}</span>
            <span v-for="(x,y) in item" track-by="$index" v-if="isTitle(x)" v-bind:class="{'large-title': isTitle(x), 'medium-text': !isTitle(x)}">
              {{y}}
            </span>
            <span v-if="isTitle(item['@type'])"> ({{item['@type']}})</span>
          </div>
          <span v-if="!isArray(v)">{{v}}</span>
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
