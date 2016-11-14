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
  },
  data: function() {
    return {
      expandedHeader: false
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
  },
  computed: {
    getCard() {
      const card = DisplayUtil.getCard(this.editorData.it, this.display, this.editorData.linked, this.vocab, this.settings.vocabPfx);
      console.log(JSON.stringify(card));
      return card;
    },
    instance() {
      return this.editorData.it;
    },
    work() {
      return this.editorData.work;
    },
    record() {
      return this.editorData.record;
    },
    publication() {
      return this.editorData.it.publication[0];
    },
    publicationCountry() {
      return this.editorData.it.publicationCountry[0];
    },
    linked() {
      return this.editorData.linked;
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
        <li v-for="(k,v) in getCard">
          <span v-if="isArray(v)" v-for="item in v" track-by="$index">
            <span v-for="(x,y) in item">
              <span v-bind:class="{'large-title': isTitle(x), 'medium-text': !isTitle(x) }">
                {{y}}<span v-if="x === '@type'">:</span>
              </span>
            </span>
          </span>
          <span v-if="!isArray(v)">{{v}}</span>
        </li>
      </ul>
    </div>

    <div class="work-info">
      <ul>
        <li>
          <div class="work-title">
            Verkinformation
          </div>
        </li>
        <li>
          <div class="medium-text">
            {{editUtil.getLinked(work.expressionOf['@id'], linked) || "No worktitle"}}
          </div>
        </li>
        <li>
          <div class="medium-text">
            Other information
          </div>
        </li>
        <li>
          <div class="medium-text">
            Relevant stuff
          </div>
        </li>
        <li>
          <div class="medium-text">
            More info is great
          </div>
        </li>
        <!-- <li v-for="workInfoItem in workInfo">
          <div>{workInfoItem}</div>
        </li> -->
      </ul>
    </div>
  </div>
</template>

<style lang="less">

.header-component {
  padding: 20px;
  flex-direction: row;
  display: flex; 

  .work-info {
    flex-grow: 2;
    color: white;
    background-color: #009788;
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
