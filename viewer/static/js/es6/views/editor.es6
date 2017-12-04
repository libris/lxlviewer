import View from './view';
import Vue from 'vue';
import Vuex from 'vuex';
import store from '../vuex/store';
import LensMixin from '../components/mixins/lens-mixin';
import EventMixin from '../components/mixins/global-event-mixin';
import ComboKeys from 'combokeys';
import KeyBindings from '../keybindings.json';
import * as DataUtil from '../utils/data';
import * as LayoutUtil from '../utils/layout';
import * as httpUtil from '../utils/http';
import * as toolbarUtil from '../utils/toolbar';
import * as _ from 'lodash';
// import * as VocabLoader from '../utils/vocabloader';
import * as VocabUtil from '../utils/vocab';
import * as DisplayUtil from '../utils/display';
import * as RecordUtil from '../utils/record';
import * as StringUtil from '../utils/string';
import MarcPreview from '../components/marc-preview';
import FormComponent from '../components/formcomponent';
import HelpComponent from '../components/help-component';
import EditorControls from '../components/editorcontrols';
import HeaderComponent from '../components/headercomponent';
import Notification from '../components/notification';
import ReverseRelations from '../components/reverse-relations';
import { getSettings, getVocabulary, getContext, getVocabularyClasses, getVocabularyProperties, getDisplayDefinitions, getEditorData, getStatus, getKeybindState } from '../vuex/getters';
import { updateForm, changeSettings, changeNotification, loadVocab, loadContext, loadVocabMap, loadForcedListTerms, loadDisplayDefs, syncData, changeSavedStatus, changeStatus, navigateChangeHistory } from '../vuex/actions';

export default class Editor extends View {

  initialize() {
    const self = this;
    Promise.all(self.getLdDependencies('vocab display context listTerms')).then(() => {
      self.initVue();
    }, (error) => {
      window.lxlError(error);
    });
    super.initialize();
    // VocabLoader.initVocabClicks();
    // toolbarUtil.initToolbar(this);

    const textData = RecordUtil.splitJson(JSON.parse(document.getElementById('data').innerText));
    if (Modernizr.history) {
      if (history.state === null) {
        history.replaceState(textData, 'unused');
      }
      this.dataIn = history.state;
    } else {
      this.dataIn = textData;
    }

  }

