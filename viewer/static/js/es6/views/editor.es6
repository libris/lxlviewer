import View from './view';
import * as httpUtil from '../utils/http';
import * as _ from 'lodash';
import * as VocabLoader from '../utils/vocabloader';
import LdTable from '../components/ldtable';

export default class Editor extends View {

  initialize() {
    super.initialize();
    VocabLoader.initVocabClicks();

    this.loadItem();
    const self = this;
    this.loadVocab().then((vocab) => {
      self.initVue(self.thing, self.meta, self.linked, vocab, self.vocabPfx);
    });
  }

  loadItem() {
    this.vocabPfx = 'kbv:';
    // Retrieves the data and splits it into a thing obj and array with links
    this.data = JSON.parse(document.getElementById('data').innerText)['@graph'];

    // TODO: Relying on order here... tsk tsk tsk.
    this.meta = this.data[0];
    this.data.splice(0, 1);

    // TODO: Do something else!
    console.warn('Finding focused item node by @id.indexOf("#it"). This approach is not reliable.');
    for (let i = 0; i < this.data.length; i++) {
      if (this.data[i]['@id'].indexOf('#it') !== -1) {
        this.thing = this.data[i];
        this.data.splice(i, 1);
        break;
      }
    }

    this.linked = [];
    for (let i = 0; i < this.data.length; i++) {
      if (this.data[i].hasOwnProperty('@graph')) {
        this.linked.push(this.data[i]['@graph']);
      } else {
        this.linked.push(this.data[i]);
      }
    }
  }

  loadVocab() {
    return new Promise((resolve, reject) => {
      httpUtil.getContent('/vocab/', 'application/ld+json').then((response) => {
        resolve(JSON.parse(response));
      }, (error) => {
        reject('Error loading vocabulary...', error);
      });
    });
  }

  initVue(thing, meta, linked, vocab, vocabPfx) {
    const self = this;

    $('#loadingText').hide();
    $('#editorApp').show();

    Vue.filter('labelByLang', (label) => {
      // Filter for fetching labels from vocab
      let lbl = label;
      if (lbl && lbl.indexOf(vocabPfx) !== -1) {
        lbl = lbl.replace(vocabPfx, '');
      }
      const item = _.find(vocab.descriptions, { '@id': `${vocabPfx}${lbl}` });
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
      el: '#editorApp',
      data: {
        thing,
        meta,
        linked,
        vocab,
        vocabPfx,
        saved: {
          loading: false,
          status: {
            error: false,
            info: '',
          },
        },
      },
      methods: {
        isArray(o) {
          return _.isArray(o);
        },
        isPlainObject(o) {
          return _.isPlainObject(o);
        },
        getMergedItems() {
          const obj = { '@graph': [] };
          obj['@graph'].push(this.meta);
          obj['@graph'].push(this.thing);
          for (let i = 0; i < this.linked.length; i++) {
            obj['@graph'].push({ '@graph': this.linked[i] });
          }
          return obj;
        },
        saveItem() {
          const obj = this.getMergedItems();
          this.doSave(obj);
        },
        doSave(obj) {
          this.saved.loading = true;

          // TODO: Relying on order here... tsk tsk tsk.
          const url = obj['@graph'][0]['@id'];

          const inputData = JSON.parse(document.getElementById('data').innerText);
          if (JSON.stringify(obj) === JSON.stringify(inputData)) {
            console.log("Save called WITHOUT changes.");
          } else {
            console.log("Save called WITH changes.");
          }

          httpUtil.put(obj, url, self.access_token).then(() => {
            vm.saved.loading = false;
            vm.saved.status = { error: false, info: 'Everything went alright.' };
          }, (error) => {
            vm.saved.loading = false;
            vm.saved.status = { error: true, info: error };
          });
        },
      },
      components: {
        'ld-table': LdTable,
      },
    });
  }
}
