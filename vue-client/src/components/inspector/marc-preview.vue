<script>
import { isObject } from 'lodash-es';
import { mapGetters } from 'vuex';
import PanelComponent from '@/components/shared/panel-component.vue';
import { translatePhrase } from '@/utils/filters';

export default {
  name: 'marc-preview',
  data() {
    return {
    };
  },
  props: {
    marcObj: {
      type: Object,
      default: null,
    },
    error: {
      type: Error,
      default: null,
    },
  },
  watch: {
    'inspector.event'(val) {
      if (val.name === 'form-control') {
        switch (val.value) {
          case 'close-modals':
            this.hide();
            break;
          default:
        }
      }
    },
  },
  emits: ['hide'],
  methods: {
    translatePhrase,
    hide() {
      this.$emit('hide');
      // this.$store.dispatch('setStatusValue', {
      //   property: 'keybindState',
      //   value: 'overview'
      // });
    },
    isObject(o) {
      return isObject(o);
    },
    getKeys(obj) {
      return Object.keys(obj);
    },
    getValue(obj) {
      const val = obj[this.getKeys(obj)[0]];
      if (!isObject(val)) {
        return { value: val };
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
    'panel-component': PanelComponent,
  },
  mounted() {
    this.$nextTick(() => {
      // this.$store.dispatch('setStatusValue', {
      //   property: 'keybindState',
      //   value: 'marc-preview'
      // });
    });
  },
};
</script>

<template>
  <panel-component
    class="MarcPreview"
    @close="hide"
    title="Preview MARC21">
    <template #panel-body>
      <div class="">
        <div class="MarcPreview-body">
          <div class="MarcPreview-status" v-if="marcObj === null">
            <p v-show="error === null">
              {{ translatePhrase("Loading marc") }}...<br>
              <i class="fa fa-circle-o-notch fa-spin" />
            </p>
            <p v-show="error !== null" class="MarcPreview-error">
              {{ translatePhrase("Something went wrong") }}...
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
                <td />
                <td />
                <td>{{ marcObj.leader }}</td>
              </tr>
              <tr v-for="(field, index) in marcObj.fields" :key="index">
                <td>{{ getKeys(field)[0] }}</td>
                <td>{{ getValue(field)['ind1'] }}</td>
                <td>{{ getValue(field)['ind2'] }}</td>
                <td class="MarcPreview-value" v-if="getValue(field)['value']">
                  <span>{{getValue(field)['value']}}</span>
                </td>
                <td class="MarcPreview-value" v-if="!getValue(field)['value']">
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
    padding-bottom: 30px;
  }

  &-value {
    word-break: break-word;
  }

  &-status {
    padding: 10px;
    padding-top: 50px;
    text-align: center;
  }

  &-table {
    width: 100%;
    height: 100%;
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
      padding: 10px;
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

  & .PanelComponent-container {
    @media print {
      display: block;
      position: static;
      width: 100%;
      height: auto;
    }
  }
}
</style>
