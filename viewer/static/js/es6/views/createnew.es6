import * as _ from 'lodash';
import View from './view';
import Vue from 'vue';
import * as UserUtil from '../utils/user';
import * as VocabUtil from '../utils/vocab';
import * as httpUtil from '../utils/http';

export default class CreateNew extends View {

  initialize() {
    super.initialize();

    const self = this;
    this.activeForm = '';
    this.transition = false;

    const choices = [
      { trigger: 'import', title: 'Importera', icon: 'download', text: 'Välj extern databas och importera en post som du kan använda som underlag för en ny bibliografisk instans.' },
      { trigger: 'copy', title: 'Kopiera', icon: 'files-o', text: 'Ange Libris URI för en befintlig bibliografisk entitet som du vill ta med dig information om till en ny bibliografisk instans.' },
      { trigger: 'from_material', title: 'Från materialtyper', icon: 'list', text: 'Välj från en lista av materialtyper och egenskaper för att skapa en ny bibliografisk instans.' },
    ];
    const baseMaterials = [
      'CreativeWork',
      'Aggregate',
    ];

    VocabUtil.getVocab().then((vocab) => {
      self.initVue(vocab, self.vocabPfx, choices, baseMaterials);
    });
  }

  fetchDatabases() {
    return new Promise((resolve, reject) => {
      // TODO: fix url
      httpUtil.getContent('/_remotelist').then((response) => {
        resolve(response);
      }, (error) => {
        reject('Error loading databases...', error);
      });
    });
  }

  getMaterials(baseMaterials, vocab) {
    const self = this;
    const materialLists = [];
    for (let i = 0; i < baseMaterials.length; i++) {
      const materialList = {
        id: baseMaterials[i],
        list: VocabUtil.getSubClasses(baseMaterials[i], vocab, self.vocabPfx),
      };
      materialLists[i] = materialList;
    }
    return materialLists;
  }

  initVue(vocab, vocabPfx, choices, baseMaterials) {
    const self = this;
    const materialLists = self.getMaterials(baseMaterials, vocab);
    $('#app').show();

    Vue.filter('labelByLang', (label) => {
      // Filter for fetching labels from vocab
      let lbl = label;
      if (lbl && lbl.indexOf(vocabPfx) !== -1) {
        lbl = lbl.replace(vocabPfx, '');
      }
      const item = _.find(vocab.descriptions, (d) => { return d['@id'] === `${vocabPfx}${lbl}` });
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
        choices,
        materialLists,
        selectedChoice: '',
        chosenMaterials: [],
        vocabPfx: 'kbv:',
        language: self.language,
        vocab,
        databases: { state: '', list: [] },
      },
      methods: {
        createNew() {
          if (this.chosenMaterials.length == 0) {
            return;
          }
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
        loadRemoteDatabases() {
          const vself = this;
          vself.databases.state = 'loading';
          self.fetchDatabases().then(function(response) {
            const dbs = JSON.parse(response);
            const newDbList = [];
            for (let i = 0; i < dbs.length; i++) {
              newDbList.push({ item: dbs[i], active: false });
            }
            vself.databases.list = newDbList;
            vself.databases.state = 'complete';
          }, function(error) {
            vself.databases.state = 'error';
          });
        },
      },
      ready: function() {
        this.loadRemoteDatabases();
      },
      computed: {
        hasChosenMaterials() {
          return (this.chosenMaterials.length !== 0);
        },
        selectedDatabases() {
          return _.filter(this.databases.list, function (o) {
            return o.active;
          });
        },
      },
      components: {
      },
    });
  }

}
