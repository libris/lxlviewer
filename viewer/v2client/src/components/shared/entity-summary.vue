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
      return false;
    },
    categorization() {
      return StringUtil.getFormattedEntries(this.getSummary.categorization, this.resources.vocab, this.settings, this.resources.context);
    },
    header() {
      return StringUtil.getFormattedEntries(this.getSummary.header, this.resources.vocab, this.settings, this.resources.context);
    },
    identifiers() {
      let identifiersList = StringUtil.getFormattedEntries(this.getSummary.identifiers, this.resources.vocab, this.settings, this.resources.context);
      if (identifiersList.length > this.lines) {
        const diff = identifiersList.length - this.lines;
        identifiersList.splice((this.lines - 1), diff+1);
        identifiersList.push(`+ ${diff+1} identifierare`);
      }
      return identifiersList;
    },
    info() {
      return StringUtil.getFormattedEntries(this.getSummary.info, this.resources.vocab, this.settings, this.resources.context);
    },
    sub() {
      let allThings = StringUtil.getFormattedEntries(this.getSummary.info, this.resources.vocab, this.settings, this.resources.context);
      allThings = allThings.concat(StringUtil.getFormattedEntries(this.getSummary.sub, this.resources.vocab, this.settings, this.resources.context));
      return allThings;
    },
  },
  methods: {
    importThis() {
      this.$store.dispatch('pushNotification', { color: 'grey', message: StringUtil.getUiPhraseByLang('This action is not yet functional. We\'re working on it!', this.settings.language) });
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
<div class="entity-summary">
  <div class="sub">
    <div class="categorization">
      {{categorization.join(', ')}} {{ isLocal ? '{lokal entitet}' : '' }} <span class="database" v-if="database">{{ database }}</span>
    </div>
  </div>
  <div class="main-info">
    <h3 class="header">
      <span v-if="!shouldLink" :title="header.join(', ')">{{ header.join(', ') }}</span>
      <span v-if="isImport && shouldLink" class="import-header" :title="header.join(', ')" v-on:click="importThis()"><i class="fa fa-download" aria-hidden="true"></i> {{ header.join(', ') }}</span>
      <router-link v-if="isLibrisResource && !isImport && shouldLink" :to="routerPath" :title="header.join(', ')">{{ header.join(', ') }}</router-link>
      <a v-if="!isLibrisResource && !isImport && shouldLink" :href="focusData['@id']" :title="header.join(', ')">{{ header.join(', ') }}</a>
    </h3>
    <div class="id" v-if="identifiers.length > 0">{{ identifiers[0] }} <span class="id-info" v-if="identifiers.length > 1">(+{{ identifiers.length-1 }})</span></div>
    <div class="info">
      <span class="key-value-pair" v-show="v.length !== 0" v-for="(v, k) in infoWithKeys" :key="k">
        <span class="key">{{ k | labelByLang }}:</span>&nbsp;<span class="value">{{ v }}</span>
      </span>
    </div>
  </div>
</div>
</template>

<style lang="less">

.entity-summary {
  width: 100%;
  font-size: 13px;
  padding: 0.5em 1em;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  .actions {
    flex-basis: 3em;
    text-align: center;
  }
  .main-info {
    height: 7.5em;
    overflow: hidden;
    a {
      color: @brand-primary;
      &.blue-link {
        color: @brand-id;
      }
    }
    .header {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      width: 100%;
      font-size: 1.6em;
      line-height: 1.6em;
      min-height: 1.2em;
      margin: 0px;
      &.import-header {
        cursor: pointer;
      }
    }
    .info {
      .key-value-pair {
        .key {
          text-transform: uppercase;
          font-weight: bold;
          font-size: 85%;
        }
        .value {
          margin-right: 0.5em;
        }
      }
    }
    .id {
      font-weight: bold;
      margin-top: -0.3em;
      margin-bottom: 0.5em;
      .id-info {
        font-weight: normal;
      }
    }
    ul.info {
      list-style-type: none;
      padding: 0px;
    }
  }
  .sub {
    border-width: 0px;
    .categorization {
      flex-basis: 85%;
      flex-grow: 2;
      display: block;
      font-weight: bold;
      margin-bottom: -0.4em;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      .database {
        float: right;
        border: 1px solid @gray;
        border-radius: 0.3em;
        padding: 3px;
        line-height: 1;
      }
    }
  }
}

</style>
