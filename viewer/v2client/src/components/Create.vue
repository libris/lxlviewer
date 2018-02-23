<script>
import * as _ from 'lodash';
import * as CombinedTemplates from '@/resources/json/combinedTemplates.json';
import * as BaseTemplates from '@/resources/json/baseTemplates.json'; 
import * as VocabUtil from '@/utils/vocab';
import * as StringUtil from '@/utils/string';
import CreationCard from '@/components/createnew/creation-card';
import CreationTab from '@/components/createnew/creation-tab';

export default {
  name: 'create-new-form',
  data () {
    return {
      creationList: ['Instance', 'Work', 'Agent', 'Concept'],
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
    useBase(type) {
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
    useTemplate(templateValue) {
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
    setCreation(creation) {
      this.selectedCreation = creation;
      this.activeIndex = -1;
    },
    setActiveIndex(index) {
      this.activeIndex = index;
    },
  },
  events: {
  },
  computed: {
    user() {
      return this.$store.getters.user;
    },
    settings() {
      return this.$store.getters.settings;
    },
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
        'descriptionCreator': {
          '@id': `https://libris.kb.se/library/${this.user.settings.activeSigel}`,
        },
        'mainEntity': {
          '@id': 'https://id.kb.se/TEMPID#it',
        },
      };
      return baseRecord;
    },
    combinedTemplates() {
      return _.sortBy(CombinedTemplates[this.selectedCreation.toLowerCase()], template => template.label);
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
    'thingData': function() {
      this.$store.dispatch('pushNotification', { color: 'grey', message: StringUtil.getUiPhraseByLang('This action is not yet functional. We\'re working on it!', this.settings.language) });
    },
  },
  mounted() { // Ready method is deprecated in 2.0, switch to "mounted"
    this.$nextTick(() => {
      this.activeForm = '';
      this.transition = false;
      this.initialized = true;
    });
  },
};
</script>

<template>
  <div class="panel panel-default form-container Create" id="create-new-post">
    <div class="panel-body">
      <h1 class="Create-title">{{'Create new' | translatePhrase}}</h1>
        <creation-tab
          :creation-list="creationList"
          @set-creation="setCreation" />
        <div class="Create-cardCont">
          <creation-card
            :is-base="true"
            :creation="selectedCreation"
            :index="0"
            :active-index="activeIndex"
            @use-base="useBase"
            @set-active-index="setActiveIndex" />
          <creation-card
            v-for="(template, index) in combinedTemplates"
            :key="index"
            :is-base="false"
            :template="template"
            :index="index + 1"
            :active-index="activeIndex"
            @use-template="useTemplate"
            @set-active-index="setActiveIndex" />
        </div>
    </div>
  </div>
</template>

<style lang="less">

.Create {
  &-title {
    font-size: 1.5em;
    margin: 0 0 0.3em 0.7em;  
  }

  &-cardCont {
    display: flex;
    flex-wrap: wrap;
  }
}

</style>
