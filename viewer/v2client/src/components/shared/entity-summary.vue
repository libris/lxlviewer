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
    database: '',
    shouldLink: {
      default: true,
      type: Boolean,
    },
    shouldOpenTab: false,
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
    routerPath() {
      if (this.focusData.hasOwnProperty('@id')) {
        const uriParts = this.focusData['@id'].split('/');
        const fnurgel = uriParts[uriParts.length-1];
        return `/${fnurgel}`;
      }

      return '';
    },
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
      this.$emit('import-this');
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
  mounted() { 
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
        :title="header.join(', ')"
        :target="shouldOpenTab ? '_blank' : '' ">
        {{ header.join(', ') }}
      </router-link>
      <a class="EntitySummary-titleLink"
        v-if="!isLibrisResource && !isImport && shouldLink" 
        :href="focusData['@id']" 
        :title="header.join(', ')"
        :target="shouldOpenTab ? '_blank' : '' ">
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

  &-sourceLabel {
    border: 1px solid;
    border-radius: 0.5em;
    padding: 0px 0.5em;
    float: right;
    margin-right: 0.5em;
  }

  &-info {
    min-height: 7.5em;
    overflow: hidden;
  }

  &-title {
    font-size: 20px;
    font-size: 2.0rem;
    line-height: 1.2;
    margin: 5px 0;
    overflow: hidden;
    width: 100%; 
    position: relative;

    &--imported {
      cursor: pointer;
    }

    @media (min-width: 768px) {
      text-overflow: ellipsis;
      white-space: nowrap;
      height: auto;
    }
  }

  &-titleLink {
    color: @brand-primary;
    display: inline;
    
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
