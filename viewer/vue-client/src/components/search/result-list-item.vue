<script>
import LensMixin from '../mixins/lens-mixin';
import ResultMixin from '../mixins/result-mixin';
import EntitySummary from '../shared/entity-summary';
import ReverseRelations from '@/components/inspector/reverse-relations';
import * as StringUtil from '@/utils/string';

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
    };
  },
  computed: {
    settings() {
      return this.$store.getters.settings;
    },
    user() {
      return this.$store.getters.user;
    },
    categorization() {
      return StringUtil.getFormattedEntries(
        this.getSummary.categorization, 
        this.resources.vocab, 
        this.settings, 
        this.resources.context,
      );
    },
    header() {
      return StringUtil.getFormattedEntries(
        this.getSummary.header, 
        this.resources.vocab, 
        this.settings, 
        this.resources.context,
      );
    },
    isLibrisResource() {
      return StringUtil.isLibrisResourceUri(this.focusData['@id'], this.settings);
    },
  },
  methods: {
  },
  components: {
    'entity-summary': EntitySummary,
    'reverse-relations': ReverseRelations,
  },
  mounted() { 
  },
};
</script>

<template>
  <li class="ResultItem ResultItem--detailed" 
    v-if="showDetailed">
    <entity-summary 
      :focus-data="focusData" 
      :database="database" 
      :router-path="focusData['@id'] | asFnurgelLink" 
      :is-import="isImport" 
      :import-item="importItem" 
      :add-link="true" 
      @import-this="importThis()"
      :valueDisplayLimit=3>
    </entity-summary>
    <div class="ResultItem-relationsContainer"
      v-if="this.$route.params.perimeter !== 'remote'">
      <reverse-relations 
        :main-entity="focusData" 
        :compact=true>
      </reverse-relations>
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
    display: flex;
    list-style: none;
    margin-bottom: 15px;
    padding: 15px 20px;
    background-color: @white;
    border: 1px solid @gray-lighter;
    transform: translateX(0);
    transition: transform .2s cubic-bezier(0.21, 0.21, 0.62, 1.23);

    & .EntitySummary {
      flex: 1;
      justify-content: start;
      padding: 0 15px 0 0;
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

  &-relationsContainer {
    display: flex;
    flex: 0 0 80px;
    flex-direction: column;
    border-left: 1px solid @gray-lighter;
    align-items: center;
    padding-left: 10px;
  }
}

</style>
