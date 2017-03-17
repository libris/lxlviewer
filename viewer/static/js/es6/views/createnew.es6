import * as _ from 'lodash';
import View from './view';
import Vue from 'vue';
import * as UserUtil from '../utils/user';
import * as VocabUtil from '../utils/vocab';
import * as httpUtil from '../utils/http';
import * as RecordUtil from '../utils/record';

export default class CreateNew extends View {

  initialize() {
    super.initialize();
    const self = this;
    this.activeForm = '';
    this.transition = false;

    const baseMaterials = [
      'CreativeWork',
      'Aggregate',
    ];

    VocabUtil.getVocab().then((vocab) => {
      self.initVue(vocab, self.settings.vocabPfx, baseMaterials);
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
        labelByLang = item.labelByLang[self.language];
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
        vocab,
      },
      watch: {
      },
      methods: {
        createNew() {
          if (this.chosenMaterials.length === 0) return;
          const m = _.filter(this.chosenMaterials, (o) => {
            return o && o.length > 0;
          });
          const params = '@type=' + JSON.stringify(m);
          window.location.href = '/new/record?' + params;
        },
        setMaterial(index, material) {
          const m = material.replace(vocabPfx, '');
          this.chosenMaterials.$set(index, m);
        },
      },
      computed: {
        hasChosenMaterials() {
          return (this.chosenMaterials.length !== 0);
        },
      },
      components: {
      },
    });
  }

}
