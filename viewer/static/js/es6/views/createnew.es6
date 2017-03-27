import * as _ from 'lodash';
import View from './view';
import Vue from 'vue';
import * as UserUtil from '../utils/user';
import * as VocabUtil from '../utils/vocab';
import * as httpUtil from '../utils/http';
import * as RecordUtil from '../utils/record';
import * as DisplayUtil from '../utils/display';

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

    const vm = new Vue({
      el: '#app',
      data: {
        materialLists,
        chosenMaterials: [],
        vocabPfx: self.settings.vocabPfx,
        language: self.settings.language,
        sigel: self.settings.userInfo.sigel,
        vocab,
        chosenType: '',
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
          const itemData = {
            '@graph': [
              {
                '@type': 'Record',
                'assigner': this.sigel,
                'mainEntity': {
                  '@id': '_:TEMP_ID',
                },
              },
              {
                '@id': '_:TEMP_ID',
                '@type': this.chosenType,
              },
            ],
          };
          return itemData;
        },
      },
      components: {
      },
    });
  }

}
