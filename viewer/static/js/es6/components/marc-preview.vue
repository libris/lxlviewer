<script>
import * as DataUtil from '../utils/data';
import * as httpUtil from '../utils/http';
import * as LayoutUtil from '../utils/layout';
import * as _ from 'lodash';
import { changeStatus, changeNotification } from '../vuex/actions';
import { getVocabulary, getSettings, getDisplayDefinitions, getEditorData } from '../vuex/getters';

export default {
  name: 'marc-preview',
  data() {
    return {
      marcObj: {},
      dataLoaded: false,
      error: false,
    }
  },
  props: {
    active: false,
  },
  vuex: {
    getters: {
      vocab: getVocabulary,
      display: getDisplayDefinitions,
      settings: getSettings,
      editorData: getEditorData,
    },
    actions: {
      changeStatus,
      changeNotification,
    },
  },
  events: {
    'close-modals'() {
      this.hideMarc();
      return true;
    },
    'open-marc'() {
      this.convertItemToMarc();
      this.showMarc();
    },
  },
  methods: {
    showMarc() {
      LayoutUtil.scrollLock(true);
      this.changeStatus('keybindState', 'marc-preview');
      this.changeStatus('showMarc', true);
      this.active = true;
    },
    hideMarc() {
      this.changeStatus('showMarc', false);
      LayoutUtil.scrollLock(false);
      this.changeStatus('keybindState', 'overview');
      this.marcObj = {};
      this.dataLoaded = false;
      this.active = false;
    },
    isObject(o) {
      return _.isObject(o);
    },
    getKeys(obj) {
      return Object.keys(obj);
    },
    getValue(obj) {
      let val = obj[this.getKeys(obj)[0]];
      if (!_.isObject(val)) {
        return { 'value': val };
      }
      return val;
    },
    convertItemToMarc() {
      this.dataLoaded = false;
      this.error = false;
      const editorObj = DataUtil.getMergedItems(
        DataUtil.removeNullValues(this.editorData.record),
        DataUtil.removeNullValues(this.editorData.mainEntity),
        DataUtil.removeNullValues(this.editorData.work),
        this.editorData.quoted
      );
      httpUtil.post({
        url: '/_convert',
        token: self.access_token,
        accept: 'application/x-marc-json',
      }, editorObj).then((result) => {
        this.marcObj = result;
        this.dataLoaded = true;
      }, (error) => {
        this.marcObj = {};
        this.error = true;
        console.warn('Couldn\'t convert to marc.', error);
      });
    },
  },
  computed: {
    isActive() {
      return this.status.showMarc;
    },
  },
  components: {
  },
  ready() { // Ready method is deprecated in 2.0, switch to "mounted"
    this.$nextTick(() => {
    });
  },
};
</script>

<template>
  <div class="marc-preview">
    <div class="window" v-if="active">
      <div class="header">
        <span class="title">{{ "Preview MARC21" | translatePhrase }}</span>
        <span class="windowControl">
          <i v-on:click="hideMarc()" class="fa fa-close"></i>
        </span>
      </div>
      <div class="body">
        <div v-show="!dataLoaded && !error" class="status">{{ "Loading marc" | translatePhrase }}...<br><i class="fa fa-circle-o-notch fa-spin"></i></div>
        <div v-show="error" class="status">{{ "Something went wrong" | translatePhrase }}...</div>
        <table class="marc-preview-table" v-show="dataLoaded">
          <thead>
            <th>Tag</th>
            <th>I1</th>
            <th>I2</th>
            <th>Subfield data</th>
          </thead>
          <tbody>
            <tr v-for="field in marcObj.fields">
              <td>{{ getKeys(field)[0] }}</td>
              <td>{{ getValue(field)['ind1'] }}</td>
              <td>{{ getValue(field)['ind2'] }}</td>
              <td v-if="getValue(field)['value']">
                <span>{{getValue(field)['value']}}</span>
              </td>
              <td v-if="!getValue(field)['value']">
                <span v-for="sub in getValue(field)['subfields']">
                  <span class="sub-key">#{{ getKeys(sub)[0] }}</span> {{ sub[getKeys(sub)[0]] }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style lang="less">
@import './_variables.less';

.marc-preview {
  .window {
    color: #000;
    .window-mixin();
    .body {
      .status {
        padding: 10px;
        padding-top: 50px;
        text-align: center;
        > i {
          font-size: 2rem;
        }
      }
      width: 100%;
      overflow-y: scroll;
      padding-bottom: 3em;
      .marc-preview-table {
        width: 100%;
        font-family: monospace;
        border: 1px solid #a1a1a1;
        th {
          background-color: #efefef;
        }
        td {
          background-color: #ffffff;
        }
        td, th {
          border: 1px solid #ccc;
          padding: 5px;
          .sub-key {
            font-weight: bold;
            &::before {
              content: " ";
            }
          }
        }
      }
    }
  }
}

</style>
