<template>
  <div class="InspectorView" ref="Inspector">
    <div v-if="!postLoaded" class="text-center">
      <i class="fa fa-circle-o-notch fa-4x fa-spin"></i><br/>
      <h3>{{ 'Loading document' | translatePhrase | capitalize }}</h3>
    </div>
    <div class="row">
      <div v-if="postLoaded" class="InspectorView-panel panel panel-default col-md-11">
        <editor-controls @save="saveItem()"></editor-controls>
        <header-component id="main-header" :full="true" v-if="!isItem"></header-component>
        <form-component :editing-object="inspector.status.focus" :locked="!inspector.status.editing"></form-component>
        <hr>
        <code v-if="user.settings.appTech">
          {{result}}
        </code>
      </div>
      <div v-if="postLoaded" class="col-md-1 Toolbar-column">
        <!-- SLOT FOR TOOLBAR -->
        <div class="Toolbar-placeholder" ref="ToolbarPlaceholder">
        </div>
        <div class="Toolbar-container" ref="ToolbarTest">
          <button>A</button>
          <button>B</button>
          <button>C</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as StringUtil from '@/utils/string';
import * as DataUtil from '@/utils/data';
import * as httpUtil from '@/utils/http';
// import * as _ from 'lodash';
// import * as VocabUtil from '@/utils/vocab';
import * as DisplayUtil from '@/utils/display';
import * as RecordUtil from '@/utils/record';
// import MarcPreview from '@/components/editorcomponents/marc-preview';
import FormComponent from '@/components/editorcomponents/formcomponent';
import EditorControls from '@/components/editorcomponents/editorcontrols';
import HeaderComponent from '@/components/editorcomponents/headercomponent';
import ModalComponent from '@/components/shared/modal-component';
import { mapGetters } from 'vuex';

export default {
  name: 'Inspector',
  data () {
    return {
      documentId: null,
      result: {},
      postLoaded: false,
      modalOpen: false,
    }
  },
  methods: {
    initToolbarFloat() {
      const toolbarPlaceholderEl = this.$refs.ToolbarPlaceholder;
      const toolbarTestEl = this.$refs.ToolbarTest;
      const width = toolbarPlaceholderEl.clientWidth;
      toolbarTestEl.style.width = `${toolbarPlaceholderEl.clientWidth}px`;
    },
    fetchDocument() {
      const fetchUrl = `http://kblocalhost.kb.se:5000/${this.documentId}/data.jsonld`;

      fetch(fetchUrl).then((response) => {
        if (response.status === 200) {
          return response.json();
        } else {
          this.$store.dispatch('pushNotification', { color: 'red', message: `${StringUtil.getUiPhraseByLang('Something went wrong', this.user.settings.language)}. ${response.status} ${response.statusText}` });
        }
      }, (error) => {
        this.$store.dispatch('pushNotification', { color: 'red', message: `${StringUtil.getUiPhraseByLang('Something went wrong', this.user.settings.language)}. ${error}` });
      }).then((result) => {
        this.result = result;
        this.$store.dispatch('setInspectorData', RecordUtil.splitJson(result));
        this.postLoaded = true;
      });
    },
    loadDocument() {
      this.$store.dispatch('setInspectorStatusValue', { property: 'editing', value: false });
      this.documentId = this.$route.params.fnurgel;
      this.fetchDocument();
    },
    loadNewDocument() {
      const insertData = this.inspector.insertData;
      if (!insertData.hasOwnProperty('@graph')) {
        this.$store.dispatch('pushNotification', { color: 'red', message: `${StringUtil.getUiPhraseByLang('Something went wrong', this.settings.language)}!` });
        this.$router.push({ path: `/` });
      } else {
        this.$store.dispatch('setInspectorData', RecordUtil.splitJson(insertData));
        this.$store.dispatch('setInspectorStatusValue', { property: 'editing', value: true });
        this.postLoaded = true;
      }
    },
    setTitle() {
      if (typeof this.inspector.data.mainEntity !== 'undefined') {
        const headerList = DisplayUtil.getItemSummary(this.inspector.data.mainEntity, this.resources.display, this.inspector.data.quoted, this.resources.vocab, this.settings, this.resources.context).header;
        const header = StringUtil.getFormattedEntries(headerList, this.resources.vocab, this.settings, this.resources.context).join(', ');
        if (header.length > 0 && header !== '{Unknown}') {
          const title = header;
          this.$store.dispatch('setInspectorTitle', title);
        }
      }
    },
    saveItem() {
      this.$store.dispatch('setInspectorStatusValue', { property: 'saving', value: true });
      const ETag = this.inspector.data.record.modified;
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
        DataUtil.removeNullValues(this.inspector.data.work),
        this.inspector.data.quoted
      );

      if (!RecordId || RecordId === 'https://id.kb.se/TEMPID') { // No ID -> create new
        this.doCreate(obj);
      } else { // ID exists -> update
        this.doUpdate(RecordId, obj, ETag);
      }
    },
    doUpdate(url, obj, ETag) {
      this.doSaveRequest(httpUtil.put, obj, url, ETag);
    },
    doCreate(obj) {
      this.doSaveRequest(httpUtil.post, obj, '/');
    },
    doSaveRequest(requestMethod, obj, url, ETag) {
      requestMethod({ url, ETag, activeSigel: this.user.settings.activeSigel }, obj).then((result) => {
        const postUrl = `${result.getResponseHeader('Location')}`;
        httpUtil.get({ url: `${postUrl}/data.jsonld`, accept: 'application/ld+json' }).then((getResult) => {
          const newData = RecordUtil.splitJson(getResult);
          if (result.status === 201) {
            window.location = result.getResponseHeader('Location');
          } else {
            this.$store.dispatch('setInspectorData', newData);
          }
          this.$store.dispatch('setInspectorStatusValue', { property: 'saving', value: false });
          this.$store.dispatch('pushNotification', { color: 'green', message: `${StringUtil.getUiPhraseByLang('The post was saved', this.settings.language)}!` });
          this.$store.dispatch('setInspectorStatusValue', { property: 'dirty', value: false });
        }, (error) => {
          this.$store.dispatch('setInspectorStatusValue', { property: 'saving', value: false });
          this.$store.dispatch('pushNotification', { color: 'red', message: `${StringUtil.getUiPhraseByLang('Something went wrong', this.settings.language)} - ${error}` });
        });
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
      }
    },
    'postLoaded'(val) {
      if (val === true) {
        setTimeout(() => {
          this.initToolbarFloat();
        }, 500);
      }
    }
  },
  mounted() {
    this.$nextTick(() => {
      if (this.$route.name === 'Inspector') {
        this.loadDocument();
      } else {
        this.loadNewDocument();
      }
    });
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
  },
  components: {
    'header-component': HeaderComponent,
    'form-component': FormComponent,
    'modal-component': ModalComponent,
    'editor-controls': EditorControls,
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="less">

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
.Toolbar {
  &-placeholder {
    width: 100%;
  }
  &-container {
    position: fixed;
    border: 1px solid #ccc;
    background-color: #eee;
    padding: 0.5em;
    button {
      margin: 0.1em 0;
      width: 100%;
    }
  }
}

</style>
