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
      numberOfRelations: null,
    }
  },
  methods: {
    setCheckingRelations(newVal) {
      this.checkingRelations = newVal;
    },
    getRelatedPosts(id, property) {
      // Returns a list of posts that links to <id> with <property>
      return new Promise((resolve, reject) => {
        const getInstancesUrl = `${this.settings.apiPath}/_dependencies?id=${id}&relation=${property}&reverse=true`;
        httpUtil.get({ url: getInstancesUrl, accept: 'application/ld+json' }).then((response) => {
          resolve(response);
        }, (error) => {
          reject('getRelatedPosts failed - ', error);
        });
      });
    },
    getRelationsInfo() {
      let property = '';
      if (this.recordType === 'Instance') {
        property = 'itemOf';
        const holdingUrl = `${this.settings.apiPath}/_findhold?library=${this.libraryUrl}&id=${this.inspector.data.record['@id']}`
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
      this.getRelatedPosts(this.inspector.data.record['@id'], property).then((response) => {
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
  mounted() { // Ready method is deprecated in 2.0, switch to "mounted"
    this.$nextTick(() => {
      this.getRelationsInfo();
    });
  },
};
</script>

<template>
  <div class="ReverseRelations">
    <div v-if="recordType === 'Work'" class="ReverseRelations-number">
      <span class="ReverseRelations-label">
        {{ "Instantiations" | translatePhrase }}: {{numberOfRelations || 'Error' | translatePhrase}}
      </span>
      <instance-list-button v-if="!inspector.status.editing && this.numberOfRelations > 0" class="ReverseRelations-button"
        :checking-instances="checkingRelations" 
        :instance-list="relationInfo"></instance-list-button>
    </div>
      
    <div class="ReverseRelations-number" v-if="recordType === 'Instance'">
      <i class="fa fa-university" aria-hidden="true"></i>
      <span class="ReverseRelations-label">
        {{ "Libraries" | translatePhrase }}: {{numberOfRelations || 'Error' | translatePhrase}}
      </span>
      <create-item-button class="ReverseRelations-button"
        v-if="user.isLoggedIn && user.getPermissions().registrant" 
        :disabled="inspector.status.editing" 
        :has-holding="hasRelation" 
        :checking-holding="checkingRelations" 
        :holding-id="relationPath"></create-item-button>
    </div>
  </div>
</template>

<style lang="less">

.ReverseRelations {
  &-number {
    float: right;
    font-weight: 700;
    text-align: right;
  }

  &-button {
    margin: 5px 0 10px;
  }
}

</style>
