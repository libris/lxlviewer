<script>
import * as VocabUtil from '../../utils/vocab';
import * as HttpUtil from '../../utils/http';
import * as RecordUtil from '../../utils/record';
import CreateItemButton from './create-item-button';
import RelationsList from '@/components/inspector/relations-list';
import { mapGetters } from 'vuex';

export default {
  name: 'reverse-relations',
  props: {
  },
  data() {
    return {
      checkingRelations: true,
      relationPath: '',
      myHolding: null,
      relationInfo: [],
      numberOfRelations: null,
      relationsListOpen: false,
    }
  },
  methods: {
    showRelationsList() {
      this.relationsListOpen = true;
    },
    hideRelationsList() {
      this.relationsListOpen = false;
    },
    getRelatedPosts(queryPairs) {
      // Returns a list of posts that links to <id> with <property>
      return new Promise((resolve, reject) => {
        let relatedPosts = `${this.settings.apiPath}/find.json?`;
        _.each(queryPairs, (v, k) => {
          relatedPosts += (`${encodeURIComponent(k)}=${encodeURIComponent(v)}&`);
        });
        fetch(relatedPosts)
        .then((response) => {
          if (response.status === 200) {
            resolve(response.json());
          } else {
            reject();
          }
        })
        .catch((error) => {
          reject(error);
        });
      });
    },
    getRelationsInfo() {
      const query = {};
      if (this.recordType === 'Instance') {
        query['itemOf.@id'] = this.inspector.data.mainEntity['@id'];
        query['@type'] = 'Item';

        // Check if my sigel has holding
        const myHoldingQuery = Object.assign({}, query);
        myHoldingQuery['heldBy.@id'] = `https://libris.kb.se/library/${this.user.settings.activeSigel}`;
        this.getRelatedPosts(myHoldingQuery)
        .then((response) => {
          if (response.totalItems > 0) {
            this.myHolding = response.items[0]['@id'];
          }
        })
        .catch((error) => {
          console.log(error);
        });

      } else if (this.recordType === 'Work') {
        query['instanceOf.@id'] = this.inspector.data.mainEntity['@id'];
        query['@type'] = 'Instance';
      }
      this.getRelatedPosts(query).then((response) => {
        this.relationInfo = response;
        this.numberOfRelations = response.totalItems;
        this.checkingRelations = false;
      }, (error) => {
        console.log('Error checking for relations', error);
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
    hasRelation() {
      return this.myHolding !== null;
    },
    libraryUrl() {
      return `https://libris.kb.se/library/${this.user.settings.activeSigel}`;
    },
    recordType() {
      return VocabUtil.getRecordType(
        this.inspector.data.mainEntity['@type'], 
        this.resources.vocab, 
        this.resources.context
      );
    },
    recordId() {
      return this.inspector.data.record['@id'];
    }
  },
  events: {
  },
  components: {
    'create-item-button': CreateItemButton,
    'relations-list': RelationsList,
  },
  watch: {
    'inspector.event'(val, oldVal) {
      if (val.name === 'form-control') {
        switch (val.value) { 
          case 'open-instances-window':
            this.showRelationsList();
            break;
          default:
            return;
        }
      }
    },
    recordId(newVal) {
      if (newVal !== 'https://id.kb.se/TEMPID') {
        this.getRelationsInfo();
      } else {
        this.numberOfRelations = 0;
        this.relationInfo = [];
      }
    },
    numberOfRelations: function (val) {
      this.numberOfRelations = val;
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.getRelationsInfo();
    });
  },
};
</script>

<template>
  <div class="ReverseRelations">
    <div v-if="recordType === 'Work'" v-show="!checkingRelations" class="ReverseRelations-number">
      <span class="ReverseRelations-label uppercaseHeading">
        {{ "Instantiations" | translatePhrase }}: {{numberOfRelations | translatePhrase}}
      </span>

      <button class="ReverseRelations-button InstancesList-btn btn btn-primary btn--lg" 
        @click="showRelationsList()" 
        v-if="!inspector.status.editing && this.numberOfRelations > 0"
        :checking-instances="checkingRelations">
        {{"Show instantiations" | translatePhrase}}
      </button>
      <relations-list 
        v-if="relationsListOpen" 
        :relations-list="relationInfo" 
        @close="hideRelationsList()"></relations-list>
    </div>
      
    <div class="ReverseRelations-number" v-if="recordType === 'Instance'">
      <span class="ReverseRelations-label uppercaseHeading">
        {{ "Libraries" | translatePhrase }}: 
        <span v-if="isNaN(numberOfRelations)"> {{'Error' | translatePhrase}}</span>
        <span v-else> {{numberOfRelations}} </span>
      </span>
      <create-item-button class="ReverseRelations-button"
        v-if="user.isLoggedIn && user.getPermissions().registrant" 
        :disabled="inspector.status.editing" 
        :has-holding="hasRelation" 
        :checking-holding="checkingRelations" 
        :holding-id="myHolding"
        @done="checkingRelations=false"></create-item-button>
    </div>
  </div>
</template>

<style lang="less">

.ReverseRelations {
  &-number {
    float: left;
    margin: 0 0 10px;
  
    @media (min-width: @screen-sm) {
      float: right;
      text-align: right;
    }
  }

  &-label {
  }

  &-button {
  }
}

</style>
