
<script>
import * as StringUtil from '@/utils/string';
import * as DataUtil from '@/utils/data';
import * as VocabUtil from '@/utils/vocab';
import * as HttpUtil from '@/utils/http';
// import * as _ from 'lodash';
import * as DisplayUtil from '@/utils/display';
import * as RecordUtil from '@/utils/record';
import EntityForm from '@/components/inspector/entity-form';
import Toolbar from '@/components/inspector/toolbar';
import EntityChangelog from '@/components/inspector/entity-changelog';
import EntityHeader from '@/components/inspector/entity-header';
import ModalComponent from '@/components/shared/modal-component';
import ReverseRelations from '@/components/inspector/reverse-relations';
import { mapGetters } from 'vuex';

export default {
  name: 'Inspector',
  data () {
    return {
      documentId: null,
      result: {},
      postLoaded: false,
      modalOpen: false,
      removeInProgress: false,
    }
  },
  methods: {
    initJsonOutput() {
      window.getJsonOutput = () => {
      const obj = this.getPackagedItem();
        console.log('%c ------------ JSON START --------------- ', 'background: #009788; color: #fff;');
        console.log(JSON.stringify(obj));
        console.log('%c ------------- JSON END ---------------- ', 'background: #009788; color: #fff;', new Date());
      };
      return true;
    },
    initToolbarFloat() {
      const toolbarPlaceholderEl = this.$refs.ToolbarPlaceholder;
      const toolbarTestEl = this.$refs.ToolbarTest;
      const width = toolbarPlaceholderEl.clientWidth;
      toolbarTestEl.style.width = `${width}px`;
    },
    fetchDocument() {
      const fetchUrl = `${this.settings.apiPath}/${this.documentId}/data.jsonld`;

      fetch(fetchUrl).then((response) => {
        if (response.status === 200) {
          return response.json();
        } else {
          this.$store.dispatch('pushNotification', { 
            color: 'red', 
            message: `${StringUtil.getUiPhraseByLang('Something went wrong', this.user.settings.language)}. ${response.status} ${response.statusText}` 
          });
        }
      }, (error) => {
        this.$store.dispatch('pushNotification', { 
          color: 'red', 
          message: `${StringUtil.getUiPhraseByLang('Something went wrong', this.user.settings.language)}. ${error}` 
        });
      }).then((result) => {
        this.result = result;
        this.$store.dispatch('setInspectorData', RecordUtil.splitJson(result));
        this.postLoaded = true;
      });
    },
    initializeRecord() {
      this.postLoaded = false;
      this.$store.dispatch('setInspectorStatusValue', { property: 'focus', value: 'mainEntity' });
      if (this.$route.name === 'Inspector') {
        console.log("Initializing view for existing document");
        this.documentId = this.$route.params.fnurgel;
        this.loadDocument();
      } else {
        console.log("Initializing view for new document");
        this.loadNewDocument();
      }
    },
    openRemoveModal() {
      this.removeInProgress = true;
    },
    closeRemoveModal() {
      this.removeInProgress = false;
    },
    doRemovePost() {
      this.closeRemoveModal();
      const url = `${this.settings.apiPath}/${this.documentId}`;
      HttpUtil._delete({ url, activeSigel: this.user.settings.activeSigel, token: this.user.token }).then((result) => {
        this.$store.dispatch('pushNotification', { color: 'green', message: `${StringUtil.getUiPhraseByLang('The post was deleted', this.settings.language)}!` });
        // Force reload
        this.$router.push({ path: '/' });
      }, (error) => {
        if (error.status === 403) {
          this.$store.dispatch('pushNotification', { color: 'red', message: `${StringUtil.getUiPhraseByLang('Forbidden', this.settings.language)} - ${StringUtil.getUiPhraseByLang('This entity may have active links', this.settings.language)} - ${error.statusText}` });
        } else {
          this.$store.dispatch('pushNotification', { color: 'red', message: `${StringUtil.getUiPhraseByLang('Something went wrong', this.settings.language)} - ${error.statusText}` });
        }
      });
    },
    loadDocument() {
      this.$store.dispatch('setInspectorStatusValue', { property: 'isNew', value: false });
      this.$store.dispatch('setInspectorStatusValue', { property: 'editing', value: false });
      this.fetchDocument();
    },
    loadNewDocument() {
      const insertData = this.inspector.insertData;
      this.$store.dispatch('setInspectorStatusValue', { property: 'isNew', value: true });
      if (!insertData.hasOwnProperty('@graph') || insertData['@graph'].length === 0) {
        this.$router.go(-1);
        console.warn('New document called without input data, routing user back.')
      } else {
        this.$store.dispatch('setInspectorData', RecordUtil.splitJson(insertData));
        this.$store.dispatch('setInspectorStatusValue', { 
          property: 'editing', 
          value: true 
        });
        this.postLoaded = true;
      }
    },
    setTitle() {
      if (typeof this.inspector.data.mainEntity !== 'undefined') {
        const headerList = DisplayUtil.getItemSummary(
          this.inspector.data.mainEntity, 
          this.resources.display, 
          this.inspector.data.quoted, 
          this.resources.vocab, 
          this.settings, 
          this.resources.context
        ).header;
        const header = StringUtil.getFormattedEntries(
          headerList, 
          this.resources.vocab, 
          this.settings, 
          this.resources.context
        ).join(', ');
        if (header.length > 0 && header !== '{Unknown}') {
          const title = header;
          this.$store.dispatch('setInspectorTitle', title);
        }
      }
    },
    toggleEditorFocus() {
      if (this.inspector.status.focus === 'record') {
        this.$store.dispatch('setInspectorStatusValue', { property: 'focus', value: 'mainEntity' });
      } else {
        this.$store.dispatch('setInspectorStatusValue', { property: 'focus', value: 'record' });
      }
    },
    getPackagedItem() {
      const RecordId = this.inspector.data.record['@id'];
      const recordCopy = _.cloneDeep(this.inspector.data.record);

      if (!RecordId || RecordId === 'https://id.kb.se/TEMPID') { // No ID -> create new
        recordCopy.descriptionCreator = { '@id': `https://libris.kb.se/library/${this.user.settings.activeSigel}` };
      } else { // ID exists -> update
        recordCopy.descriptionLastModifier = { '@id': `https://libris.kb.se/library/${this.user.settings.activeSigel}` };
      }

      const obj = DataUtil.getMergedItems(
        DataUtil.removeNullValues(recordCopy),
        DataUtil.removeNullValues(this.inspector.data.mainEntity),
        DataUtil.removeNullValues(this.inspector.data.work)
      );
      return obj;
    },
    duplicateItem() {
      if (!this.status.inEdit) {
        const duplicate = RecordUtil.prepareDuplicateFor(this.inspector.data, this.user);
        this.$store.dispatch('setInsertData', duplicate);
        this.$router.push({ path: '/new' });
        this.$store.dispatch('pushNotification', { 
          color: 'green', 
          message: `${StringUtil.getUiPhraseByLang('Copy successful', this.settings.language)}!` 
        });
      }
    },   
    saveItem(done=false) {
      this.$store.dispatch('setInspectorStatusValue', { property: 'saving', value: true });
      this.$store.dispatch('setInspectorStatusValue', { property: 'isNew', value: false });

      const RecordId = this.inspector.data.record['@id'];
      const obj = this.getPackagedItem();
      const ETag = this.inspector.data.record.modified;

      if (!RecordId || RecordId === 'https://id.kb.se/TEMPID') { // No ID -> create new
        this.doCreate(obj, done);
      } else { // ID exists -> update
        this.doUpdate(RecordId, obj, ETag, done);
      }
    },
    doUpdate(url, obj, ETag, done) {
      this.doSaveRequest(HttpUtil.put, obj, { url, ETag }, done);
    },
    doCreate(obj, done) {
      this.doSaveRequest(HttpUtil.post, obj, { url: this.settings.apiPath }, done);    },
    doSaveRequest(requestMethod, obj, opts, done) {
      requestMethod({ 
        url: opts.url, 
        ETag: opts.ETag, 
        activeSigel: 
        this.user.settings.activeSigel, 
        token: this.user.token 
      }, obj).then((result) => {
        if (!this.documentId) {
          const location = `${result.getResponseHeader('Location')}`;
          const locationParts = location.split('/');
          const fnurgel = locationParts[locationParts.length-1];
          this.$store.dispatch('pushNotification', { color: 'green', message: `${StringUtil.getUiPhraseByLang('The post was created', this.settings.language)}!` });
          this.$router.push({ path: `/${fnurgel}` });
        } else {
          this.fetchDocument();
          this.$store.dispatch('pushNotification', { color: 'green', message: `${StringUtil.getUiPhraseByLang('The post was saved', this.settings.language)}!` });
          if (done) {
            this.$store.dispatch('setInspectorStatusValue', { property: 'editing', value: false });
          }
        }
        this.$store.dispatch('setInspectorStatusValue', { property: 'dirty', value: false });
        this.$store.dispatch('setInspectorStatusValue', { property: 'saving', value: false });
      }, (error) => {
        this.$store.dispatch('setInspectorStatusValue', { property: 'saving', value: false });
        this.$store.dispatch('pushNotification', { color: 'red', message: `${StringUtil.getUiPhraseByLang('Something went wrong', this.settings.language)} - ${error}` });
      });
    },
  },
  watch: {
    'inspector.data'(val, oldVal) {
      if (val !== oldVal) {
        this.setTitle();
        this.$store.dispatch('setInspectorStatusValue', { property: 'updating', value: false });
      }
    },
    '$route.params.fnurgel'(val, oldVal) {
      if (val !== oldVal) {
        this.documentId = val;
        this.initializeRecord();
      }
    },
    'postLoaded'(val) {
      if (val === true) {
        setTimeout(() => {
          this.initToolbarFloat();
        }, 500);
      }
    },
    'inspector.event'(val, oldVal) {
      if (val.name === 'post-control') {
        switch(val.value) {
          case 'remove-post':
            this.openRemoveModal();
            break;
          case 'save-record':
            this.saveItem();
            break;
          case 'save-record-done':
            this.saveItem(true);
          default:
            return;
        }
      }
    }
  },
  events: {
    'toggle-editor-focus'() {
      this.toggleEditorFocus();
    },
  },
  created: function () {
    this.$on('duplicate-item', this.duplicateItem);
  },
  computed: {
    ...mapGetters([
      'inspector',
      'resources',
      'user',
      'settings',
      'status',
    ]),
    isItem() {
      return this.inspector.data.mainEntity['@type'] === 'Item';
    },
    recordType() {
      return VocabUtil.getRecordType(
        this.inspector.data.mainEntity['@type'], 
        this.resources.vocab, 
        this.settings, 
        this.resources.context);
    },
  },
  components: {
    'entity-header': EntityHeader,
    'entity-form': EntityForm,
    'modal-component': ModalComponent,
    'toolbar': Toolbar,
    'entity-changelog': EntityChangelog,
    'reverse-relations': ReverseRelations,
  },
  mounted() {
    this.$nextTick(() => {
      if (!this.postLoaded) {
        this.initializeRecord();
      }
      this.initJsonOutput();
      let self = this;
      window.addEventListener('resize', function() {
        self.initToolbarFloat();
      });
    });
  },
}
</script>
<template>
  <div class="Inspector" ref="Inspector">
    <div v-if="!postLoaded" class="text-center">
      <i class="fa fa-circle-o-notch fa-4x fa-spin"></i><br/>
      <h3>{{ 'Loading document' | translatePhrase | capitalize }}</h3>
    </div>
    <div class="row">
      <div class="col-sm-12 col-md-11">
        <div v-if="postLoaded" class="Inspector-entity panel panel-default">
          <div class="panel-body">
            <h1 class="Inspector-title" :title="recordType">
              <span>{{ recordType | labelByLang }}</span>
              <span v-if="this.inspector.status.isNew"> - [{{ "New record" | translatePhrase }}]</span>
            </h1>

            <div class="Inspector-header">

              <div class="Inspector-admin">
                <entity-changelog></entity-changelog>

                <div class="Inspector-adminMeta">
                  <a class="Inspector-adminMetaLink" tabindex="0"
                    v-show="inspector.status.focus === 'record'" 
                    v-on:click="toggleEditorFocus()">
                    <i class="fa fa-fw fa-toggle-on"></i> {{'Admin metadata' | translatePhrase}}
                  </a>
                  <a class="Inspector-adminMetaLink" tabindex="0"
                    v-show="inspector.status.focus === 'mainEntity'" 
                    v-on:click="toggleEditorFocus()">
                    <i class="fa fa-fw fa-toggle-off"></i> {{'Admin metadata' | translatePhrase}}
                  </a>
                </div>
              </div>

              <reverse-relations class="Inspector-reverse" 
                v-if="!inspector.status.isNew"></reverse-relations>
            </div>
            
            <entity-header id="main-header" 
              :full="true" 
              v-if="!isItem"></entity-header>
            <entity-form 
              :editing-object="inspector.status.focus" 
              :locked="!inspector.status.editing"></entity-form>
            <code v-if="user.settings.appTech">
              {{result}}
            </code>
          </div>
        </div>
      </div>
      <div v-if="postLoaded" class="col-12 col-sm-12 col-md-1">
        <div class="Toolbar-placeholder" ref="ToolbarPlaceholder"></div>
        <div class="Toolbar-container" ref="ToolbarTest">
          <toolbar></toolbar>
        </div>
      </div>
    </div>
    <modal-component title="Error" modal-type="danger" @close="closeRemoveModal" class="RemovePostModal" 
      v-if="removeInProgress">
      <div slot="modal-header" class="RemovePostModal-header">
        <header>
          {{ 'Remove' | translatePhrase }} {{ this.recordType | labelByLang }}?
        </header>
      </div>
      <div slot="modal-body" class="RemovePostModal-body">
        <p>
          {{ 'This operation can\'t be reverted' | translatePhrase }}
        </p>
        <div class="RemovePostModal-buttonContainer">
          <button class="btn btn-danger" @click="doRemovePost()">{{ 'Yes, remove the record' | translatePhrase }}</button>
          <button class="btn btn-default" @click="closeRemoveModal()">{{ 'No, cancel' | translatePhrase }}</button>
        </div>
      </div>
    </modal-component>
  </div>
</template>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="less">

.Inspector {

  &-header {
    display: flex;
    flex-direction: row
  }

  &-admin {
    flex: 3;
  }

  &-reverse {
    flex: 1;
  }

  &-adminMeta {
    margin: 10px 0;
  }
  
  &-adminMetaLink {
    cursor: pointer;
    color: @brand-primary;
  }
}
.InspectorModal {
  &-body {
    display: flex;
    flex-direction: column;
  }
  &-filter {
    background-color: #ccc;
    width: 100%;
  }
  &-searchList {
    height: 100%;
    overflow-y: scroll;
  }
}
.RemovePostModal .ModalComponent-container {
  width: 600px;
  height: 250px;
}
.RemovePostModal {
  &-body {
    height: 80%;
    display: flex;
    flex-direction: column;
    text-align: center;
    justify-content: center;
  }
  &-buttonContainer {
    text-align: center;
  }
}


</style>
