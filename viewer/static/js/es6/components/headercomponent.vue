<script>
import * as editUtil from '../utils/edit'
import { getVocabulary, getSettings, getEditorData } from '../vuex/getters';

export default {
  name: 'header-component',
  vuex: {
    getters: {
      vocab: getVocabulary,
      settings: getSettings,
      editorData: getEditorData,
    }
  },
  props: {
  },
  data: function() {
    return {
      expandedHeader: false
    }
  },
  computed: {
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
  methods: {
  },
  components: {
  },
};
</script>

<template>
  <div class="header-component">
    <div class="instance-info">
      <ul>
        <!-- <li v-for="instanceInfoItem in instanceInfo">
          <div>{instanceInfoItem}</div>
        </li> -->
        <li class="large-title">
          <div>{{instance.hasTitle[0].mainTitle}}</div>
        </li>
        <li class="medium-text">
          <div>{{instance.responsibilityStatement}}</div>
        </li>
        <li class="medium-text">
          <div>
            Some information regarding provision activity
            <!-- {{editUtil.getLinked((publication.agent['@id']), linked)+editUtil.getLinked((publicationCountry['@id']), linked)+editUtil.getLinked((publication.place['@id']), linked)+(publication.date)}} -->
            
          </div>
        </li>
        <li class="small-text">
          {{instance.identifiedBy[0]['@type']+': '+instance.identifiedBy[0].value}}
        </li>
        <li class="small-text">
          {{instance.extent || "No information on physical details"}}
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
