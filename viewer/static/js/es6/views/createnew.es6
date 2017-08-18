import * as _ from 'lodash';
import View from './view';
import Vue from 'vue';
import Vuex from 'vuex';
import store from '../vuex/store';
import * as CombinedTemplates from '../templates/combinedTemplates.json';
import * as OtherTemplates from '../templates/otherTemplates.json';
import * as UserUtil from '../utils/user';
import * as VocabUtil from '../utils/vocab';
import * as RecordUtil from '../utils/record';
import * as DisplayUtil from '../utils/display';
import * as StringUtil from '../utils/string';
import { getSettings, getVocabulary, getDisplayDefinitions, getEditorData, getStatus, getKeybindState } from '../vuex/getters';
import { changeSettings, changeNotification, loadVocab, loadDisplayDefs, syncData, changeSavedStatus, changeStatus } from '../vuex/actions';

export default class CreateNew extends View {

  initialize() {
    super.initialize();
    const self = this;
    this.activeForm = '';
    this.transition = false;
    this.language = 'sv';

    VocabUtil.getVocab().then((vocab) => {
      self.initVue(vocab['@graph'], self.settings.vocabPfx);
    });
  }

  initVue(vocab, vocabPfx) {
    const self = this;
    Vue.use(Vuex);
    $('#app').show();

    Vue.filter('labelByLang', (label) => {
      // Filter for fetching labels from vocab
      let lbl = label;
      if (lbl && lbl.indexOf(vocabPfx) !== -1) {
        lbl = lbl.replace(vocabPfx, '');
      }
      const item = _.find(vocab, (d) => { return d['@id'] === `${vocabPfx}${lbl}` });
      if(!item) { console.warn(`${vocabPfx}${lbl} not found`); }
      let labelByLang = '';
      if (typeof item !== 'undefined' && item.labelByLang) {
        labelByLang = (item.labelByLang[self.language] || item.labelByLang['en']);
      }
      // Check if we have something of value
      if (labelByLang.length > 0) {
        return labelByLang;
      }
      return lbl;
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
        vocabPfx: self.settings.vocabPfx,
        vocab,
        chosenType: '',
        initialized: false,
        selectedIssuanceType: '',
        selectedCarrierType: '',
        selectedTemplate: '',
        selectedCreation: '',
        carrierTypes: [],
        templateMode: false,
      },
      watch: {
        'chosenType': function(newVal) {
          VocabUtil.getEnumerations(newVal, 'carrierType', this.vocab, this.settings.vocabPfx).then((result) => {
            this.carrierTypes = _.sortBy(result, item => this.getPrefLabelByLang(item));
          });
        },
      },
      methods: {
        updateChosenType(event) {
          this.chosenType = event.target.value;
        },
        getPrefLabelByLang(item) {
          const label = item.prefLabelByLang[self.language] || item.prefLabelByLang.en;
          if (typeof label === 'string') {
            return label;
          }
          return label.join(', ');
        },
        activateMode(mode) {
          if (mode === 'template') {
            this.templateMode = true;
          } else if (mode === 'compose') {
            this.templateMode = false;
          } else {
            this.selectedCreation = mode;
            this.materialList = this.getMaterials(mode);
          }
        },
        getMaterials(creation) {
          let allMaterials = [];
          allMaterials = allMaterials.concat(VocabUtil.getAllSubClasses([creation], this.vocab, this.settings.vocabPfx)
            .map(subClassId => subClassId.replace(this.settings.vocabPfx, '')));
          return _.sortBy(allMaterials, label => StringUtil.labelByLang(label, this.settings.language, this.vocab, this.settings.vocabPfx));
        },
      },
      computed: {
        hasChosenMaterials() {
          return (this.chosenType !== '');
        },
        hasChosenTemplate() {
          return (this.selectedTemplate !== '');
        },
        mainEntity() {
          if (this.selectedCreation === 'Instance') {
            let instanceIt = {};
            if (!this.templateMode) {
              instanceIt = {
                '@id': '_:TEMP_ID#it',
                '@type': this.chosenType,
                issuanceType: this.selectedIssuanceType,
                carrierType: this.selectedCarrierType,
              };
            }
            if (this.selectedTemplate !== '') {
              instanceIt = Object.assign({ '@id': '_:TEMP_ID#it' }, CombinedTemplates[this.selectedTemplate].value.mainEntity);
            }
            return instanceIt;
          }
          if (this.selectedCreation === 'Work') {
            const workEntity = {
              '@id': '_:TEMP_ID#it',
              '@type': this.chosenType,
            };
            return Object.assign(workEntity, OtherTemplates.work);
          }
          return {};
        },
        record() {
          if (this.selectedCreation === 'Instance') {
            let instanceRecord = {};
            instanceRecord = {
              '@type': 'Record',
              '@id': '_:TEMP_ID',
              'assigner': {
                '@id': `https://libris.kb.se/library/${this.settings.userSettings.currentSigel}`,
              },
              'marc:catalogingSource': {
                '@id': 'marc:CooperativeCatalogingProgram',
              },
              'descriptionLanguage': [
                {
                  '@id': 'https://id.kb.se/language/swe',
                  'code': 'swe',
                },
              ],
              'mainEntity': {
                '@id': '_:TEMP_ID#it',
              },
            };
            if (this.selectedTemplate !== '') {
              instanceRecord = Object.assign(instanceRecord, CombinedTemplates[this.selectedTemplate].value.record);
            }
            return instanceRecord;
          }
          if (this.selectedCreation === 'Work') {
            return {
              '@type': 'Record',
              '@id': '_:TEMP_ID',
              'assigner': {
                '@id': `https://libris.kb.se/library/${this.settings.userSettings.currentSigel}`,
              },
              'mainEntity': {
                '@id': '_:TEMP_ID#it',
              },
            };
          }
          return {};
        },
        postTemplate() {
          const obj = {
            '@graph': [
              this.record,
              this.mainEntity,
            ],
          };
          return obj;
        },
        issuanceTypes() {
          return _.sortBy(VocabUtil.getInstances('IssuanceType', this.vocab, this.settings.vocabPfx), label => {
            return StringUtil.labelByLang(label, self.language, this.vocab, this.settings.vocabPfx);
          });
        },
        getCombinedTemplates() {
          return CombinedTemplates;
        },
      },
      components: {
      },
      store,
      ready() {
        this.changeSettings(self.settings);
        this.initialized = true;
        console.log(CombinedTemplates['rdabook'].value);
      },
    });
  }

}