  initVue() {
    const self = this;

    document.getElementById('body-blocker').addEventListener('click', function () {
      self.vm.$broadcast('close-modals');
    }, false);

    Vue.filter('labelByLang', (label) => {
      return StringUtil.getLabelByLang(label, self.settings.language, self.vocabMap, self.settings.vocabPfx, self.context);
    });
    Vue.filter('removeDomain', (value) => {
      return StringUtil.removeDomain(value, self.settings.removableBaseUris);
    });
    Vue.filter('translatePhrase', (string) => {
      return StringUtil.getUiPhraseByLang(string, self.settings.language);
    });

    Vue.use(Vuex);

    self.vm = new Vue({
      el: '#editor',
      mixins: [EventMixin, LensMixin],
      vuex: {
        actions: {
          syncData,
          loadVocab,
          loadContext,
          loadVocabMap,
          loadForcedListTerms,
          loadDisplayDefs,
          changeSettings,
          changeSavedStatus,
          changeStatus,
          changeNotification,
          navigateChangeHistory,
          updateForm,
        },
        getters: {
          context: getContext,
          settings: getSettings,
          editorData: getEditorData,
          vocab: getVocabulary,
          vocabClasses: getVocabularyClasses,
          vocabProperties: getVocabularyProperties,
          display: getDisplayDefinitions,
          status: getStatus,
          keybindState: getKeybindState,
        },
      },
      data: {
        initialized: false,
        combokeys: null,
        locked: true,
        relatedTitles: [],
        newData: {},
      },
      events: {
        'focus-update': function(value, oldValue) {
          const newData = this.editorData;
          console.log("Update");
          if (oldValue === this.editorData.meta) {
            newData.meta = value;
          } else if (oldValue === this.editorData.thing) {
            newData.thing = value;
          } else {
            console.warn('Something went wrong trying to update a focused object.');
          }
          this.syncData(newData);
        },
        'add-linked': function(item) {
          const newData = this.editorData;
          const graphId = RecordUtil.extractFnurgel(item['@id']) || item['@id'];
          const graphObj = {
            '@id': graphId,
            '@graph': [item],
          };
          let found = false;
          _.each(newData.quoted, (node) => {
            if (node['@id'] === graphId) {
              let subnodefound = false;
              _.each(node['@graph'], (subnode) => {
                if (subnode['@id'] === item['@id']) {
                  subnodefound = true;
                }
              });
              if (!subnodefound) {
                node['@graph'].push(item);
              }
              found = true;
            }
          });
          if (!found) {
            newData.quoted.push(graphObj);
          }
          this.syncData(newData);
        },
        'add-field'(prop, path) {
          const key = prop['@id'].replace(this.settings.vocabPfx, '');
          let value = [];
          if (prop['@type'] === 'DatatypeProperty') {
            if (this.forcedListTerms.indexOf(key) > -1) {
              value = [''];
            } else {
              value = '';
            }
          }
          const formData = _.cloneDeep(this.editorData[this.status.editorFocus]);
          let modified = _.cloneDeep(this.formData);
          if (typeof path !== 'undefined') {
            _.set(modified, `${path}.${key}`, value);
          } else {
            const newItem = {};
            newItem[key] = value;
            modified = Object.assign({}, formData, newItem);
          }
          this.updateForm(this.status.editorFocus, modified, formData);
        },
        'save-item': function(cancelEdit) {
          if (this.status.inEdit) {
            this.saveItem(cancelEdit);
          }
        },
        'show-marc': function() {
          this.$broadcast('open-marc');
        },
        'edit-item': function() {
          if (!this.status.inEdit) {
            this.editItem();
          }
        },
        'duplicate-item': function() {
          if (!this.status.inEdit) {
            this.buildCopiedRecord();
            this.changeNotification('color', 'green');
            this.changeNotification('message', `${StringUtil.getUiPhraseByLang('Copy successful', this.settings.language)}!`);
          }
        },
        'cancel-edit': function() {
          this.changeStatus('inEdit', false);
          this.syncData(Object.assign({}, this.status.lastSavedData));
        },
        'new-editordata'(newData) {
          this.syncData(newData);
          const atId = newData.record['@id'];
          if (!atId || atId === 'https://id.kb.se/TEMPID') {
            this.editItem();
            history.pushState(newData, 'unused', '/edit');
          } else {
            history.replaceState(newData, 'unused', `${atId}/edit`);
            self.vm.changeStatus('inEdit', false);
            self.vm.changeStatus('isNew', false);
          }
        },
        'form-control'(control) {
          this.$broadcast(control);
        },
        'navigate-change-history'(direction) {
          this.navigateChangeHistory(this.status.editorFocus, direction);
        },
        'preview-holding'(holdingData) {
          this.newData = RecordUtil.getObjectAsRecord(holdingData.mainEntity, holdingData.record);
        },
      },
      watch: {
        copyId(value, oldval) {
          if (value.length === 0 && oldval && oldval.length > 0) {
            this.copy.state = '';
          } else if (!/[^a-z0-9]/gi.test(value)) {
            this.getCopyItem(value);
          } else {
            this.copy.state = 'invalid';
          }
        },
        inEdit(val, oldval) {
          if (val !== oldval) {
            // Do something when inEdit is changed...
          }
        },
        keybindState(state) {
          // Bindings are defined in keybindings.json
          if (this.combokeys) {
            this.combokeys.detach();
          }
          this.combokeys = new ComboKeys(document.documentElement);
          require('combokeys/plugins/global-bind')(this.combokeys); // TODO: Solve with ES6 syntax
          const stateSettings = KeyBindings[state];
          if (typeof stateSettings !== 'undefined') {
            _.each(stateSettings, (value, key) => {
              if (value !== null && value !== '') {
                this.combokeys.bindGlobal(key.toString(), () => {
                  const valueArray = value.split('|');
                  if (state === 'overview') {
                    this.$dispatch(valueArray[0], valueArray[1]);
                  } else {
                    this.$broadcast(valueArray[0], valueArray[1]);
                  }
                  return false;
                });
              }
            });
          }
        },
        entityTitle(val) {
          this.updateDocumentTitle(val);
        },
        newData() {
          document.getElementById('post-edit-form').submit();
        },
      },
      computed: {
        canEditThisType() {
          if (this.user.hasAnyCollections() === false) {
            return false;
          }
          const permission = this.user.getPermissions();
          if (this.editorData.mainEntity['@type'] === 'Item' && permission.registrant === true) {
            return true;
          } else if (permission.cataloger === true) {
            return true;
          }
          return false;
        },
        isItem() {
          return this.editorData.mainEntity['@type'] === 'Item';
        },
        focusData() {
          return this.editorData[this.status.level];
        },
        entityTitle() {
          if (typeof this.editorData.mainEntity !== 'undefined') {
            const headerList = DisplayUtil.getItemSummary(this.editorData.mainEntity, this.display, this.editorData.quoted, this.vocab, this.settings, this.context).header;
            const header = StringUtil.getFormattedEntries(headerList, this.vocab, this.settings, this.context).join(', ');
            if (header.length > 0 && header !== '{Unknown}') {
              return header;
            }
          }
          return `{${StringUtil.getUiPhraseByLang('Unnamed entity', self.settings.language)}}`;
        },
        inEdit() {
          return this.status.inEdit;
        },
      },
      methods: {
        buildCopiedRecord() {
          const mainEntity = _.cloneDeep(this.editorData.mainEntity);
          const newRecord = _.cloneDeep(this.editorData.record);
          newRecord.descriptionCreator = { '@id': `https://libris.kb.se/library/${this.user.settings.activeSigel}` };
          this.newData = RecordUtil.getObjectAsRecord(mainEntity, newRecord);
        },
        showHelp() {
          this.$dispatch('show-help', '');
        },
        getRelatedTitles() {
          if (VocabUtil.isSubClassOf(this.editorData.mainEntity['@type'], 'Work', this.vocab, this.settings.vocabPfx, this.context)) {
            RecordUtil.getRelatedPosts(this.editorData.record['@id'], 'instanceOf').then((response) => {
              _.each(response, (node) => {
                console.log("Extracting title from", node);
                this.extractTitle(node).then((titleArray) => {
                  console.log("Extracted", titleArray);
                  const displayTitles = [];
                  _.each(titleArray, (title) => {
                    const chipObj = DisplayUtil.getChip(title, this.display, this.editorData.quoted, this.vocab, this.settings, this.context);
                    displayTitles.push(StringUtil.extractStrings(chipObj));
                  });
                  this.relatedTitles = this.relatedTitles.concat(displayTitles);
                }, (error) => {
                  console.log(error);
                });
              });
            }, (error) => {
              console.log(error);
            });
          }
        },
        extractTitle(id) {
          return new Promise((resolve, reject) => {
            console.log("Getting", id);
            httpUtil.get({ url: `${id}/data.jsonld`, accept: 'application/ld+json' }).then((response) => {
              console.log("Found", id);
              const mainEntity = RecordUtil.getMainEntity(response['@graph']);
              console.log("mainEntity found", mainEntity);
              resolve(mainEntity.hasTitle);
            }, (error) => {
              reject(Error('Something failed', error));
            });
          });
        },
        updateDocumentTitle(recordTitle) {
          const pageTitle = `${recordTitle} - ${this.settings.siteInfo.title}`;
          document.title = pageTitle;
        },
        isArray(o) {
          return _.isArray(o);
        },
        isPlainObject(o) {
          return _.isPlainObject(o);
        },
        editItem() {
          if (this.canEditThisType) {
            this.$dispatch('set-dirty', true);
            this.changeStatus('inEdit', true);
          } else {
            window.location = '/login';
          }
        },
        getCollectionName(entity) {
          const vocabPfx = this.settings.vocabPfx;
          const baseClasses = VocabUtil.getBaseClasses(entity['@type'], this.vocab, vocabPfx);
          const classList = [entity['@type']].concat(baseClasses);
          for (const cn of classList) {
            if (cn === 'Instance' || cn === `${vocabPfx}Instance`) {
              return 'bib';
            } else if (cn === 'Item' || cn === `${vocabPfx}Item`) {
              return 'hold';
            }
          }
          return 'auth';
        },
        saveItem(cancelEdit) {
          const ETag = this.editorData.record.modified;
          const RecordId = this.editorData.record['@id'];
          const recordCopy = _.cloneDeep(this.editorData.record);

          if (!RecordId || RecordId === 'https://id.kb.se/TEMPID') { // No ID -> create new
            recordCopy.descriptionCreator = { '@id': `https://libris.kb.se/library/${this.user.settings.activeSigel}` };
          } else { // ID exists -> update
            recordCopy.descriptionLastModifier = { '@id': `https://libris.kb.se/library/${this.user.settings.activeSigel}` };
          }

          const obj = DataUtil.getMergedItems(
            DataUtil.removeNullValues(recordCopy),
            DataUtil.removeNullValues(this.editorData.mainEntity),
            DataUtil.removeNullValues(this.editorData.work),
            this.editorData.quoted
          );

          if (!RecordId || RecordId === 'https://id.kb.se/TEMPID') { // No ID -> create new
            this.doCreate(obj);
          } else { // ID exists -> update
            this.doUpdate(RecordId, obj, ETag, cancelEdit);
          }
        },
        doUpdate(url, obj, ETag, cancelEdit) {
          this.doSaveRequest(httpUtil.put, obj, url, ETag, cancelEdit);
        },
        doCreate(obj) {
          this.doSaveRequest(httpUtil.post, obj, '/');
        },
        doSaveRequest(requestMethod, obj, url, ETag, cancelEdit = true) {
          requestMethod({ url, ETag }, obj).then((result) => {
            const postUrl = `${result.getResponseHeader('Location')}`;
            httpUtil.get({ url: `${postUrl}/data.jsonld`, accept: 'application/ld+json' }).then((getResult) => {
              const newData = RecordUtil.splitJson(getResult);
              if (Modernizr.history) {
                this.$dispatch('new-editordata', newData);
              } else if (result.status === 201) {
                window.location = result.getResponseHeader('Location');
              } else {
                self.vm.syncData(newData);
              }
              self.vm.changeStatus('lastSavedData', Object.assign({}, newData));
              self.vm.changeSavedStatus('loading', false);
              self.vm.changeSavedStatus('error', false);
              self.vm.changeSavedStatus('info', '');
              self.vm.changeNotification('color', 'green');
              self.vm.changeNotification('message', `${StringUtil.getUiPhraseByLang('The post was saved', this.settings.language)}!`);
              this.changeStatus('inEdit', !cancelEdit);
              this.$dispatch('set-dirty', false);
            }, (error) => {
              self.vm.changeSavedStatus('loading', false);
              self.vm.changeNotification('color', 'red');
              self.vm.changeNotification('message', `${StringUtil.getUiPhraseByLang('Something went wrong', this.settings.language)} - ${error}`);
            });
          }, (error) => {
            self.vm.changeSavedStatus('loading', false);
            self.vm.changeNotification('color', 'red');
            self.vm.changeNotification('message', `${StringUtil.getUiPhraseByLang('Something went wrong', this.settings.language)} - ${error}`);
          });
        },
      },
      ready() {
        this.updateUser(self.user);
        this.changeSettings(self.settings);
        this.loadVocab(self.vocab);
        this.loadContext(self.context);
        this.loadVocabMap(self.vocabMap);
        this.loadForcedListTerms(self.forcedListTerms);
        this.loadDisplayDefs(self.display);
        this.syncData(self.dataIn);
        this.changeStatus('lastSavedData', Object.assign({}, self.dataIn));
        this.changeStatus('keybindState', 'overview');
        this.changeStatus('isNew', false);
        this.updateDocumentTitle(this.entityTitle);

        // this.getRelatedTitles();

        // add own mainentity to quoted graph so that we can self-reference
        this.$dispatch('add-linked', this.editorData.mainEntity);

        const atId = this.editorData.record['@id'];
        if (!atId || atId === 'https://id.kb.se/TEMPID') {
          this.editItem();
          this.changeStatus('isNew', true);
        }
        if (Modernizr.history) {
          history.scrollRestoration = 'manual';
          window.onpopstate = e => {
            e.preventDefault();
            this.$dispatch('new-editordata', e.state);
            return false;
          };
        }
        LayoutUtil.showPage(this);
        // this.showEditor();
      },
      components: {
        'form-component': FormComponent,
        'editor-controls': EditorControls,
        'header-component': HeaderComponent,
        'help-component': HelpComponent,
        'notification': Notification,
        'marc-preview': MarcPreview,
        'reverse-relations': ReverseRelations,
      },
      store,
    });
  }
}
