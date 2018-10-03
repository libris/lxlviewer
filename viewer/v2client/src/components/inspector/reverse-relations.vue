<script>
import * as VocabUtil from '../../utils/vocab';
import * as HttpUtil from '../../utils/http';
import * as RecordUtil from '../../utils/record';
import CreateItemButton from './create-item-button';
import RelationsList from '@/components/inspector/relations-list';
import RoundButton from '@/components/shared/round-button.vue';
import { mapGetters } from 'vuex';
import VueSimpleSpinner from 'vue-simple-spinner';

export default {
  name: 'reverse-relations',
  props: {
    mainEntity: {},
    compact: { type: Boolean, default: false }, 
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
    showPanel() {
      this.$store.dispatch('pushInspectorEvent', { 
        name: 'form-control', 
        value: 'close-modals'
      }).then(() => {
        this.$nextTick(() => {
          this.relationsListOpen = true;
        });
      });
    },
    hidePanel() {
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
      const query = {
        '_limit': 0,
      };
      if (this.recordType === 'Item') {
        query['itemOf.@id'] = this.mainEntity.itemOf['@id'];
        query['@type'] = 'Item';
      } else if (this.recordType === 'Instance') {
        query['itemOf.@id'] = this.mainEntity['@id'];
        query['@type'] = 'Item';

        // Check if my sigel has holding
        const myHoldingQuery = Object.assign({}, query);
        myHoldingQuery['_limit'] = 1;
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
        query['instanceOf.@id'] = this.mainEntity['@id'];
        query['@type'] = 'Instance';
      }
      this.getRelatedPosts(query).then((response) => {
        this.relationInfo = response.items;
        this.numberOfRelations = response.totalItems;
        this.checkingRelations = false;
      }, (error) => {
        console.log('Error checking for relations', error);
      });
    },
    gotoHolding() {
      const locationParts = this.myHolding.split('/');
      const fnurgel = locationParts[locationParts.length-1];
      this.$router.push({ path: `/${fnurgel}` });
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
        this.mainEntity['@type'], 
        this.resources.vocab, 
        this.resources.context
      );
    },
    recordId() {
      return this.mainEntity['@id'];
    }
  },
  events: {
  },
  components: {
    'create-item-button': CreateItemButton,
    'relations-list': RelationsList,
    'vue-simple-spinner': VueSimpleSpinner,
    'round-button': RoundButton,
  },
  watch: {
    'inspector.event'(val, oldVal) {
      if (val.name === 'form-control') {
        switch (val.value) { 
          case 'open-instances-window':
            this.showPanel();
            break;
          case 'close-modals':
            this.hidePanel();
            return true;
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
    <div class="ReverseRelations-number"
      v-show="!checkingRelations"
      v-if="!compact">
      <span class="ReverseRelations-label uppercaseHeading" @click="showPanel()" >
        <span v-if="recordType === 'Work'">{{ "Instantiations" | translatePhrase }}</span>
        <span v-if="recordType === 'Instance' || recordType === 'Item'">{{ "Libraries" | translatePhrase }}</span>
        <span v-if="isNaN(numberOfRelations)"> {{'Error' | translatePhrase}}</span>
        <span v-else> {{numberOfRelations}} </span>
      </span>
      <create-item-button class="ReverseRelations-button"
        v-if="recordType === 'Instance' && user.isLoggedIn && user.getPermissions().registrant" 
        :disabled="inspector.status.editing" 
        :has-holding="hasRelation" 
        :checking-holding="checkingRelations" 
        :holding-id="myHolding"
        @done="checkingRelations=false"></create-item-button>
    </div>
    <!-- compact view (in search result) -->
    <div class="ReverseRelations compact" v-if="compact">
      <div class="ReverseRelations-header uppercaseHeading--light">
        <span v-if="recordType === 'Instance'">{{"Holding" | translatePhrase}}</span>
        <span v-if="recordType === 'Work'">{{"Instances" | translatePhrase}}</span>
      </div>
      <vue-simple-spinner class="ReverseRelations compact"
        v-if="checkingRelations" 
        size="medium"></vue-simple-spinner>
      <div class="ReverseRelations-btnContainer" v-if="!checkingRelations">
        <round-button 
          v-if="recordType === 'Instance' && user.isLoggedIn && user.getPermissions().registrant" 
          :disabled="!hasRelation" 
          :color="hasRelation ? 'primary' : 'gray'"
          :icon="hasRelation ? 'check' : 'close'"
          @click="gotoHolding()"></round-button>
        <round-button
          :disabled="!numberOfRelations"
          :color="numberOfRelations > 0 ? 'primary' : 'gray'"
          @click="showPanel()">
          {{numberOfRelations}}</round-button>
      </div>
    </div>
    <!-- end -->
    <portal to="sidebar">
      <relations-list 
        v-if="relationsListOpen" 
        :relations-list="relationInfo" 
        :list-context-type="recordType"
        @close="hidePanel()"></relations-list>
    </portal>
  </div>
</template>

<style lang="less">

.ReverseRelations {
  height: 100%;
  
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

  &-header {
    margin-bottom: 10px;
  }

  &-btnContainer {
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    // justify-content: center;
  }

  &.compact {
    display: flex;
    flex-direction: column;
  }
}
</style>
