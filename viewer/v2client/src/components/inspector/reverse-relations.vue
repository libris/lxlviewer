<script>
import * as VocabUtil from '../../utils/vocab';
import * as HttpUtil from '../../utils/http';
import * as RecordUtil from '../../utils/record';
import CreateItemButton from './create-item-button';
import InstanceListButton from './instance-list-button';
import { mapGetters } from 'vuex';

export default {
  name: 'reverse-relations',
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
        const holdingUrl = `/_findhold?library=${this.libraryUrl}&id=${this.inspector.data.record['@id']}`
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
      RecordUtil.getRelatedPosts(this.inspector.data.record['@id'], property).then((response) => {
        this.relationInfo = response;
        this.numberOfRelations = response.length;
      }, (error) => {
        console.log('Error checking for relations');
      });
    },
  },
  computed: {
    ...mapGetters([
      'inspector',
      'resources',
      'user',
      'settings',
      'status',
    ]),
    libraryUrl() {
      return `https://libris.kb.se/library/${this.user.settings.activeSigel}`;
    },
    recordType() {
      return VocabUtil.getRecordType(this.inspector.data.mainEntity['@type'], this.resources.vocab, this.settings, this.resources.context);
    },
    recordId() {
      return this.inspector.data.record['@id'];
    }
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
    recordId(newVal) {
      if (newVal !== 'https://id.kb.se/TEMPID') {
        this.getRelationsInfo();
      } else {
        this.numberOfRelations = 0;
        this.relationInfo = [];
      }
    },
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
        <i class="fa fa-university" aria-hidden="true"></i>
        {{ "Libraries" | translatePhrase }}: {{numberOfRelations}}
      </div>
      <create-item-button v-if="user.isLoggedIn && user.getPermissions().registrant" :disabled="inspector.status.editing" :has-holding="hasRelation" :checking-holding="checkingRelations" :holding-id="relationPath"></create-item-button>
    </div>
  </div>
</template>

<style lang="less">
.reverse-relations {
  background-color: @white;
  display: flex;
  > div {
    float: right;
    .relations-number {
      font-weight: bold;
    }
  }
}

</style>
