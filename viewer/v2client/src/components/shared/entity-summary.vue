<script>
import * as _ from 'lodash';
import LensMixin from '../mixins/lens-mixin';
import * as StringUtil from '@/utils/string';

export default {
  mixins: [LensMixin],
  name: 'entity-summary',
  props: {
    focusData: {},
    addLink: false,
    lines: Number,
    actions: false,
    isLocal: false,
    isExtractable: false,
    importItem: '',
    isImport: false,
    actionSettings: {},
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
    infoWithKeys() {
      const info = this.getSummary.info.concat(this.getSummary.sub);
      const infoObj = {};
      _.each(info, (node) => {
        infoObj[node.property] = node.value.join(', ');
      });
      return infoObj;
    },
    isKbSe() {
      return this.focusData['@id'].indexOf('id.kb.se') > -1;
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
      this.$dispatch('import-this');
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
      {{categorization.join(', ')}} {{ isLocal ? '{lokal entitet}' : '' }}
    </div>
  </div>
  <div class="main-info">
    <h3 class="header">
      <span class="import-header" :title="header.join(', ')" v-on:click="importThis()" v-if="isImport">{{ header.join(', ') }}</span>
      <a v-if="!isImport && renderLink" :class="{'blue-link': isKbSe}" :title="header.join(', ')" :href="focusData['@id']">{{ header.join(', ') }}</a>
      <span v-if="!isImport && !renderLink" :title="header.join(', ')">{{ header.join(', ') }}</span>
    </h3>
    <div class="id" v-if="identifiers.length > 0">{{ identifiers[0] }} <span class="id-info" v-if="identifiers.length > 1">(+{{ identifiers.length-1 }})</span></div>
    <div class="info">
      <span class="key-value-pair" v-show="v.length !== 0" v-for="(k,v) in infoWithKeys" :key="k">
        <span class="key">{{ k | labelByLang }}:</span>&nbsp;<span class="value">{{ v }}</span>
      </span>
    </div>
  </div>
</div>
</template>

<style lang="less">
@import '../shared/_variables.less';
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
      color: #333;
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
      color: #8a8a8a;
      flex-basis: 85%;
      flex-grow: 2;
      display: block;
      font-weight: bold;
      margin-bottom: -0.4em;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
}

</style>
