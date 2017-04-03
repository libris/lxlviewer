import * as _ from 'lodash';
import View from './view';
import Vue from 'vue';
import Vuex from 'vuex';
import store from '../vuex/store';
import * as UserUtil from '../utils/user';
import * as VocabUtil from '../utils/vocab';
import * as RecordUtil from '../utils/record';
import * as DisplayUtil from '../utils/display';
import { getSettings, getVocabulary, getDisplayDefinitions, getEditorData, getStatus, getKeybindState } from '../vuex/getters';
import { changeSettings, changeNotification, loadVocab, loadDisplayDefs, syncData, changeSavedStatus, changeStatus } from '../vuex/actions';

export default class CreateNew extends View {

  initialize() {
    super.initialize();
    const self = this;
    this.activeForm = '';
    this.transition = false;
    this.language = 'sv';

    const baseMaterials = [
      'Instance',
      'Work',
      'UniformWork',
      'Person',
      'Organization',
      'Meeting',
      'Event',
      'GenreFormTerm',
      'TopicalTerm',
    ];

    VocabUtil.getVocab().then((vocab) => {
      self.initVue(vocab['@graph'], self.settings.vocabPfx, baseMaterials);
    });
  }

  getMaterials(baseMaterials, vocab) {
    const self = this;
    const materialLists = [];
    for (let i = 0; i < baseMaterials.length; i++) {
      const materialList = {
        id: baseMaterials[i],
        list: VocabUtil.getSubClasses(baseMaterials[i], vocab, self.settings.vocabPfx),
      };
      materialLists[i] = materialList;
    }
    return materialLists;
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
      },
      watch: {
      },
      methods: {
        updateChosenType(event) {
          this.chosenType = event.target.value;
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
                  '@id': `https://libris.kb.se/library/${this.settings.userInfo.sigel}`,
                },
                'mainEntity': {
                  '@id': '_:TEMP_ID#it',
                },
              },
              {
                '@id': '_:TEMP_ID#it',
                '@type': this.chosenType,
              },
            ],
          };
          return obj;
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
