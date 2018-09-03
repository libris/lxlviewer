<script>
import LensMixin from '../mixins/lens-mixin';
import ResultMixin from '../mixins/result-mixin';
import EntitySummary from '../shared/entity-summary';
import * as StringUtil from '@/utils/string';

export default {
  name: 'result-list-item',
  mixins: [LensMixin, ResultMixin],
  props: {
    focusData: {},
    showDetailed: false,
    importItem: {},
    database: '',
  },
  data() {
    return {
      keyword: '',
    }
  },
  computed: {
    settings() {
      return this.$store.getters.settings;
    },
    user() {
      return this.$store.getters.user;
    },
    categorization() {
      return StringUtil.getFormattedEntries(this.getSummary.categorization, this.resources.vocab, this.settings, this.resources.context);
    },
    header() {
      return StringUtil.getFormattedEntries(this.getSummary.header, this.resources.vocab, this.settings, this.resources.context);
    },
    isLibrisResource() {
      return StringUtil.isLibrisResourceUri(this.focusData['@id'], this.settings.apiPath);
    },
  },
  components: {
    'entity-summary': EntitySummary,
  },
  mounted() { 
  },
};
</script>

<template>
    <li class="ResultItem ResultItem--detailed" v-if="showDetailed">
      <entity-summary 
        :focus-data="focusData" 
        :database="database" 
        :router-path="focusData['@id'] | asFnurgelLink" 
        :is-import="isImport" 
        :import-item="importItem" 
        :add-link="true" 
        @import-this="importThis()"
        :lines="4"></entity-summary>
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
          :to="focusData['@id'] | asFnurgelLink">{{ header.join(', ') }}
        </router-link>
        <a class="ResultItem-link"
          v-if="!isLibrisResource && !isImport" 
          :title="header.join(', ')" 
          :href="focusData['@id']">{{ header.join(', ') }}
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
    list-style: none;
    margin-bottom: 15px;
    .panel-mixin(@neutral-color);
  }

  &--compact {
    display: flex;
    align-items: center;
    margin: -1px 0 0 0;
    background-color: @white;
    border: 1px solid @gray-light;
    border-radius: 4px;
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

  &-category {
    margin-left: 10px;
    display: inline-block;
    flex-basis: 30%;
    text-align: right;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

</style>
