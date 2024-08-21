<script>
import { each, isArray, cloneDeep } from 'lodash-es';
import { mapGetters } from 'vuex';
import * as StringUtil from 'lxljs/string';
import * as VocabUtil from 'lxljs/vocab';
import * as RecordUtil from '@/utils/record';
import { translatePhrase, labelByLang, convertResourceLink, capitalize } from '@/utils/filters';
import OverflowMixin from '@/components/mixins/overflow-mixin.vue';
import EncodingLevelIcon from '@/components/shared/encoding-level-icon.vue';
import TypeIcon from '@/components/shared/type-icon.vue';
import SummaryNode from '@/components/shared/summary-node.vue';
import IdPill from '@/components/shared/id-pill.vue';
import LensMixin from '../mixins/lens-mixin.vue';

export default {
  mixins: [LensMixin, OverflowMixin],
  name: 'entity-summary',
  components: {
    IdPill,
    EncodingLevelIcon,
    SummaryNode,
    TypeIcon,
  },
  props: {
    focusData: {
      type: Object,
      default: null,
    },
    recordData: {
      type: Object,
      default: null,
    },
    animate: {
      type: Boolean,
      default: false,
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
    labelStyle: {
      default: 'regular',
      validator(value) {
        return ['regular', 'top', 'hidden'].includes(value);
      },
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
    embeddedInField: {
      type: Boolean,
      default: false,
    },
    handleOverflow: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      defaultSettings: {
        show: false,
        styling: 'grey',
        text: '',
        payload: {},
        event: '',
      },
    };
  },
  emits: ['hiddenDetailsNumber', 'import-this'],
  computed: {
    ...mapGetters([
      'user',
      'enrichment',
      'resources',
    ]),
    encodingLevel() {
      /*
        TODO:
        Tidy this up... WAAAY to tied to specific data sources instead of just
        recieving all the data it needs through property.
      */
      if (this.inspector.data.hasOwnProperty('record') && this.focusData['@id'] === this.inspector.data.record.mainEntity['@id']) {
        return this.inspector.data.record.encodingLevel;
      }
      if (this.focusData.hasOwnProperty('meta')) {
        return this.focusData.meta.encodingLevel;
      }
      if (this.enrichment.data.source && this.enrichment.data.source.hasOwnProperty('record')) {
        return this.enrichment.data.source.record.encodingLevel;
      }
      return false;
    },
    hiddenDetailsNumber() {
      return this.getSummary.info.length - this.keyDisplayLimit;
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
      if (this.focusData.hasOwnProperty('@id') || this.focusData.hasOwnProperty('@graph')) {
        const uri = this.focusData.hasOwnProperty('@id') ? this.focusData['@id'] : this.focusData['@graph'][0].mainEntity['@id'];
        const convertedUri = convertResourceLink(uri);
        return convertedUri;
      }
      return null;
    },
    settings() {
      return this.$store.getters.settings;
    },
    recordId() {
      if (this.focusData.hasOwnProperty('@id')) {
        return RecordUtil.getRecordId(this.focusData, this.inspector.data.quoted);
      }
      return null;
    },
    isLibrisResource() {
      if (this.recordId) {
        return StringUtil.isLibrisResourceUri(this.recordId, this.settings);
      }
      return false;
    },
    routerPath() {
      const uriParts = this.recordId.split('/');
      const fnurgel = uriParts[uriParts.length - 1];
      return `/${fnurgel}`;
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
    limitedInfo() {
      const limited = cloneDeep(this.getSummary.info);
      if (!this.showAllKeys && limited.length > this.keyDisplayLimit) {
        limited.length = this.keyDisplayLimit;
      }
      return limited;
    },
    recordType() {
      return VocabUtil.getRecordType(this.focusData['@type'], this.resources.vocab, this.resources.context);
    },
    typeLabel() {
      const type = this.focusData['@type'];
      if (typeof type === 'undefined') {
        return '';
      }
      const translatedBaseType = StringUtil.getLabelByLang(
        this.recordType,
        this.user.settings.language,
        this.resources,
      );
      if (type === this.recordType && ['Instance', 'Work'].indexOf(type) !== -1) {
        return `${translatePhrase('Unspecified')}, ${translatedBaseType}`;
      }
      if (type === this.recordType) {
        return translatedBaseType;
      }
      let translatedType = '';
      if (isArray(type)) {
        translatedType = type.join(', ');
      } else {
        translatedType = StringUtil.getLabelByLang(
          type,
          this.user.settings.language,
          this.resources,
        );
      }
      return `${translatedType}, ${translatedBaseType}`;
    },
    topBarInformation() {
      return `${this.typeLabel}${this.categorization.length > 0 ? ' • ' : ''}${this.categorization.join(', ')}`;
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
      return [this.getLabel(this.focusData)];
    },
    isItem() {
      if (this.getCard['@type'] === 'Item') {
        return true;
      } return false;
    },
  },
  watch: {
    hiddenDetailsNumber(newValue) {
      this.$emit('hiddenDetailsNumber', newValue);
    },
  },
  mounted() {
    this.$nextTick(() => {
      this.$emit('hiddenDetailsNumber', this.hiddenDetailsNumber);
    });
  },
  methods: {
    translatePhrase,
    labelByLang,
    convertResourceLink,
    capitalize,
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
  <section
    class="EntitySummary"
    v-bind:class="{ 'is-embedded-in-field': embeddedInField }">
    <div class="EntitySummary-meta">
      <type-icon
        v-if="recordType === 'Work' || recordType === 'Place' || recordType === 'AdministrativeNotice'"
        :type="focusData['@type']"
      />
      <encoding-level-icon
        v-if="encodingLevel && recordType === 'Instance'"
        :encodingLevel="encodingLevel"
        :tooltipText="labelByLang(encodingLevel)" />
      <div :title="topBarInformation" v-if="excludeComponents.indexOf('categorization') < 0" class="EntitySummary-type uppercaseHeading--light">
        {{ topBarInformation }} {{ isLocal ? '{lokal entitet}' : '' }}
        <span class="EntitySummary-sourceLabel" v-if="database">{{ database }}</span>
      </div>
      <id-pill
        v-if="!excludeComponents.includes('id')"
        :uri="this.recordId"
        :isLibrisResource="this.isLibrisResource"
      />
    </div>

    <div class="EntitySummary-info">
      <h3
        class="EntitySummary-title"
        v-bind:class="{ 'EntitySummary-title--imported': isImport && shouldLink, showAll: showAllKeys }"
        v-if="excludeComponents.indexOf('header') < 0">
        <span
          v-if="highlightStr && !shouldLink"
          v-html="highlight(header.join(', '))"
          :title="header.join(', ')" />
        <span
          v-if="!highlightStr && !shouldLink"
          :title="header.join(', ')">{{ header.join(', ') }}</span>
        <span
          v-if="isImport && shouldLink"
          :title="header.join(', ')"
          v-on:click="importThis()">
          <i class="fa fa-external-link" aria-hidden="true" />
          {{ header.join(', ') }}
        </span>
        <router-link
          class="EntitySummary-titleLink"
          v-if="isLibrisResource && !isImport && shouldLink"
          :to="this.routerPath"
          :title="header.join(', ')"
          :target="shouldOpenTab ? '_blank' : '' ">
          <i v-if="shouldOpenTab" class="EntitySummary-icon fa fa-external-link" aria-hidden="true" />
          {{ header.join(', ') }}
        </router-link>
        <a
          class="EntitySummary-titleLink"
          v-if="!isLibrisResource && !isImport && shouldLink"
          :href="convertResourceLink(uri)"
          :title="header.join(', ')"
          :target="shouldOpenTab ? '_blank' : '' ">
          <i v-if="shouldOpenTab" class="EntitySummary-icon fa fa-external-link" aria-hidden="true" />
          {{ header.join(', ') }}
        </a>

      </h3>
      <ul class="EntitySummary-details" v-show="!isCompact" :style="{ 'min-height': animate ? `${ (limitedInfo.length * 1.8) + 0.2 }em` : 'auto' }" v-if="excludeComponents.indexOf('details') < 0">
        <li
          :class="`EntitySummary-detailsItem-${labelStyle}`"
          v-for="node in limitedInfo"
          :key="node.property">
          <template v-if="node.value !== null">
            <span v-if="labelStyle !== 'hidden'" :class="`EntitySummary-detailsKey-${labelStyle}`" :title="capitalize(labelByLang(node.property))">{{ capitalize(labelByLang(node.property)) }}</span>
            <span
              :class="`EntitySummary-detailsValue-${labelStyle} EntitySummary-twoLines`"
              :ref="`ovf-${node.property}`"
              @click.self.prevent="(e) => { if (handleOverflow) { e.target.classList.toggle('expanded'); } }">
              <SummaryNode
                v-for="(value, index) in node.value"
                :hover-links="hoverLinks"
                :handle-overflow="false"
                :is-last="index === node.value.length - 1"
                :key="index"
                :item="value"
                :parent-id="focusData['@id']"
                :field-key="node.property" />
            </span>
          </template>
          <template v-else-if="isReplacedBy !== ''">
            <span :class="`EntitySummary-detailsKey-${labelStyle}`">Ersatt av</span>
            <span :class="`EntitySummary-detailsValue-${labelStyle}`">{{ v }}</span>
          </template>
        </li>
      </ul>
    </div>
    <resize-observer @notify="calculateOverflow" />
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

  &.is-embedded-in-field {
    padding: 0.5em 0 0.5em 0;
  }

  .EntityHeader & {
    padding: 0;
  }

  &-meta {
    border-width: 0px;
    display: flex;
  }

  &-type {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    .database {
      border: 1px solid @grey;
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
      color: @brand-primary;
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
    // height is set in style-bindings,
    // see template in this file
    transition: min-height 0.2s ease-out;
  }

  &-detailsItem-regular {
    display: flex;
    flex-direction: column;
    min-width: 0;
    font-size: 1.4rem;
    @media (min-width: @screen-sm-min) {
      padding: 0.2rem 0;
      flex-direction: row;
    }
  }

  &-detailsKey-regular {
    @media (min-width: @screen-sm-min) {
      flex-basis: 6em;
    }
    flex-grow: 1;
    font-weight: 600;
    margin-right: 0.5em;
    color: @grey-darker;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
  }

  &-detailsValue-regular {
    @media (min-width: @screen-sm-min) {
      flex-basis: 75%;
      flex-grow: 2;
      align-self: flex-end;
    }
    color: #000;
    //white-space: nowrap;
    //overflow-x: hidden;
    //text-overflow: ellipsis

    &.overflown {
      &::before {
        font-family: FontAwesome;
        content: "\F054";
        font-weight: normal;
        color: @brand-primary;
        display: inline-block;
        margin-right: 5px;
        transition: transform 0.1s ease;
      }

      &.expanded {
        &::before {
          transform: rotate(90deg);
        }
      }
    }
  }

  &-twoLines {
    // max 2 lines before ellipsis
    // works in all major modern browsers
    // https://stackoverflow.com/a/13924997
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    &.expanded {
      -webkit-line-clamp: unset;
      line-clamp: unset;
    }
  }

  &-detailsItem-top {
    display: flex;
    flex-direction: column;
    min-width: 0;
    font-size: 1.4rem;
  }

  &-detailsKey-top {
    flex-grow: 1;
    margin-top: 0.5em;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
    text-transform: uppercase;
    color: @grey-darker;
    font-size: 1rem;
    font-weight: 600;
  }

  &-detailsValue-top {
    @media (min-width: @screen-sm-min) {
      flex-basis: 75%;
      flex-grow: 2;
    }
    color: #000;
  }

  &-detailsItem-hidden {
    display: flex;
    flex-direction: column;
    min-width: 0;
    font-size: 1.4rem;
    @media (min-width: @screen-sm-min) {
      padding: 0.2rem 0;
      flex-direction: row;
    }
  }

  &-detailsValue-hidden {
    @media (min-width: @screen-sm-min) {
      flex-basis: 75%;
      flex-grow: 2;
    }
    color: #000;
  }

  &-icon {
    vertical-align: middle;
  }
}
</style>
