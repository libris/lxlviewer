import View from './view';
import * as httpUtil from '../utils/http';
import * as _ from 'lodash';
import * as VocabLoader from '../utils/vocabloader';

export default class Editor extends View {

  initialize() {
    super.initialize();
    VocabLoader.initVocabClicks();

    this.loadItem();
    const self = this;
    this.loadVocab().then((vocab) => {
      self.initVue(self.thing, self.linked, vocab);
    });
  }

  loadItem() {
    this.data = JSON.parse(document.getElementById('data').innerText)['@graph'];
    this.thing = this.data[0];
    this.data.splice(0, 1);

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

  initVue(thing, linked, vocab) {
    const self = this;

    $('#loadingText').hide();
    $('#editorApp').show();

    Vue.filter('labelByLang', (label) => {
      // Filter for fetching labels from vocab
      const preferredVocab = 'kbv';
      const item = _.find(vocab.descriptions, { '@id': `${preferredVocab}:${label}` });
      let labelByLang = '';
      if (typeof item !== 'undefined' && item.labelByLang) {
        labelByLang = item.labelByLang[self.language];
      }
      // Check if we have something of value
      if (labelByLang.length > 0) {
        return labelByLang;
      }
      return label;
    });

    new Vue({
      el: '#editorApp',
      data: {
        thing,
        linked,
        saved: {
          loading: false,
          status: 'normal',
        },
      },
      methods: {
        removeItem(key, item) {
          thing[key].$remove(item);
        },
        addItem(key) {
           // TODO: Show to UX people and watch their reaction
          const tempInput = prompt('Give id plix', '');
          const newItem = { '@id': tempInput, prefLabel: tempInput };
          thing[key].push(newItem);
        },
        isArray(o) {
          return _.isArray(o);
        },
        isPlainObject(o) {
          return _.isPlainObject(o);
        },
        saveItem() {
          this.saved.loading = true;
          this.saved.status = 'normal';

          const vueSelf = this;
          const obj = JSON.stringify(this.thing);
          const url = '/create';

          httpUtil.post(obj, url).then((response) => {
            vueSelf.saved.loading = false;
            vueSelf.saved.status = 'success';
            setTimeout(() => {
              vueSelf.saved.status = 'normal';
            }, 750);
          }, (error) => {
            vueSelf.saved.loading = false;
            vueSelf.saved.status = 'fail';
            setTimeout(() => {
              vueSelf.saved.status = 'normal';
            }, 750);
          });
        },
      },
      components: {
        'data-node': {
          template: '#data-node',
          name: 'data-node',
          props: ['key', 'value', 'index'],
          methods: {
            getLinked(id) {
              const index = this.index;
              if (typeof index === 'undefined') {
                return {};
              }
              for (let i = 0; i < index.length; i ++) {
                if (index[i]['@id'] === id) {
                  return index[i];
                }
              }
              return {};
            },
            isMarc(key) {
              if (typeof key === 'undefined') {
                return false;
              }
              return (
                !!~key.indexOf('marc:') || !!~key.indexOf('_marc')
              );
            },
            isArray(o) {
              return _.isArray(o);
            },
            isPlainObject(o) {
              return _.isPlainObject(o);
            },
            removeItem(key, value) {
              return this.$parent.removeItem(key, value);
            },
          },
        },
      },
    });
  }
}
