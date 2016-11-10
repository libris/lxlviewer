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
    <div class="header-row-top">
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
    <div class="header-row-bottom">
      <div class="admin-data">
        {{"Created: " + record.creationDate}}
      </div>
      <div class="expand-icon">
        <i class="fa fa-chevron-down" aria-hidden="true"></i>
      </div>
      <div class="admin-data">
        {{"Edited: " + record.changeDate}}
      </div>
    </div>
  </div>
</template>

<style lang="less">

.header-component {
  padding: 20px;
  -webkit-box-shadow: 0px 10px 5px 0px rgba(187,187,187,0.5);
  -moz-box-shadow: 0px 10px 5px 0px rgba(187,187,187,0.5);
  box-shadow: 0px 10px 5px 0px rgba(187,187,187,0.5);
  border-radius: 0px 0px 15px 15px;
  margin-bottom: 400px;

  .header-row-top {
    flex-direction: row;
    display: flex;
    margin-bottom: 20px;
  }

  .header-row-bottom {
    flex-direction: row;
    display: flex;
    padding-top: 20px;
    border-top: 1px solid #EEEEEE;
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

  .admin-data {
    font-size: 10px;
    flex-grow: 1;
    text-align: center;
  }

  .expand-icon {
    cursor: pointer;
  }

  .work-info {
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
}



</style>
