<script>
import * as LayoutUtil from '../../utils/layout';
import * as _ from 'lodash';
import { mapGetters } from 'vuex';
import ModalComponent from '@/components/shared/modal-component.vue';

export default {
  name: 'marc-preview',
  data() {
    return {
    }
  },
  props: {
    marcObj: {
      type: Object,
      default: null,
    },
    error: {
      type: Error,
      default: null,
    }
  },
  watch: {
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
      this.$emit('hide');
      this.$store.dispatch('setStatusValue', { 
        property: 'keybindState', 
        value: 'overview' 
      });
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
  },
  computed: {
    ...mapGetters([
      'inspector',
      'resources',
      'user',
      'settings',
      'status',
    ]),
  },
  components: {
    'modal-component': ModalComponent,
  },
  mounted() { 
    this.$nextTick(() => {
      this.$store.dispatch('setStatusValue', { 
        property: 'keybindState', 
        value: 'marc-preview'
      });
    });
  },
};
</script>

<template>
  <modal-component class="" @close="hide">
    <template slot="modal-header">
      {{ "Preview MARC21" | translatePhrase }}
      <span class="ModalComponent-windowControl">
        <i @click="hide" class="fa fa-close"></i>
      </span>
    </template>
    
    <template slot="modal-body">
      <div class="MarcPreview">
        <div class="MarcPreview-body">
          <div class="MarcPreview-status" v-if="marcObj === null">
            <p v-show="error === null" >
              {{ "Loading marc" | translatePhrase }}...<br>
              <i class="fa fa-circle-o-notch fa-spin"></i>
            </p>
            <p v-show="error !== null" class="MarcPreview-error">
              {{ "Something went wrong" | translatePhrase }}...
            </p>
          </div>

          <table class="MarcPreview-table" v-if="marcObj !== null">
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
  </modal-component>
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
