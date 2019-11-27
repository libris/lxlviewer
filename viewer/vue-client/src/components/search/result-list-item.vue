<script>
import LensMixin from '../mixins/lens-mixin';
import ResultMixin from '../mixins/result-mixin';
import ReverseRelations from '@/components/inspector/reverse-relations';
import TagSwitch from '@/components/shared/tag-switch';
import * as StringUtil from '@/utils/string';
import * as VocabUtil from '@/utils/vocab';

export default {
  name: 'result-list-item',
  mixins: [LensMixin, ResultMixin],
  props: {
    focusData: {},
    showDetailed: {
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
    isLibrisResource() {
      return StringUtil.isLibrisResourceUri(this.focusData.meta['@id'], this.settings);
    },
  },
  methods: {
    setHiddenDetailsNumber(value) {
      this.hiddenDetailsNumber = value;
    },
  },
  components: {
    TagSwitch,
    ReverseRelations,
  },
  mounted() { 
  },
};
</script>

<template>
  <li class="ResultItem ResultItem--detailed" 
    v-if="showDetailed">
    <entity-summary 
      @hiddenDetailsNumber="setHiddenDetailsNumber"
      :focus-data="focusData" 
      :database="database" 
      :is-import="isImport" 
      :import-item="importItem" 
      :exclude-components="isImport ? ['id'] : []"
      :show-all-keys="showAllKeys || hiddenDetailsNumber === 1"
      @import-this="importThis()"
      :valueDisplayLimit=3>
    </entity-summary>
    <div class="ResultItem-bottomBar">
      <div class="ResultItem-controls">
        <span v-if="hiddenDetailsNumber > 1" class="ResultItem-showMore" @click="showAllKeys = !showAllKeys">{{ showAllKeys ? 'Show fewer' : 'Show more' | translatePhrase }}{{ showAllKeys ? '' : ` (${hiddenDetailsNumber})` }}</span>
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
  <li class="ResultItem ResultItem--compact" v-else-if="!showDetailed">
    <h3 class="ResultItem-title" 
      :class="{'ResultItem-title--imported' : isImport}"
      :title="header.join(', ')" 
      v-on:click="importThis()" 
      v-if="isImport">
      <i class="fa fa-external-link" aria-hidden="true"></i> {{ header.join(', ') }}
    </h3>
    <h3 class="ResultItem-title header">
      <router-link class="ResultItem-link"
        v-if="isLibrisResource && !isImport"  
        :title="header.join(', ')" 
        :to="focusData.meta['@id'] | asFnurgelLink">{{ header.join(', ') }}
      </router-link>
      <a class="ResultItem-link"
        v-if="!isLibrisResource && !isImport" 
        :title="header.join(', ')" 
        :href="focusData['@id'] | convertResourceLink">{{ header.join(', ') }}
      </a>
    </h3>
    <span class="ResultItem-category uppercaseHeading--light" :title="categorization.join(', ')">
      {{categorization.join(', ')}}
    </span>
  </li>
</template>

<style lang="less">

.ResultItem {
  &--detailed {
    display: flex;
    flex-direction: column;
    list-style: none;
    margin-bottom: 0.5em;
    padding: 0.5em 1em 0.25em 1em;
    background-color: @white;
    border: 1px solid @gray-lighter;
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
  }

  &--compact {
    display: flex;
    align-items: center;
    margin: -1px 0 0 0;
    background-color: @white;
    border: 1px solid @gray-lighter;
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
