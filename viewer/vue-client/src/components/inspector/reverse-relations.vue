<script>
import * as _ from 'lodash';
import * as VocabUtil from '../../utils/vocab';
import CreateItemButton from './create-item-button';
import RelationsList from '@/components/inspector/relations-list';
import RoundButton from '@/components/shared/round-button.vue';
import { mapGetters } from 'vuex';
import VueSimpleSpinner from 'vue-simple-spinner';
import TooltipComponent from '@/components/shared/tooltip-component';

export default {
  name: 'reverse-relations',
  props: {
    mainEntity: null,
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
      panelQuery: '',
    };
  },
  methods: {
    showPanel() {
      this.$store.dispatch('pushInspectorEvent', { 
        name: 'form-control', 
        value: 'close-modals',
      }).then(() => {
        this.$nextTick(() => {
          this.relationsListOpen = true;
          this.$parent.$el.classList.add('is-highlighted');
        });
      });
    },
    hidePanel() {
      this.relationsListOpen = false;
      this.$parent.$el.classList.remove('is-highlighted');
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
      this.checkingRelations = true;
      const timeoutLength = 1100; // Needed so that the index has time to update 
      setTimeout(() => { // 
        const query = {
          _limit: 0,
        };
        if (this.recordType === 'Item') {
          query['itemOf.@id'] = this.mainEntity.itemOf['@id'];
          query['@type'] = 'Item';
        } else if (this.recordType === 'Instance') {
          query['itemOf.@id'] = this.mainEntity['@id'];
          query['@type'] = 'Item';

          // Check if my sigel has holding
          const myHoldingQuery = Object.assign({}, query);
          myHoldingQuery._limit = 1;
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
        } else if (this.recordType === 'Agent') {
          query['instanceOf.contribution.agent.@id'] = this.mainEntity['@id'];
        } else {
          query.q = this.mainEntity['@id'];
        }
        this.panelQuery = Object.assign({}, query);
        if (this.recordType === 'Item' || this.recordType === 'Instance') {
          // Sort panel query by alphabetical order of sigel id
          this.panelQuery._sort = 'heldBy.@id';
        }
        this.getRelatedPosts(query).then((response) => {
          this.relationInfo = response.items;
          this.numberOfRelations = response.totalItems;
          this.checkingRelations = false;
        }, (error) => {
          console.log('Error checking for relations', error);
        });
      }, timeoutLength);
    },
    gotoHolding() {
      const locationParts = this.myHolding.split('/');
      const fnurgel = locationParts[locationParts.length - 1];
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
    numberOfRelationsCircle() {
      const no = this.numberOfRelations;
      let compact = '';
      let compactNo = 0;
      if (no > 999 && no < 1000000) {
        compactNo = parseInt(no / 1000);
        compact = `${compactNo}k`;
      } else if (no > 999999) {
        compactNo = Math.round(no / 1000000);
        compact = `${compactNo}M`;
      } else {
        compact = `${no}`;
      }
      return compact;
    },
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
        this.resources.context,
      );
    },
    recordId() {
      return this.mainEntity['@id'];
    },
    totalRelationTooltipText() {
      if (this.recordType === 'Instance' || this.recordType === 'Item') {
        if (this.numberOfRelations === 0) {
          return 'No holdings';
        } if (Number.isNaN(this.numberOfRelations)) {
          return 'Holdings could not be loaded';
        } 
        return 'Show all holdings';
      } if (this.recordType === 'Agent') {
        if (this.numberOfRelations === 0) {
          return 'No contributions';
        } if (Number.isNaN(this.numberOfRelations)) {
          return 'Contribution could not be loaded';
        } 
        return 'Show all contributions';
      } 
      if (this.numberOfRelations === 0) {
        return 'No uses';
      } if (Number.isNaN(this.numberOfRelations)) {
        return 'Uses could not be loaded';
      } 
      return 'Show all uses';
    },
  },
  events: {
  },
  components: {
    'create-item-button': CreateItemButton,
    'relations-list': RelationsList,
    'vue-simple-spinner': VueSimpleSpinner,
    'round-button': RoundButton,
    'tooltip-component': TooltipComponent,
  },
  watch: {
    'inspector.event'(val) {
      if (val.name === 'form-control') {
        switch (val.value) { 
          case 'open-instances-window':
            this.showPanel();
            break;
          case 'close-modals':
            this.hidePanel();
            break;
          default:
        }
      } else if (val.name === 'post-events') {
        switch (val.value) {
          case 'on-post-loaded':
            this.getRelationsInfo();
            break;
          default:
        }
      }
    },
    relationsListOpen(val, oldVal) { 
      if (val !== oldVal) {
        this.$parent.$emit('relations-list-open', val);
      }
    },
    numberOfRelations(val) {
      this.numberOfRelations = val;
    },
  },
  mounted() {
    this.$nextTick(() => {
      if (this.$route.name === 'Search') {
        this.getRelationsInfo();
      }
    });
  },
};
</script>

