<script>
import * as StringUtil from 'lxljs/string';
import * as VocabUtil from 'lxljs/vocab';
import LensMixin from '../mixins/lens-mixin';
import ResultMixin from '../mixins/result-mixin';
import ReverseRelations from '@/components/inspector/reverse-relations';
import TagSwitch from '@/components/shared/tag-switch';
import * as RecordUtil from '@/utils/record';

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
    };
  },
  computed: {
    settings() {
      return this.$store.getters.settings;
    },
    recordType() {
      return VocabUtil.getRecordType(
        this.focusData['@type'], 
        this.resources.vocab, 
        this.resources.context,
      );
    },
    user() {
      return this.$store.getters.user;
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
        return this.showAllKeys ? 'Hide properties' : 'Show properties';
      }      
      return this.showAllKeys ? 'Show fewer' : 'Show more';
    },
  },
  methods: {
    setHiddenDetailsNumber(value) {
      this.hiddenDetailsNumber = value;
    },
    toggleShowKeys() {
      this.showAllKeys = !this.showAllKeys;
    },
  },
  components: {
    TagSwitch,
    ReverseRelations,
  },
};
</script>

<template>
  <li class="ResultItem" :class="{'ResultItem--compact' : showCompact}">
    <entity-summary 
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
    </entity-summary>
    <div class="ResultItem-bottomBar">
      <div class="ResultItem-controls">
        <span v-if="hiddenDetailsNumber > 1" class="ResultItem-showMore" @click="toggleShowKeys">
          {{ showKeysText | translatePhrase }}{{ showAllKeys ? '' : ` (${hiddenDetailsNumber})` }}
        </span>
      </div>
      <div class="ResultItem-tags" v-if="user.isLoggedIn && isImport === false && recordType === 'Instance'">
        <tag-switch :document="focusData" class="" :action-labels="{ on: 'Flag for', off: 'Unflag for' }" tag="Directory care" />
      </div>
      <div class="ResultItem-relationsContainer"
        v-if="isImport === false">
        <reverse-relations 
          :main-entity="focusData" 
          :compact="true">
        </reverse-relations>
      </div>
    </div>
  </li>  
</template>

<style lang="less">

.ResultItem {

  display: flex;
  flex-direction: column;
  list-style: none;
  margin-bottom: 0.5em;
  padding: 0.5em 1em 0.25em 1em;
  background-color: @white;
  border: 1px solid @grey-lighter;
  transform: translateX(0);
  transition: transform .2s cubic-bezier(0.21, 0.21, 0.62, 1.23);

  & .EntitySummary {
    justify-content: start;
    padding: 0;
    min-width: 0;
  }

  &.is-highlighted {
    transform: translateX(25px);
    border: 1px solid @grey-light;  
  }

  &--compact {
    display: flex;
    margin: -1px 0 0 0;
    background-color: @white;
    border: 1px solid @grey-lighter;
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
    color: @brand-primary;
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
        color: @link-hover-color;
      }
    }
  }

  &-link {
    &:visited {
      // Commented out until fixing in IE11
      // color: @link-visited-color;
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
    color: @link-color;
  }
  &-tags {
    display: flex;
    align-items: center;
    margin-right: 1em;
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
