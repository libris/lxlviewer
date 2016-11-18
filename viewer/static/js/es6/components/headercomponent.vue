<script>
import * as _ from 'lodash';
import * as editUtil from '../utils/edit';
import * as DisplayUtil from '../utils/display';
import { getVocabulary, getSettings, getEditorData, getDisplayDefinitions } from '../vuex/getters';

export default {
  name: 'header-component',
  vuex: {
    getters: {
      vocab: getVocabulary,
      settings: getSettings,
      editorData: getEditorData,
      display: getDisplayDefinitions,
    }
  },
  props: {
    status,
  },
  data: function() {
    return {

    }
  },
  methods: {
    isArray(o) {
      return _.isArray(o);
    },
    isTitle(key) {
      let k = key.toLowerCase();
      return ~k.indexOf('title');
    },
    isObject(obj) {
      return _.isObject(obj);
    },
  },
  computed: {
    getItCard() {
      const itCard = DisplayUtil.getCard(this.editorData.it, this.display, this.editorData.linked, this.vocab, this.settings.vocabPfx);
      return itCard;
    },
    getWorkCard() {
      const workCard = DisplayUtil.getCard(this.editorData.work, this.display, this.editorData.linked, this.vocab, this.settings.vocabPfx);
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
        <li v-for="(k,v) in getItCard">
          <span v-if="isArray(v)" v-for="item in v" track-by="$index">
            <span v-for="(x,y) in item">
              <span v-bind:class="{'large-title': isTitle(k), 'medium-text': !isTitle(k) }">
                {{y}}<span v-if="x === '@type'">:</span>
              </span>
            </span>
          </span>
          <span v-if="!isArray(v)">{{v | json}}</span>
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
