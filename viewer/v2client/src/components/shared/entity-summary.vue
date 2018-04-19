<script>
import * as _ from 'lodash';
import LensMixin from '../mixins/lens-mixin';
import * as StringUtil from '@/utils/string';

export default {
  mixins: [LensMixin],
  name: 'entity-summary',
  props: {
    focusData: {},
    lines: Number,
    actions: false,
    isLocal: false,
    isExtractable: false,
    isImport: false,
    importItem: '',
    routerPath: String,
    database: '',
    shouldLink: {
      default: true,
      type: Boolean,
    }
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
    }
  },
  computed: {
    settings() {
      return this.$store.getters.settings;
    },
    isLibrisResource() {
      if (!this.focusData.hasOwnProperty('@id')) {
        return true;
      }
      return this.focusData['@id'].startsWith(this.settings.apiPath);
    },
    infoWithKeys() {
      const info = this.getSummary.info.concat(this.getSummary.sub);
      const infoObj = {};
      _.each(info, (node) => {
        infoObj[node.property] = node.value.join(', ');
      });
      return infoObj;
    },
    renderLink() {
      if (this.addLink === true && !this.isLocal) {
        return true;
      }

      console.log('IS NOT LOCAL');
      return false;
    },
    categorization() {
      return StringUtil.getFormattedEntries(
        this.getSummary.categorization, 
        this.resources.vocab, 
        this.settings, 
        this.resources.context
      );
    },
    header() {
      return StringUtil.getFormattedEntries(
        this.getSummary.header, 
        this.resources.vocab, 
        this.settings, 
        this.resources.context
      );
    },
    identifiers() {
      let identifiersList = StringUtil.getFormattedEntries(
        this.getSummary.identifiers, 
        this.resources.vocab, 
        this.settings, 
        this.resources.context
      );
      if (identifiersList.length > this.lines) {
        const diff = identifiersList.length - this.lines;
        identifiersList.splice((this.lines - 1), diff+1);
        identifiersList.push(`+ ${diff+1} identifierare`);
      }
      return identifiersList;
    },
    info() {
      return StringUtil.getFormattedEntries(
        this.getSummary.info, 
        this.resources.vocab, 
        this.settings, 
        this.resources.context
      );
    },
    sub() {
      let allThings = StringUtil.getFormattedEntries(
        this.getSummary.info, 
        this.resources.vocab, 
        this.settings, 
        this.resources.context
      );
      allThings = allThings.concat(StringUtil.getFormattedEntries(
        this.getSummary.sub, 
        this.resources.vocab, 
        this.settings, 
        this.resources.context
      ));
      return allThings;
    },
  },
  methods: {
    importThis() {
      this.$store.dispatch('pushNotification', { 
        color: 'grey', 
        message: StringUtil.getUiPhraseByLang(
          'This action is not yet functional. We\'re working on it!', 
          this.settings.language
        ) 
      });
    },
    removeEntity() {
      this.$dispatch('remove-entity');
    },
    extractEntity() {
      this.$dispatch('extract-item');
    },
  },
  components: {
  },
  watch: {
  },
  ready() { // Ready method is deprecated in 2.0, switch to "mounted"
  },
};
</script>

<template>
<section class="EntitySummary">
  <div class="EntitySummary-meta">
    <div class="EntitySummary-type">
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
        :title="header.join(', ')">
        {{ header.join(', ') }}
      </router-link>
      <a class="EntitySummary-titleLink"
        v-if="!isLibrisResource && !isImport && shouldLink" 
        :href="focusData['@id']" 
        :title="header.join(', ')">
        {{ header.join(', ') }}
      </a>
    </h3>
    <span class="EntitySummary-id" 
      v-if="identifiers.length > 0">
      {{ identifiers[0] }} 
      <span class="EntitySummary-idInfo" v-if="identifiers.length > 1">(+{{ identifiers.length-1 }})</span>
    </span>
    <ul class="EntitySummary-details">
      <li class="EntitySummary-detailsItem" 
        v-show="v.length !== 0" 
        v-for="(v, k) in infoWithKeys" 
        :key="k">
        <span class="EntitySummary-detailsKey">{{ k | labelByLang }}:</span>
        &nbsp;
        <span class="EntitySummary-detailsValue">{{ v }}</span>
      </li>
    </ul>
  </div>
</section>
</template>

<style lang="less">

.EntitySummary {
  display: flex;
  flex-direction: column;
  font-size: 12px;
  font-size: 1.2rem;
  justify-content: space-between;
  padding: 10px;
  width: 100%;

  .HeaderComponent & {
    color: #fff;
  }

  &-meta {
    border-width: 0px;

    .ResultList & {
      color: #8a8a8a;
    }
  }

  &-type {
    display: block;
    flex-basis: 85%;
    flex-grow: 2;
    font-weight: bold;
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

  &-info {
    height: 7.5em;
    overflow: hidden;
  }

  &-title {
    font-size: 20px;
    font-size: 2.0rem;
    margin: 5px 0;
    overflow: hidden;
    text-overflow: ellipsis;
    width: 100%;
    white-space: nowrap;

    &--imported {
      cursor: pointer;
    }
  }

  &-titleLink {
    color: @brand-primary;
    
    &.blue-link {
      color: @brand-id;
    }
  }

  &-details {
    line-height: 1.4;
    list-style-type: none;
    margin: 0;
    padding: 0px;
  }

  &-detailsItem {
    display: inline-block;
  }

  &-detailsKey {
    font-size: 12px;
    font-size: 1.2rem;
    text-transform: uppercase;
    font-weight: 700;
  }

  &-detailsValue {
    margin-right: 10px;
  }

  &-id {
    display: block;
    font-weight: 700;
    margin-top: -0.3em;
    margin-bottom: 5px;
  }

  &-idInfo {
    font-weight: normal;
  }
}
</style>
