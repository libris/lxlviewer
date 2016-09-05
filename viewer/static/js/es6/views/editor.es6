import View from './view';
import Vue from 'vue';
import * as editUtil from '../utils/edit';
import * as httpUtil from '../utils/http';
import * as toolbarUtil from '../utils/toolbar';
import * as _ from 'lodash';
import * as VocabLoader from '../utils/vocabloader';
import * as VocabUtil from '../utils/vocab';
import * as RecordUtil from '../utils/record';
import * as UserUtil from '../utils/user';
import FormComponent from '../components/formcomponent';
import EditorControls from '../components/editorcontrols';
import Notifications from '../components/notifications';

export default class Editor extends View {

  initialize() {
    super.initialize();
    VocabLoader.initVocabClicks();
    toolbarUtil.initToolbar(this);

    this.loadItem();
    const self = this;
    VocabUtil.getVocab().then((vocab) => {
      self.initVue(self.thing, self.meta, self.linked, vocab, self.vocabPfx, self.language);
    });
  }

  populateHolding(meta, thing) {
    const emptyHolding = JSON.stringify(RecordUtil.getEmptyHolding(thing['@id'], UserUtil.get('sigel')));
    $('#holdingItem').text(emptyHolding);
  }

  loadItem() {
    // Retrieves the data and splits it into a thing obj and array with links
    this.data = JSON.parse(document.getElementById('data').innerText)['@graph'];

    // TODO: Relying on order here... tsk tsk tsk.
    this.meta = this.data[0];
    this.data.splice(0, 1);

    // TODO: Do something else!
    console.warn('Finding focused item node by @id.indexOf("#it"). This approach is not reliable.');
    for (let i = 0; i < this.data.length; i++) {
      if (this.data[i]['@id'] && this.data[i]['@id'].indexOf('#it') !== -1) {
        this.thing = this.data[i];
        this.data.splice(i, 1);
        break;
      }
    }
    if(!this.thing && this.data.length >= 0) {
      this.thing = this.data[0];
      this.data.splice(0, 1);
    }

    this.linked = [];
    for (let i = 0; i < this.data.length; i++) {
      if (this.data[i].hasOwnProperty('@graph')) {
        this.linked.push(this.data[i]['@graph']);
      } else {
        this.linked.push(this.data[i]);
      }
    }

    this.populateHolding(this.meta, this.thing);
  }

  initVue(thing, meta, linked, vocab, vocabPfx, lang) {
    const self = this;
    $('#loadingText').fadeOut('slow', function() {
      $('#editorApp').fadeIn('slow');
    });

    document.getElementById('body-blocker').addEventListener('click', function () {
      self.vm.$broadcast('close-modals');
    }, false);

    Vue.filter('labelByLang', (label) => {
      // Filter for fetching labels from vocab
      let lbl = label;
      if (lbl && lbl.indexOf(vocabPfx) !== -1) {
        lbl = lbl.replace(vocabPfx, '');
      }
      const item = _.find(vocab.descriptions, (d) => { return d['@id'] === `${vocabPfx}${lbl}`; });
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

    self.vm = new Vue({
      el: '#editorApp',
      data: {
        thing,
        meta,
        linked,
        vocab,
        vocabPfx,
        lang,
        messages: [],
        status: {
          dirty: true,
          created: meta.created,
          modified: meta.modified,
          saved: {
            loading: false,
            status: {
              error: false,
              info: '',
            },
          },
        },
        showJSON: false,
      },
      ready() {
      },
      events: {
        'focus-update': function(value, oldValue) {
          if (oldValue === this.meta) {
            this.$set('meta', value);
          } else if (oldValue === this.thing) {
            this.$set('thing', value);
          } else {
            console.warn('Something went wrong trying to update a focused object.');
          }
        },
        'save-item': function() {
          this.status.saved.loading = true;
          this.saveItem();
        },
        'show-message': function(messageObj) {
          const message = messageObj;
          message.time = new Date();

          if (this.messages.length > 3) {
            this.messages.splice(0, 1);
          }
          console.log(JSON.stringify(message));
          this.messages.push(message);
        },
        'remove-message': function(index) {
          this.messages.splice(index, 1);
        },
      },
      methods: {
        isArray(o) {
          return _.isArray(o);
        },
        isPlainObject(o) {
          return _.isPlainObject(o);
        },
        convertItemToMarc() {
          return httpUtil.post({
            url: '/_convert',
            token: self.access_token
          },
            // Use clean method on args
            editUtil.getMergedItems(this.meta, this.thing, this.linked)
          );
        },
        saveItem() {
          const inputData = JSON.parse(document.getElementById('data').innerText);
          const obj = editUtil.getMergedItems(
            editUtil.removeNullValues(this.meta),
            editUtil.removeNullValues(this.thing),
            this.linked
          );

         // if (JSON.stringify(obj) === JSON.stringify(inputData)) {
            console.warn("No changes done, skipping to save. Time to tell the user?");
         // } else {
            const atId = this.thing['@id'];
            if(atId) {
              console.log("Save called WITH changes.");
              this.doSave(atId, obj);
            } else {
              console.log("Crete called WITH changes.");
              this.doCreate(obj);
            }
          //}
        },
        doSave(url, obj) {
          this.doRequest(httpUtil.put, obj, url);
        },
        doCreate(obj) {
          this.doRequest(httpUtil.post, obj, '/create');
        },
        doRequest(requestMethod, obj, url) {
          this.status.saved.loading = true;
          requestMethod({ url, token: self.access_token }, obj).then(() => {
            self.vm.status.saved.loading = false;
            self.vm.status.saved.status = { error: false, info: '' };
            this.$dispatch('show-message', {
              title: 'Success',
              msg: 'Posten blev sparad...',
              type: 'success',
            });
          }, (error) => {
            self.vm.status.saved.loading = false;
            self.vm.status.saved.status = { error: true, info: error };
            this.$dispatch('show-message', {
              title: 'Error',
              msg: error,
              type: 'error',
            });
          });
        }
      },
      components: {
        'form-component': FormComponent,
        'editor-controls': EditorControls,
        'notifications': Notifications,
      },
    });
  }
}
