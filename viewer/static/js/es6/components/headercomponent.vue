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
    <span class="instance-info">
      <ul>
        <!-- <li v-for="instanceInfoItem in instanceInfo">
          <div>{instanceInfoItem}</div>
        </li> -->
        <li class="main-title">
          <div>{{instance.hasTitle[0].mainTitle}}</div>
        </li>
        <li class="responsibility-statement">
          <div>{{instance.responsibilityStatement}}</div>
        </li>
        <li class="provision-activity">
          <div>
            Some information regarding provision activity
            <!-- {{editUtil.getLinked((publication.agent['@id']), linked)+editUtil.getLinked((publicationCountry['@id']), linked)+editUtil.getLinked((publication.place['@id']), linked)+(publication.date)}} -->
            
          </div>
        </li>
        <li class="identifier">
          {{instance.identifiedBy[0]['@type']+': '+instance.identifiedBy[0].value}}
        </li>
        <li class="other-physical-details">
          {{instance.extent || "No information on physical details"}}
        </li>
      </ul>
    </span>
    <span class="work-info">
      <ul>
        <li>
          <div class="main-title">
            Verkinformation
          </div>
        </li>
        <li>
          <div class="main-title">
            {{editUtil.getLinked(work.expressionOf['@id'], linked) || No worktitel}}
          </div>
        </li>
        <li>
          <div class="work-info-text">
            Other information
          </div>
        </li>
        <li>
          <div class="work-info-text">
            Relevant stuff
          </div>
        </li>
        <li>
          <div class="work-info-text">
            More info is great
          </div>
        </li>
        <!-- <li v-for="workInfoItem in workInfo">
          <div>{workInfoItem}</div>
        </li> -->
      </ul>
    </span>
  </div>
</template>

<style lang="less">

.header-component {
  padding: 20px;
  display: flex;
  flex-direction: row;
}


.main-title {
  font-size: 26px;
}
.subtitle {
  font-size: 22px;
}
.responsibility-statement {
  font-size: 18px;
}
.provision-activity {
  font-size: 18px;
}
.idenfier {
  font-size: 18px;
}
.other-physical-details {
  font-size: 14px;
}
.record {
  font-size: 14px;
}

.work-info-text {
  font-size: 18px;
}

.work-info {
  order: 2;
  color: white;
  background-color: #009788;
  padding: 10px;
  text-align: center;
  border-radius: 2px;
}

.instance-info {
  order: 1;
  flex-grow: 6;
  padding-right: 40px;
}

</style>
