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
    // Retrieves the data and splits it into a thing obj and array with links
    this.data = JSON.parse(document.getElementById('data').innerText)['@graph'];
    this.meta = this.data[0];
    this.thing = this.data[1];
    this.data.splice(0, 2);
    this.vocabPfx = 'kbv:';

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
      if (lbl.indexOf(vocabPfx) !== -1) {
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
        removeItem(key, item) {
          thing[key].$remove(item);
        },
        addItem(key, item) {
          this.linked.push(item);
          const newItem = { '@id': item['@id'] };
          thing[key].push(newItem);
        },
        addAnonymous(key, item) {
          thing[key].push(item);
        },
        isArray(o) {
          return _.isArray(o);
        },
        isPlainObject(o) {
          return _.isPlainObject(o);
        },
        saveItem() {
          this.saved.loading = true;

          const obj = this.thing;
          const url = thing['@id'];

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