<template>
  <div class="ReverseRelations">
    <vue-simple-spinner class="ReverseRelations-spinner"
      v-show="checkingRelations"
      v-if="!compact" 
      size="medium">
    </vue-simple-spinner>
    <div class="ReverseRelations-number"
      v-show="!checkingRelations"
      v-if="!compact">
      <span class="uppercaseHeading">
        <span class="ReverseRelations-label" 
          v-if="recordType === 'Work'">{{ "Instantiations" | translatePhrase }}</span>
        <span class="ReverseRelations-label" 
          v-if="recordType === 'Instance' || recordType === 'Item'">{{ "Libraries" | translatePhrase }}</span>
        <span class="ReverseRelations-label" 
          v-if="recordType === 'Agent'">{{ "Contribution" | translatePhrase }}</span>
        <round-button
          :button-text="numberOfRelationsCircle"
          :disabled="numberOfRelations === 0 || isNaN(numberOfRelations)"
          :indicator="numberOfRelations > 0"
          :icon="isNaN(numberOfRelations) ? 'exclamation' : false"
          @click="showPanel()">
          <template slot="tooltip">
            <tooltip-component 
              class="Toolbar-tooltipContainer"
              position="left"
              :show-tooltip="true"
              :tooltip-text="totalRelationTooltipText" 
              translation="translatePhrase"></tooltip-component>
          </template>
        </round-button>
      </span>
      <create-item-button class="ReverseRelations-button"
        v-if="recordType === 'Instance' && user.isLoggedIn && user.getPermissions().registrant" 
        :disabled="inspector.status.editing" 
        :compact="false"
        :main-entity="mainEntity"
        :has-holding="hasRelation" 
        :checking-holding="checkingRelations" 
        :holding-id="myHolding"
        @done="checkingRelations=false"></create-item-button>
    </div>
    <!-- compact view (in search result) -->
    <div class="ReverseRelations compact" 
      v-if="compact">
      <div class="ReverseRelations-header uppercaseHeading--light">
        <span v-if="recordType === 'Instance'">{{"Holding" | translatePhrase}}</span>
        <span v-else-if="recordType === 'Agent'">{{ "Contribution" | translatePhrase }}</span>
        <span v-else>{{"Used in" | translatePhrase}}</span>
      </div>
      <vue-simple-spinner class="ReverseRelations spinner compact"
        v-if="checkingRelations" 
        size="medium">
      </vue-simple-spinner>
      <div class="ReverseRelations-btnContainer" v-if="!checkingRelations">
        <create-item-button class="ReverseRelations-button"
        v-if="recordType === 'Instance' && user.isLoggedIn && user.getPermissions().registrant" 
        :compact="true"
        :main-entity="mainEntity"
        :has-holding="hasRelation" 
        :checking-holding="checkingRelations" 
        :holding-id="myHolding"
        @done="checkingRelations=false"></create-item-button>
        <round-button
          :button-text="numberOfRelationsCircle"
          :disabled="!numberOfRelations || isNaN(numberOfRelations)"
          :indicator="numberOfRelations > 0"
          :icon="isNaN(numberOfRelations) ? 'exclamation' : false"
          @click="showPanel()">
          <template slot="tooltip">
            <tooltip-component 
              class="Toolbar-tooltipContainer"
              position="left"
              :active="true"
              :show-tooltip="true"
              :tooltip-text="totalRelationTooltipText" 
              translation="translatePhrase"></tooltip-component>
          </template>
        </round-button>
      </div>
    </div>
    <!-- end -->
    <portal to="sidebar">
      <relations-list 
        v-if="relationsListOpen"
        :query="panelQuery"
        :item-of="mainEntity"
        :list-context-type="recordType"
        @close="hidePanel()"></relations-list>
    </portal>
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
    margin-right: 5px;
  }

  &-header {
    margin-bottom: 5px;
  }

  &-btnContainer {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  &.compact {
    display: flex;
    flex-direction: column;
  }

  &-spinner {
    margin-bottom: 10px;
  }
}
</style>
