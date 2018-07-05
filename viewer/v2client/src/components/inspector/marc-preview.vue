<script>
import * as DataUtil from '@/utils/data';
import * as httpUtil from '@/utils/http';
import * as LayoutUtil from '@/utils/layout';
import * as _ from 'lodash';
import { mapGetters } from 'vuex';
import PanelComponent from '@/components/shared/panel-component.vue';

//import { changeStatus, changeNotification } from '../../vuex/actions';
//import { getVocabulary, getSettings, getDisplayDefinitions, getEditorData } from '../../vuex/getters';

export default {
  name: 'marc-preview',
  data() {
    return {
      marcObj: {},
      dataLoaded: false,
      error: false,
      active : false,
    }
  },
  props: {
    openPreview: false
  },
  watch: {
    openPreview: function () {
      if (this.openPreview) {
        this.active = true;
        this.$emit('open-marc');
        this.convertItemToMarc();
        this.showMarc();
      }
    },
    'inspector.event'(val, oldVal) {
      if (val.name === 'form-control') {
        switch(val.value) {
          case 'close-modals':
            this.hide();
            return true;
            break;
          default:
            return;
        }
      }
    },
  },
  methods: {
    hide() {
      if (!this.active) return;
      this.active = false;
      this.$emit('close-marc');
      this.$store.dispatch('setStatusValue', { 
        property: 'keybindState', 
        value: 'overview' 
      });
    },
    showMarc() {
      this.$store.dispatch('setStatusValue', { 
        property: 'keybindState', 
        value: 'marc-preview'
      });
      this.active = true;
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
        DataUtil.removeNullValues(this.inspector.data.record),
        DataUtil.removeNullValues(this.inspector.data.mainEntity),
        DataUtil.removeNullValues(this.inspector.data.work),
        this.inspector.data.quoted
      );
      const apiPath = this.settings.apiPath;
      httpUtil.post({ 
        url: `${apiPath}/_convert`,
        accept: 'application/x-marc-json',
        token: this.user.token,
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
    ...mapGetters([
      'inspector',
      'resources',
      'user',
      'settings',
      'status',
    ]),
    isActive() {
      return this.status.showMarc;
    },
  },
  components: {
    'panel-component': PanelComponent,
  },
  mounted() { 
    this.$nextTick(() => {
    });
  },
};
</script>

<template>
  <panel-component v-if="active" class="" @close="hide" title="Preview MARC21">
    
    <template slot="panel-body">
      <div class="MarcPreview">
        <div class="MarcPreview-body">
          <div class="MarcPreview-status" v-show="!dataLoaded">
            <p v-show="!error" >
              {{ "Loading marc" | translatePhrase }}...<br>
              <i class="fa fa-circle-o-notch fa-spin"></i>
            </p>
            <p v-show="error" class="MarcPreview-error">
              {{ "Something went wrong" | translatePhrase }}...
            </p>
          </div>

          <table class="MarcPreview-table" v-show="dataLoaded">
            <thead>
              <th>Tag</th>
              <th>I1</th>
              <th>I2</th>
              <th>Subfield data</th>
            </thead>
            <tbody>
              <tr>
                <td>000</td>
                <td></td>
                <td></td>
                <td>{{ marcObj.leader }}</td>
              </tr>
              <tr v-for="(field, index) in marcObj.fields" :key="index">
                <td>{{ getKeys(field)[0] }}</td>
                <td>{{ getValue(field)['ind1'] }}</td>
                <td>{{ getValue(field)['ind2'] }}</td>
                <td v-if="getValue(field)['value']">
                  <span>{{getValue(field)['value']}}</span>
                </td>
                <td v-if="!getValue(field)['value']">
                  <span v-for="(sub, index) in getValue(field)['subfields']" :key="index">
                    <span class="sub-key">#{{ getKeys(sub)[0] }}</span> {{ sub[getKeys(sub)[0]] }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
       
      </div>
    </template>
  </panel-component>
</template>

<style lang="less">

.MarcPreview {

  &-body {
    width: 100%;
    overflow-y: scroll;
    padding-bottom: 30px;
  }

  &-status {
    padding: 10px;
    padding-top: 50px;
    text-align: center;
  }

  &-table {
    width: 100%;
    height: 100%;
    overflow: scroll;
    margin: 0 0 20px 0; // Make sure last field is fully visible
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

    tbody td, tbody th {
      vertical-align: top;
    }
  }
}
</style>
