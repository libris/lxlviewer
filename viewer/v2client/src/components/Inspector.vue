<template>
  <div class="InspectorView">
    <div v-if="!postLoaded" class="text-center">
      <i class="fa fa-circle-o-notch fa-4x fa-spin"></i><br/>
      <h3>{{ 'Loading document' | translatePhrase | capitalize }}</h3>
    </div>
    <div class="row">
      <div v-if="postLoaded" class="InspectorView-panel panel panel-default col-md-12">
        <editor-controls></editor-controls>
        <header-component id="main-header" :full="true" v-if="!isItem"></header-component>
        <form-component :editing-object="inspector.status.focus" :locked="!inspector.status.editing"></form-component>
        <hr>
        <code v-if="user.settings.appTech">
          {{result}}
        </code>
      </div>
    </div>
  </div>
</template>

<script>
import * as StringUtil from '@/utils/string';
// import * as DataUtil from '@/utils/data';
// import * as LayoutUtil from '@/utils/layout';
// import * as httpUtil from '@/utils/http';
// import * as _ from 'lodash';
// import * as VocabUtil from '@/utils/vocab';
import * as DisplayUtil from '@/utils/display';
import * as RecordUtil from '@/utils/record';
// import MarcPreview from '@/components/editorcomponents/marc-preview';
import FormComponent from '@/components/editorcomponents/formcomponent';
import EditorControls from '@/components/editorcomponents/editorcontrols';
import HeaderComponent from '@/components/editorcomponents/headercomponent';
import ModalComponent from '@/components/shared/modal-component';

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
      this.documentId = this.$route.params.fnurgel;
      this.fetchDocument();
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
  },
  watch: {
    'inspector.data'(val, oldVal) {
      if (val !== oldVal) {
        this.setTitle();
      }
    },
  },
  mounted() {
    this.$nextTick(() => {
      this.loadDocument();
    });
  },
  computed: {
    settings() {
      return this.$store.getters.settings;
    },
    user() {
      return this.$store.getters.user;
    },
    resources() {
      return this.$store.getters.resources;
    },
    inspector() {
      return this.$store.getters.inspector;
    },
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

</style>
