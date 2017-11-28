<script>
import * as _ from 'lodash';
import * as CombinedTemplates from '../templates/combinedTemplates.json';
import * as BaseTemplates from '../templates/baseTemplates.json';
import * as VocabUtil from '../utils/vocab';
import * as StringUtil from '../utils/string';
import CreationCard from '../components/creation-card';
import CreationTab from '../components/creation-tab';
import { getUser, getSettings, getContext, getVocabulary, getVocabularyClasses } from '../vuex/getters';


export default {
  name: 'create-new-form',
  vuex: {
    getters: {
      user: getUser,
      context: getContext,
      settings: getSettings,
      vocab: getVocabulary,
      vocabClasses: getVocabularyClasses,
    },
  },
  props: {
  },
  data() {
    return {
      materialList: [],
      creationList: ['Instance', 'Work', 'Agent', 'Concept'],
      vocabPfx: this.settings.vocabPfx,
      chosenType: '',
      selectedCreation: 'Instance',
      thingData: {},
      activeIndex: -1,
    }
  },
  methods: {
    getPrefLabelByLang(item) {
      const label = item.prefLabelByLang[self.language] || item.prefLabelByLang.en;
      if (typeof label === 'string') {
        return label;
      }
      return label.join(', ');
    },
    getMaterials(creation) {
      let allMaterials = [];
      allMaterials = allMaterials.concat(VocabUtil.getAllSubClasses([`${this.settings.vocabPfx}${creation}`], this.vocabClasses, this.settings.vocabPfx)
        .map(subClassId => subClassId.replace(this.settings.vocabPfx, '')));
      this.materialList = _.sortBy(allMaterials, label => StringUtil.getLabelByLang(label, this.settings.language, this.vocab, this.settings.vocabPfx, this.context));
    },
  },
  events: {
    'use-base'(type) {
      this.chosenType = type;
      const baseRecord = Object.assign(this.baseRecord, BaseTemplates[this.selectedCreation.toLowerCase()].record);
      const baseMainEntity = Object.assign(this.baseMainEntity, BaseTemplates[this.selectedCreation.toLowerCase()].mainEntity);
      this.thingData = {
        '@graph': [
          baseRecord,
          baseMainEntity,
        ],
      };
    },
    'use-template'(templateValue) {
      const templateRecord = Object.assign(this.baseRecord, templateValue.record);
      const templateMainEntity = Object.assign(this.baseMainEntity, templateValue.mainEntity);

      // CLEAN IDS
      templateRecord['@id'] = 'https://id.kb.se/TEMPID';
      templateMainEntity['@id'] = 'https://id.kb.se/TEMPID#it';

      this.thingData = {
        '@graph': [
          templateRecord,
          templateMainEntity,
        ],
      };
    },
    'set-creation'(creation) {
      this.selectedCreation = creation;
      this.activeIndex = -1;
    },
    'set-active-index'(index) {
      this.activeIndex = index;
    },
  },
  computed: {
    baseMainEntity() {
      const baseMainEntity = {
        '@id': 'https://id.kb.se/TEMPID#it',
        '@type': this.chosenType,
      };
      return baseMainEntity;
    },
    baseRecord() {
      const baseRecord = {
        '@type': 'Record',
        '@id': 'https://id.kb.se/TEMPID',
        'assigner': {
          '@id': `https://libris.kb.se/library/${this.user.settings.activeSigel}`,
        },
        'mainEntity': {
          '@id': 'https://id.kb.se/TEMPID#it',
        },
      };
      return baseRecord;
    },
    combinedTemplates() {
      return CombinedTemplates[this.selectedCreation.toLowerCase()];
    },
    hasChosen() {
      return this.activeIndex > 0 || (this.activeIndex === 0 && this.chosenType);
    },
  },
  components: {
    'creation-card': CreationCard,
    'creation-tab': CreationTab,
  },
  watch: {
    'selectedCreation': function(newVal) {
      this.getMaterials(newVal);
    },
    'thingData': function() {
      document.getElementById('thingDataForm').submit();
    },
  },
  ready() { // Ready method is deprecated in 2.0, switch to "mounted"
    this.$nextTick(() => {
      this.activeForm = '';
      this.transition = false;
      this.getMaterials('Instance');
    });
  },
};
</script>

<template>
  <div class="panel panel-default form-container" id="create-new-post">
    <div class="panel-body">
      <div class="createnew-form">
        <div class="app-heading">{{'Create new' | translatePhrase}}</div>
        <creation-tab :creation-list="creationList"></creation-tab>
        <div class="creation-cards-container">
          <creation-card v-show="selectedCreation !== 'Agent' && selectedCreation !== 'Concept'" :is-base="true" :material-list="materialList" :index="0" :active-index="activeIndex"></creation-card>
          <creation-card v-for="template in combinedTemplates" :is-base="false" :template="template" :index="$index + 1" :active-index="activeIndex"></creation-card>
        </div>
        <form action="/edit" method="POST" id="thingDataForm">
          <textarea id="copyItem" name="data" class="hidden">{{thingData | json}}</textarea>
        </form>
      </div>
    </div>
  </div>
</template>

<style lang="less">
@import './_variables.less';

#create-new-post {
  .app-heading {
    font-size: 1.5em;
    margin: 0 0 0.3em 0.7em;
  }
  .creation-cards-container {
    display: flex;
    flex-wrap: wrap;
  }
}

</style>
