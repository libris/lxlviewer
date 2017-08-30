import * as _ from 'lodash';
import View from './view';
import Vue from 'vue';
import Vuex from 'vuex';
import store from '../vuex/store';
import * as CombinedTemplates from '../templates/combinedTemplates.json';
import * as BaseTemplates from '../templates/baseTemplates.json';
import * as UserUtil from '../utils/user';
import * as VocabUtil from '../utils/vocab';
import * as RecordUtil from '../utils/record';
import * as DisplayUtil from '../utils/display';
import * as StringUtil from '../utils/string';
import CreationCard from '../components/creation-card';
import CreationTab from '../components/creation-tab';
import { getSettings, getVocabulary, getDisplayDefinitions, getEditorData, getStatus, getKeybindState } from '../vuex/getters';
import { changeSettings, changeNotification, loadVocab, loadVocabMap, loadDisplayDefs, syncData, changeSavedStatus, changeStatus } from '../vuex/actions';

export default class CreateNew extends View {

  initialize() {
    super.initialize();
    const self = this;
    this.activeForm = '';
    this.transition = false;
    this.language = 'sv';

    VocabUtil.getVocab().then((vocab) => {
      self.vocabMap = new Map(vocab['@graph'].map((entry) => [entry['@id'], entry]));
      self.vocab = vocab['@graph'];
      self.initVue();
    });
  }

  initVue() {
    const self = this;
    Vue.use(Vuex);
    $('#app').show();

    Vue.filter('labelByLang', (label) => {
      return StringUtil.labelByLang(label, self.settings.language, self.vocabMap, self.settings.vocabPfx);
    });

    Vue.filter('translatePhrase', (string) => {
      return StringUtil.getUiPhraseByLang(string, self.settings.language);
    });

    self.vm = new Vue({
      el: '#app',
      vuex: {
        actions: {
          syncData,
          loadVocab,
          loadVocabMap,
          loadDisplayDefs,
          changeSettings,
          changeSavedStatus,
          changeStatus,
          changeNotification,
        },
        getters: {
          settings: getSettings,
          editorData: getEditorData,
          vocab: getVocabulary,
          display: getDisplayDefinitions,
          status: getStatus,
          keybindState: getKeybindState,
        },
      },
      data: {
        materialList: [],
        creationList: ['Instance', 'Work', 'Agent', 'Concept'],
        vocabPfx: self.settings.vocabPfx,
        chosenType: 'Instance',
        initialized: false,
        selectedCreation: 'Instance',
        thingData: {},
        activeIndex: -1,
      },
      watch: {
        'selectedCreation': function(newVal) {
          this.getMaterials(newVal);
        },
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
          allMaterials = allMaterials.concat(VocabUtil.getAllSubClasses([`${this.settings.vocabPfx}${creation}`], this.vocab, this.settings.vocabPfx)
            .map(subClassId => subClassId.replace(this.settings.vocabPfx, '')));
          this.materialList = _.sortBy(allMaterials, label => StringUtil.labelByLang(label, this.settings.language, this.vocab, this.settings.vocabPfx));
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
            '@id': '_:TEMP_ID#it',
            '@type': this.chosenType,
          };
          return baseMainEntity;
        },
        baseRecord() {
          const baseRecord = {
            '@type': 'Record',
            '@id': '_:TEMP_ID',
            'assigner': {
              '@id': `https://libris.kb.se/library/${this.settings.userSettings.currentSigel}`,
            },
            'mainEntity': {
              '@id': '_:TEMP_ID#it',
            },
          };
          return baseRecord;
        },
        combinedTemplates() {
          return CombinedTemplates[this.selectedCreation.toLowerCase()];
        },
        hasChosen() {
          return this.activeIndex > -1;
        },
      },
      components: {
        'creation-card': CreationCard,
        'creation-tab': CreationTab,
      },
      store,
      ready() {
        this.changeSettings(self.settings);
        this.loadVocab(self.vocab);
        this.loadVocabMap(self.vocabMap);
        this.initialized = true;
        this.getMaterials('Instance');
      },
    });
  }

}
