<script>
import { each, isArray } from 'lodash-es';
import { mapGetters } from 'vuex';
import LensMixin from '../mixins/lens-mixin';
import EncodingLevelIcon from '@/components/shared/encoding-level-icon';
import SummaryNode from '@/components/shared/summary-node';
import * as StringUtil from '@/utils/string';
import * as RecordUtil from '@/utils/record';

export default {
  mixins: [LensMixin],
  name: 'entity-summary',
  components: {
    EncodingLevelIcon,
    SummaryNode,
  },
  props: {
    focusData: {
      type: Object,
      default: null,
    },
    hoverLinks: {
      type: Boolean,
      default: true,
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
    excludeComponents: {
      type: Array,
      default: () => [],
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
    keyDisplayLimit: {
      default: 5,
      type: Number,
    },
    showAllKeys: {
      default: false,
      type: Boolean,
    },
    valueDisplayLimit: {
      default: 5,
      type: Number,
    },
    highlightStr: {
      type: [String, Boolean], 
      default: false,
    },
    encodingLevel: {
      type: [String, Boolean],
      default: false,
    },
  },
  data() {
    return {
      idHover: false,
      recentlyCopiedId: false,
      failedCopyId: false,
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
    ...mapGetters([
      'user',
    ]),
    idAsFnurgel() {
      if (this.focusData.hasOwnProperty('@id')) {
        const id = this.focusData['@id'];
        const fnurgel = RecordUtil.extractFnurgel(id);
        if (fnurgel && this.isLibrisResource) {
          return fnurgel;
        }
        const cleaned = id.replace('https://', '').replace('http://', '');
        return cleaned;
      }
      return null;
    },
    hiddenDetailsNumber() {
      return this.totalInfo.length - this.keyDisplayLimit;
    },
    idTooltipText() {
      return StringUtil.getUiPhraseByLang('Copy ID', this.user.settings.language);
    },
    isReplacedBy() {
      const info = this.getSummary.info;
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
    uri() {
      let uri = this.focusData['@id'];
      const meta = this.focusData.meta;
      if (meta && meta.hasOwnProperty('@id')) {
        uri = meta['@id'];
      }
      return uri;
    },
    routerPath() {
      if (this.uri) {
        const uriParts = this.uri.split('/');
        const fnurgel = uriParts[uriParts.length - 1];
        return `/${fnurgel}`;
      }
      return '';
    },
    settings() {
      return this.$store.getters.settings;
    },
    isLibrisResource() {
      return StringUtil.isLibrisResourceUri(this.uri, this.settings);
    },
    totalInfo() {
      const total = this.getSummary.info;
      return total.filter((prop) => {
        if (isArray(prop.value)) {
          return prop.value.join('').length > 0;
        } 
        return prop.value.length > 0;
      });
    },
    infoWithKeys() {
      const info = this.totalInfo;
      const infoObj = {};
      each(info, (node, index) => {
        if (Object.keys(infoObj).length < this.keyDisplayLimit || this.showAllKeys) {
          infoObj[node.property] = node.value.join(', ');
        }
      });
      return infoObj;
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
    isItem() {
      if (this.getCard['@type'] === 'Item') {
        return true;
      } return false;
    },
  },
  mounted() {
    this.$nextTick(() => {
      this.$emit('hiddenDetailsNumber', this.hiddenDetailsNumber);
    });
  },
  methods: {
    copyFnurgel() {
      const self = this;
      this.$copyText(this.focusData['@id']).then(() => {
        self.recentlyCopiedId = true;
        setTimeout(() => {
          self.recentlyCopiedId = false;
        }, 1000);
      }, (e) => {
        self.failedCopyId = true;
        console.warn(e);
      });
    },
    importThis() {
      this.$emit('import-this');
    },
    removeEntity() {
      this.$dispatch('remove-entity');
    },
    extractEntity() {
      this.$dispatch('extract-item');
    },
    highlight(header) {
      const index = header.toLowerCase().indexOf(this.highlightStr.toLowerCase());
      const newHeader = `${header.substr(0, index)}<span class="highlight">${header.substr(index, this.highlightStr.length)}</span>${header.substr(index + this.highlightStr.length)}`;
      return newHeader;
    },
  },
};
</script>

<template>
<section class="EntitySummary">
  <div class="EntitySummary-meta">
    <encoding-level-icon
      v-if="encodingLevel && !isItem"
      :encodingLevel="encodingLevel"
      :tooltipText="encodingLevel | labelByLang"/>
    <div :title="categorization.join(', ')" v-if="excludeComponents.indexOf('categorization') < 0" class="EntitySummary-type uppercaseHeading--light">
      {{categorization.join(', ')}} {{ isLocal ? '{lokal entitet}' : '' }}
      <span class="EntitySummary-sourceLabel" v-if="database">{{ database }}</span>
    </div>
    <div v-if="idAsFnurgel && excludeComponents.indexOf('id') < 0" class="EntitySummary-id uppercaseHeading--light" :class="{'recently-copied': recentlyCopiedId }" @mouseover="idHover = true" @mouseout="idHover = false">
      <i v-tooltip.top="idTooltipText" class="fa fa-copy EntitySummary-idCopyIcon" :class="{'collapsedIcon': !idHover || recentlyCopiedId }" @click.stop="copyFnurgel">
      </i>{{ idAsFnurgel }}
    </div>
  </div>

  <div class="EntitySummary-info">
    <h3 class="EntitySummary-title" v-bind:class="{ 'EntitySummary-title--imported': isImport && shouldLink, 'showAll': showAllKeys }">
      <span v-if="highlightStr && !shouldLink" 
        v-html="highlight(header.join(', '))"
        :title="header.join(', ')">
      </span>
      <span 
        v-if="!highlightStr && !shouldLink" 
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
        v-for="node in getSummary.info" 
        :key="node.property">
        <template v-if="isReplacedBy === ''">
          <span class="EntitySummary-detailsKey" :title="node.property | labelByLang">{{ node.property | labelByLang | capitalize }}</span>
          <span class="EntitySummary-detailsValue">
            <SummaryNode :hover-links="hoverLinks" v-for="(value, index) in node.value" :is-last="index === node.value.length - 1" :key="index" :item="value" :parent-id="focusData['@id']" />
          </span>
        </template>
        <template v-else>
          <span  class="EntitySummary-detailsKey">Ersatt av</span>
          <span class="EntitySummary-detailsValue">{{ v }}</span>
        </template>
      </li>
    </ul>
  </div>
</section>
</template>

<style lang="less">

.EntitySummary {
  display: flex;
  flex-basis: auto; // IE11 fix
  flex-direction: column;
  justify-content: space-between;
  width: 100%;
  min-width: 0%;
  padding: 0.5em 0.75em 0.5em 0.75em;

  .EntityHeader & {
    padding: 0;
  }

  &-meta {
    border-width: 0px;
    display: flex;
  }

  &-type, &-id {
    display: block;
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
  &-type {
    text-align: left;
    flex-grow: 2;
    flex-basis: 50%;
  }
  &-id {
    flex-grow: 0;
    text-align: right;
    text-transform: none;
    color: @gray-very-dark-transparent;
    background-color: @badge-color-transparent;
    transition: background-color 0.5s ease;
    letter-spacing: 0.5px;
    font-weight: 400;
    padding: 0 0.75em;
    border-radius: 1em;

    &.recently-copied {
      background-color: @brand-success;
      color: @white;
    }
  }
  &-idCopyIcon {
    transition: all 0.25s ease;
    margin: 0 0.25em 0 -0.25em;
    overflow: hidden;
    width: 1.2em;
    opacity: 1;
    cursor: pointer;
    &.collapsedIcon {
      margin: 0 0 0 0;
      width: 0;
      opacity: 0;
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
    line-height: 1.5;
  }

  &-title {
    font-size: 1.8rem;
    margin: 0;
    overflow: hidden;
    width: 100%;
    position: relative;
    text-overflow: ellipsis;
    display: -webkit-box;
    line-height: 1.8em;
    display: block;
    white-space: nowrap;
    height: auto;

    & .highlight {
      background-color: @brand-faded;
    }

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

    @media (max-width: 768px) {
      white-space: normal;
      display: -webkit-box;
      line-height: 1.4em;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
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
    padding: 0px;
    margin: 0px;
    // max-height: 175px;
  }

  &-id {
  }

  &-idInfo {
  }

  &-detailsItem {
    display: flex;
    min-width: 0;
    font-size: 1.4rem;
    padding: 0.2em 0;
  }

  &-detailsKey {
    flex-basis: 6em;
    flex-grow: 1;
    font-weight: 600;
    margin-right: 0.5em;
    color: @gray-darker;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
  }

  &-detailsValue {
    flex-basis: 75%;
    flex-grow: 2;
    color: #000;
    white-space: nowrap;
    align-self: flex-end;
    overflow-x: hidden;
    text-overflow: ellipsis;
  }

  &-icon {
    vertical-align: middle;
  }
}
</style>
