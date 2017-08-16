import * as _ from 'lodash';
import View from './view';
import Vue from 'vue';
import Vuex from 'vuex';
import store from '../vuex/store';
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
      self.initVue(vocab['@graph'], self.settings.vocabPfx, self.settings.baseMaterials);
    });
  }

  getMaterials(baseMaterials, vocab) {
    const self = this;
    let allMaterials = [];
    _.each(baseMaterials, type => {
      const typeInArray = [].concat(type);
      allMaterials = allMaterials.concat(VocabUtil.getAllSubClasses(typeInArray, vocab, self.settings.vocabPfx)
        .map(subClassId => subClassId.replace(self.settings.vocabPfx, '')));
    });
    return _.sortBy(allMaterials, label => StringUtil.labelByLang(label, self.language, vocab, this.settings.vocabPfx));
  }

  initVue(vocab, vocabPfx, baseMaterials) {
    const self = this;
    Vue.use(Vuex);
    const materialLists = self.getMaterials(baseMaterials, vocab);
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
        materialLists,
        chosenMaterials: [],
        vocabPfx: self.settings.vocabPfx,
        vocab,
        chosenType: '',
        initialized: false,
        selectedIssuanceType: '',
        selectedCarrierType: '',
        carrierTypes: [],
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
      },
      computed: {
        hasChosenMaterials() {
          return (this.chosenType !== '');
        },
        itemData() {
          const obj = {
            '@graph': [
              {
                '@type': 'Record',
                '@id': '_:TEMP_ID',
                'assigner': {
                  '@id': `https://libris.kb.se/library/${this.settings.userSettings.currentSigel}`,
                },
                'mainEntity': {
                  '@id': '_:TEMP_ID#it',
                },
              },
              {
                '@id': '_:TEMP_ID#it',
                '@type': this.chosenType,
                issuanceType: this.selectedIssuanceType,
                carrierType: this.selectedCarrierType,
              },
            ],
          };
          return obj;
        },
        issuanceTypes() {
          return _.sortBy(VocabUtil.getInstances('IssuanceType', this.vocab, this.settings.vocabPfx), label => {
            return StringUtil.labelByLang(label, self.language, this.vocab, this.settings.vocabPfx);
          });
        },
      },
      components: {
      },
      store,
      ready() {
        this.changeSettings(self.settings);
        this.initialized = true;
      },
    });
  }

}
