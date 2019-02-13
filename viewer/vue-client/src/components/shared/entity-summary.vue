<script>
import { each } from 'lodash-es';
import LensMixin from '../mixins/lens-mixin';
import * as StringUtil from '@/utils/string';

export default {
  mixins: [LensMixin],
  name: 'entity-summary',
  props: {
    focusData: {
      type: Object,
      defualt: null,
    },
    actions: {
      type: Boolean,
      default: false,
    },
    isLocal: {
      type: Boolean,
      default: false,
    },
    isExtractable: {
      type: Boolean,
      default: false,
    },
    isImport: {
      type: Boolean,
      default: false,
    },
    importItem: {
      type: Object,
      default: null,
    },
    database: {
      type: String,
      default: '',
    },
    shouldLink: {
      default: true,
      type: Boolean,
    },
    shouldOpenTab: {
      type: Boolean,
      default: false,
    },
    isCompact: {
      default: false,
      type: Boolean,
    },
    valueDisplayLimit: {
      default: 5,
      type: Number,
    }, 
  },
  data() {
    return {
      defaultSettings: {
        show: false,
        styling: 'gray',
        text: '',
        payload: {},
        event: '',
      },
    };
  },
  computed: {
    isReplacedBy() {
      const info = this.getSummary.info.concat(this.getSummary.sub);
      const infoObj = {};
      let value = '';
      each(info, (node) => {
        infoObj[node.property] = node.value.join(', ');
        if (node.property === 'isReplacedBy') {
          value = node.value;
        }
      });
      return value;
    },
    routerPath() {
      if (this.focusData.hasOwnProperty('@id')) {
        const uriParts = this.focusData['@id'].split('/');
        const fnurgel = uriParts[uriParts.length - 1];
        return `/${fnurgel}`;
      }
      return '';
    },
    settings() {
      return this.$store.getters.settings;
    },
    isLibrisResource() {
      return StringUtil.isLibrisResourceUri(this.focusData['@id'], this.settings);
    },
    infoWithKeys() {
      const info = this.getSummary.info.concat(this.getSummary.sub);
      const infoObj = {};
      each(info, (node) => {
        const remainder = node.value.length > this.valueDisplayLimit ? ` <span class="badge">+${node.value.length - this.valueDisplayLimit}</span>` : '';
        const trimmed = node.value.slice(0, this.valueDisplayLimit).join(', ') + remainder;
        infoObj[node.property] = trimmed;
      });
      return infoObj;
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
    identifiers() {
      const identifiersList = StringUtil.getFormattedEntries(
        this.getSummary.identifiers, 
        this.resources.vocab, 
        this.settings, 
        this.resources.context,
      );
      return identifiersList;
    },
    info() {
      return StringUtil.getFormattedEntries(
        this.getSummary.info, 
        this.resources.vocab, 
        this.settings, 
        this.resources.context,
      );
    },
    sub() {
      let allThings = StringUtil.getFormattedEntries(
        this.getSummary.info, 
        this.resources.vocab, 
        this.settings, 
        this.resources.context,
      );
      allThings = allThings.concat(StringUtil.getFormattedEntries(
        this.getSummary.sub, 
        this.resources.vocab, 
        this.settings, 
        this.resources.context,
      ));
      return allThings;
    },
  },
  methods: {
    importThis() {
      this.$emit('import-this');
    },
    removeEntity() {
      this.$dispatch('remove-entity');
    },
    extractEntity() {
      this.$dispatch('extract-item');
    },
  },
};
</script>

<template>
<section class="EntitySummary">
  <div class="EntitySummary-meta">
    <div class="EntitySummary-type uppercaseHeading--light">
      {{categorization.join(', ')}} {{ isLocal ? '{lokal entitet}' : '' }}
      <span class="EntitySummary-sourceLabel" v-if="database">{{ database }}</span>
    </div>
  </div>

  <div class="EntitySummary-info">
    <h3 class="EntitySummary-title" v-bind:class="{ 'EntitySummary-title--imported': isImport && shouldLink }">
      
      <span 
        v-if="!shouldLink" 
        :title="header.join(', ')">{{ header.join(', ') }}</span>
      <span
        v-if="isImport && shouldLink" 
        :title="header.join(', ')" 
        v-on:click="importThis()">
        <i class="fa fa-external-link" aria-hidden="true"></i>
        {{ header.join(', ') }}
      </span>
      <router-link class="EntitySummary-titleLink"
        v-if="isLibrisResource && !isImport && shouldLink" 
        :to="this.routerPath" 
        :title="header.join(', ')"
        :target="shouldOpenTab ? '_blank' : '' ">
        <i v-if="shouldOpenTab" class="EntitySummary-icon fa fa-external-link" aria-hidden="true"></i>
        {{ header.join(', ') }}
      </router-link>
      <a class="EntitySummary-titleLink"
        v-if="!isLibrisResource && !isImport && shouldLink" 
        :href="focusData['@id']" 
        :title="header.join(', ')"
        :target="shouldOpenTab ? '_blank' : '' ">
        <i v-if="shouldOpenTab" class="EntitySummary-icon fa fa-external-link" aria-hidden="true"></i>
        {{ header.join(', ') }}
      </a>
      
    </h3>
    <ul class="EntitySummary-details" v-show="!isCompact">
      <li class="EntitySummary-detailsItem" 
        v-if="identifiers.length > 0">
        <span class="EntitySummary-detailsKey EntitySummary-id uppercaseHeading--bold">
        {{ identifiers[0] }}</span>
        <span class="EntitySummary-detailsValue EntitySummary-idInfo" 
          v-if="identifiers.length > 1"><span class="badge">+{{ identifiers.length-1 }}</span></span>
      </li>
      <li class="EntitySummary-detailsItem" 
        v-show="v.length !== 0" 
        v-for="(v, k) in infoWithKeys" 
        :key="k">
        <span v-if="isReplacedBy === ''">
          <span  class="EntitySummary-detailsKey uppercaseHeading--bold">{{ k | labelByLang }}:</span>
          <span class="EntitySummary-detailsValue" v-html="v"></span>
        </span>
        <span v-if="isReplacedBy !== ''">
          <span  class="EntitySummary-detailsKey uppercaseHeading--bold">Ersatt av:</span>
          <span class="EntitySummary-detailsValue">{{ v }}</span>
        </span>
      </li>
    </ul>
  </div>
</section>
</template>

<style lang="less">

.EntitySummary {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 100%;
  padding: 15px 20px;

  .EntityHeader & {
    padding: 0;
  }

  &-meta {
    border-width: 0px;
  }

  &-type {
    display: block;
    flex-basis: 85%;
    flex-grow: 2;
    margin-bottom: -0.4em;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    .database {
      border: 1px solid @gray;
      border-radius: 0.3em;
      float: right;
      line-height: 1;
      padding: 3px;
    }
  }

  &-sourceLabel {
    border: 1px solid;
    border-radius: 0.5em;
    padding: 0px 0.5em;
    float: right;
    margin-right: 0.5em;
  }

  &-info {
    overflow: hidden;
    line-height: 1.4;
  }

  &-title {
    font-size: 20px;
    font-size: 2rem;
    margin: 5px 0;
    line-height: 26px;
    overflow: hidden;
    width: 100%; 
    position: relative;

    .ResultList & {
      color: @brand-darker;
    }

    &--imported {
      cursor: pointer;
      &:hover {
        text-decoration: underline;
        color: @link-hover-color;
      }
    }

    @media (min-width: 768px) {
      text-overflow: ellipsis;
      white-space: nowrap;
      height: auto;
    }
  }

  &-titleLink {
    &:visited {
      // Commented out until fixing in IE11
      // color: @link-visited-color;
    }
    &.blue-link {
      color: @brand-id;
    }
  }

  &-details {
    list-style-type: none;
    margin: 0;
    padding: 0px;
    max-height: 175px;
  }

  &-id {
  }

  &-idInfo {
  }

  &-detailsItem {
    display: inline;
    margin-right: 10px;
  }

  &-detailsKey {
  }

  &-detailsValue {
    font-size: 16px;
    font-size: 1.6rem;
  }

  &-icon {
    vertical-align: middle;
  }
}
</style>
