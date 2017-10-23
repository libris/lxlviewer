<script>
import * as VocabUtil from '../utils/vocab';
import * as HttpUtil from '../utils/http';
import * as RecordUtil from '../utils/record';
import CreateItemButton from '../components/create-item-button';
import InstanceListButton from '../components/instance-list-button';
import { getStatus, getEditorData, getVocabulary, getSettings } from '../vuex/getters';

export default {
  name: 'reverse-relations',
  vuex: {
    getters: {
      vocab: getVocabulary,
      settings: getSettings,
      editorData: getEditorData,
      status: getStatus,
    },
  },
  props: {
  },
  data() {
    return {
      hasRelation: false,
      checkingRelations: true,
      relationPath: '',
      relationInfo: [],
      numberOfRelations: 0,
    }
  },
  methods: {
    getRelationsInfo() {
      let property = '';
      if (this.recordType === 'Instance') {
        property = 'itemOf';
        const holdingUrl = `/_findhold?library=${this.libraryUrl}&id=${this.editorData.record['@id']}`
        HttpUtil.get({ url: holdingUrl, accept: 'application/ld+json' }).then((response) => {
          if (response.length > 0) {
            this.hasRelation = true;
            this.relationPath = response;
          } else {
            this.hasRelation = false;
          }
        }, (error) => {
          console.log('Error checking for relations');
        });
      } else if (this.recordType === 'Work') {
        property = 'instanceOf';
      }
      RecordUtil.getRelatedPosts(this.editorData.record['@id'], property).then((response) => {
        this.relationInfo = response;
        this.numberOfRelations = response.length;
      }, (error) => {
        console.log('Error checking for relations');
      });
    },
  },
  computed: {
    libraryUrl() {
      return `https://libris.kb.se/library/${this.settings.userSettings.currentSigel}`;
    },
    recordType() {
      return VocabUtil.getRecordType(this.editorData.mainEntity['@type'], this.vocab, this.settings);
    },
  },
  events: {
    'set-checking-relations': function(newVal) {
      this.checkingRelations = newVal;
    },
  },
  components: {
    'create-item-button': CreateItemButton,
    'instance-list-button': InstanceListButton,
  },
  watch: {
  },
  ready() { // Ready method is deprecated in 2.0, switch to "mounted"
    this.$nextTick(() => {
      this.getRelationsInfo();
    });
  },
};
</script>

<template>
  <div class="reverse-relations">
    <div v-if="recordType === 'Work'">
      <div class="relations-number">{{ "Instantiations" | translatePhrase }}: {{numberOfRelations}}</div>
      <instance-list-button :checking-instances="checkingRelations" :instance-list="relationInfo"></instance-list-button>
    </div>
    <div v-if="recordType === 'Instance'">
      <div class="relations-number">
        <i class="fa fa-home" aria-hidden="true"></i>
        {{ "Libraries" | translatePhrase }}: {{numberOfRelations}}
      </div>
      <create-item-button :disabled="status.inEdit" :has-holding="hasRelation" :checking-holding="checkingRelations" :holding-id="relationPath"></create-item-button>
    </div>
  </div>
</template>

<style lang="less">
@import './_variables.less';
.reverse-relations {
  background-color: @white;
  flex: 2 2 20%;
  padding: 1em;
  display: flex;
  justify-content: center;
  border: solid @gray-light;
  border-width: 1px 1px 0px 0px;
  > div {
    text-align: center;
    flex-direction: column;
    justify-content: space-evenly;
    align-items: center;
    display: flex;
    .relations-number {
      font-weight: bold;
    }
  }
}

</style>
