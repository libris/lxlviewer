<template>
  <div class="row">
    <h1>INSPEKTOR!</h1>
    {{documentId || "Invalid fnurgel"}}
    <hr>
    <code>
      {{result}}
    </code>
  </div>
</template>

<script>
import * as StringUtil from '@/utils/string';
// import * as DataUtil from '@/utils/data';
// import * as LayoutUtil from '@/utils/layout';
// import * as httpUtil from '@/utils/http';
// import * as _ from 'lodash';
// import * as VocabUtil from '@/utils/vocab';
// import * as DisplayUtil from '@/utils/display';
// import * as RecordUtil from '@/utils/record';
// import * as StringUtil from '@/utils/string';
// import MarcPreview from '@/components/editorcomponents/marc-preview';
// import FormComponent from '@/components/editorcomponents/formcomponent';
// import EditorControls from '@/components/editorcomponents/editorcontrols';
// import HeaderComponent from '@/components/editorcomponents/headercomponent';


export default {
  name: 'Inspector',
  data () {
    return {
      documentId: null,
      result: {}
    }
  },
  methods: {
    fetchDocument() {
      const fetchUrl = this.documentId;

      const headers = new Headers();
      headers.append('Content-Type', 'application/ld+json');

      fetch(fetchUrl, { headers }).then((response) => {
        if (response.status === 200) {
          return response.json();
        } else {
          this.$store.dispatch('pushNotification', { color: 'red', message: `${StringUtil.getUiPhraseByLang('Something went wrong', this.user.settings.language)}. ${response.status} ${response.statusText}` });
        }
      }, (error) => {
        this.$store.dispatch('pushNotification', { color: 'red', message: `${StringUtil.getUiPhraseByLang('Something went wrong', this.user.settings.language)}. ${error}` });
      }).then((result) => {
        this.result = result;
      });
    },
    loadDocument() {
      this.documentId = this.$route.params.fnurgel;
      this.fetchDocument();
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
  },
  components: {
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
