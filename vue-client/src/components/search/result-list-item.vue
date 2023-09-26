<script>
import { mapState } from 'pinia';
import { useUserStore } from '@/stores/user';
import { useSettingsStore } from '@/stores/settings';
import * as StringUtil from 'lxljs/string';
import * as VocabUtil from 'lxljs/vocab';
import ReverseRelations from '@/components/inspector/reverse-relations.vue';
import TagSwitch from '@/components/shared/tag-switch.vue';
import * as RecordUtil from '@/utils/record';
import LensMixin from '../mixins/lens-mixin.vue';
import ResultMixin from '../mixins/result-mixin.vue';
import EntitySummary from '../shared/entity-summary.vue';
import { translatePhrase } from '@/utils/filters';

export default {
  name: 'result-list-item',
  mixins: [LensMixin, ResultMixin],
  props: {
    focusData: {},
    showCompact: {
      type: Boolean,
      default: false,
    },
    importItem: {},
    database: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      keyword: '',
      hiddenDetailsNumber: null,
      showAllKeys: false,
      totalReverseCount: -1,
      itemReverseCount: -1,
    };
  },
  computed: {
    ...mapState(useUserStore, ['user']),
    ...mapState(useSettingsStore, ['settings']),
    recordType() {
      return VocabUtil.getRecordType(
        this.focusData['@type'],
        this.resources.vocab,
        this.resources.context,
      );
    },
    categorization() {
      return StringUtil.getFormattedEntries(
        this.getSummary.categorization,
        this.resources.vocab,
        this.user.settings.language,
        this.resources.context,
      );
    },
    header() {
      return StringUtil.getFormattedEntries(
        this.getSummary.header,
        this.resources.vocab,
        this.user.settings.language,
        this.resources.context,
      );
    },
    recordId() {
      return RecordUtil.getRecordId(this.focusData, this.inspector.data.quoted);
    },
    isLibrisResource() {
      return StringUtil.isLibrisResourceUri(this.recordId, this.settings);
    },
    showKeysText() {
      if (this.showCompact) {
        return this.showAllKeys ? translatePhrase('Hide properties') : translatePhrase('Show properties');
      }
      return this.showAllKeys ? translatePhrase('Show fewer') : translatePhrase('Show more');
    },
    showUsedIn() {
      if (this.recordType !== 'Instance') {
        return true;
      }
      
      const itemCountReady = this.itemReverseCount !== -1;
      return itemCountReady && this.totalReverseCount > 0 && this.totalReverseCount !== this.itemReverseCount;
    },
  },
  methods: {
    setHiddenDetailsNumber(value) {
      this.hiddenDetailsNumber = value;
    },
    toggleShowKeys() {
      this.showAllKeys = !this.showAllKeys;
    },
    itemCount(value) {
      this.itemReverseCount = value;
    },
    allCount(value) {
      this.totalReverseCount = value;
    },
  },
  components: {
    TagSwitch,
    ReverseRelations,
    EntitySummary
},
};
</script>

<template>
  <li class="ResultItem" :class="{'ResultItem--compact' : showCompact}">
    <EntitySummary
      @hiddenDetailsNumber="setHiddenDetailsNumber"
      :focus-data="focusData" 
      :database="database" 
      :is-import="isImport" 
      :import-item="importItem" 
      :exclude-components="isImport ? ['id'] : []"
      :show-all-keys="showAllKeys || hiddenDetailsNumber === 1"
      :key-display-limit="showCompact ? 0 : 5"
      @import-this="importThis()"
      :valueDisplayLimit=3>
    </EntitySummary>
    <div class="ResultItem-bottomBar">
      <div class="ResultItem-controls">
        <span v-if="hiddenDetailsNumber > 1" class="ResultItem-showMore" @click="toggleShowKeys">
          {{ showKeysText }}{{ showAllKeys ? '' : ` (${hiddenDetailsNumber})` }}
        </span>
      </div>
      <div class="ResultItem-tags" v-if="user.isLoggedIn && isImport === false">
        <!-- <tag-switch :document="focusData" class="" :action-labels="{ on: 'Mark as', off: 'Unmark as' }" tag="Bookmark" /> -->
        <tag-switch v-if="recordType === 'Instance'" :document="focusData" class="" :action-labels="{ on: 'Mark as', off: 'Unmark as' }" tag="Flagged" />
      </div>
      <div class="ResultItem-relationsContainer"
        v-if="isImport === false">
        <reverse-relations v-show="showUsedIn"
          @numberOfRelations="allCount"
          :main-entity="focusData" 
          :compact="true">
        </reverse-relations>
        <reverse-relations v-if="recordType === 'Instance'"
          @numberOfRelations="itemCount"
          :main-entity="focusData"
          :mode="'items'"
          :compact="true">
        </reverse-relations>
      </div>
    </div>
  </li>  
</template>

<style lang="scss">

.ResultItem {

  display: flex;
  flex-direction: column;
  list-style: none;
  margin-bottom: 0.5em;
  padding: 0.5em 1em 0.25em 1em;
  background-color: $white;
  border: 1px solid $grey-lighter;
  transform: translateX(0);
  transition: transform .2s cubic-bezier(0.21, 0.21, 0.62, 1.23);

  & .EntitySummary {
    justify-content: start;
    padding: 0;
    min-width: 0;
  }

  &.is-highlighted {
    transform: translateX(25px);
    border: 1px solid $grey-light;
  }

  &--compact {
    display: flex;
    margin: -1px 0 0 0;
    background-color: $white;
    border: 1px solid $grey-lighter;
    padding: 0.5em 1em;
    line-height: 1.2em;

    & .fa-external-link {
      margin: 4px 6px 0 0;
      font-size: 14px;
    }
  }

  &-title {
    font-size: 20px;
    font-size: 2.0rem;
    line-height: 1.3;
    color: $brand-primary;
    font-weight: 600;
    margin: 0px;
    display: inline-block;
    flex-basis: 50%;
    flex-grow: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    &--imported {
      cursor: pointer;
      &:hover {
        text-decoration: underline;
        color: $link-hover-color;
      }
    }
  }

  &-link {
    &:visited {
      // Commented out until fixing in IE11
      // color: $link-visited-color;
    }
  }

  &-category {
    margin-left: 10px;
    display: inline-block;
    flex-basis: 30%;
    text-align: right;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &-bottomBar {
    justify-content: space-between;
    display: flex;
  }

  &-controls {
    display: flex;
    flex-basis: 50%;
    flex-grow: 1;
    align-items: center;
  }
  &-showMore {
    font-weight: 600;
    font-size: 1.4rem;
    cursor: pointer;
    color: $link-color;
  }
  &-tags {
    display: flex;
    align-items: center;
    margin-left: 1em;
    .TagSwitch {
      display: flex;
    }
  }

  &-relationsContainer {
    display: flex;
    justify-content: flex-end;
  }
}

</style>
