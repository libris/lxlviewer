<script>
/*
  This component is responsible for the actual changes to the formdata.
  It recieves modification events from other components through $dispatch calls
  and makes changes to the bound 'focus' object accordingly.
*/

import * as _ from 'lodash';
import LinkAdder from './linkadder';
import EntityAdder from './entityadder';
import FieldAdder from './fieldadder';
import DataNode from './datanode';
import LinkedItem from './linkeditem';
import * as ModalUtil from '../utils/modals';
import * as VocabUtil from '../utils/vocab';
import { updateForm } from '../vuex/actions';
import { getVocabulary, getSettings, getEditorData } from '../vuex/getters';

export default {
  vuex: {
    actions: {
      updateForm,
    },
    getters: {
      vocab: getVocabulary,
      settings: getSettings,
      editorData: getEditorData,
    }
  },
  props: {
    focus: '',
    linked: {},
    isLocked: false,
    showDev: 'show-dev',
  },
  data() {
    return {
      showJson: false,
    }
  },
  computed: {
    allowedProperties() {
      const settings = this.settings;
      const formObj = this.formData;
      let allowed = VocabUtil.getPropertiesFromArray(formObj['@type'], this.vocab, this.settings.vocabPfx);

      // Add the "added" property
      allowed = _.forEach(allowed, function(o) {
        const oId = o.item['@id'].replace(settings.vocabPfx, '');
        o.added = (formObj.hasOwnProperty(oId) && formObj[oId] !== null);
      });

      return allowed;
    },
    formData() {
      return this.editorData[this.focus];
    },
  },
  events: {
    'add-field': function (prop) {
      const newItem = {};
      const key = prop['@id'].replace(this.settings.vocabPfx, '');
      if (prop['@type'] && prop['@type'].indexOf('ObjectProperty') !== -1) {
        newItem[key] = [];
      } else {
        newItem[key] = '';
      }
      const merged = Object.assign({}, this.formData, newItem);
      this.updateForm(this.focus, merged);
    },
    'add-item': function (key, item) {
      this.linked.push(item);
      const modified = this.formData;
      const newItem = { '@id': item['@id'] };
      modified[key].push(newItem);
      const merged = Object.assign({}, this.formData, modified);
      this.updateForm(this.focus, merged);
    },
    'remove-item': function (key, item) {
      const keyWithout = _.reject(this.formData[key], (o) => o === item);
      const modified = this.formData;
      modified[key] = keyWithout;
      const merged = Object.assign({}, this.formData, modified);
      this.updateForm(this.focus, merged);
    },
    'update-value': function (key, value) {
      const modified = this.formData;
      modified[key] = value;
      const merged = Object.assign({}, this.formData, modified);
      this.updateForm(this.focus, merged);
    },
    'add-anonymous': function (key, item) {
      const modified = this.formData;
      if (_.isArray(modified[key])) {
        modified[key].push(item);
      } else if (!this.isEmptyObject(modified[key])) {
        modified[key] = [modified[key], item];
      } else {
        modified[key] = item;
      }
      const merged = Object.assign({}, this.formData, modified);
      this.updateForm(this.focus, merged);
    },
  },
  methods: {
    isArray(o) {
      return _.isArray(o);
    },
    isPlainObject(o) {
      return _.isPlainObject(o);
    },
    isEmptyObject(value) {
      return (Object.keys(value).length === 0 && value !== '');
    },
    removeField(prop) {
      const pLabel = VocabUtil.getLabelByLang(prop, this.settings.lang, this.vocab, this.settings.vocabPfx);
      ModalUtil.confirmDialog(
        {
          sTitle: `Ta bort fältet "${pLabel}"?`,
          sContent: `Detta tar bort fältet "${pLabel}" och allt dess innehåll.`,
          sAccept: 'Ta bort',
          sReject: 'Avbryt',
          sType: 'danger'
        }
      ).then(() => {
          // accepted by user
          this.$dispatch('update-value', prop, null);
        }, () => {
          // declined
        });
    },
    isRepeatable(property) {
      const types = VocabUtil.getPropertyTypes(property, this.vocab, this.settings.vocabPfx);
      return types.indexOf('FunctionalProperty') < 0;
    },
    updateFromTextarea(e) {
      this.updateForm(this.focus, JSON.parse(e.target.value));
    },
  },
  components: {
    'link-adder': LinkAdder,
    'data-node': DataNode,
    'linked-item': LinkedItem,
    'entity-adder': EntityAdder,
    'field-adder': FieldAdder,
  },
};
</script>

<template>
  <div class="form-component" v-bind:class="{ 'locked': isLocked }">
    <div class="form-header">- {{ focus }} -</div>
    <ul>
      <li v-for="(k, v) in formData" v-if="v !== null" v-bind:class="{ 'locked': isLocked }">
        <span class="label">
          <a href="/vocab/#{{k}}">{{ k | labelByLang | capitalize }}</a>
        </span>
        <span class="value">
          <data-node v-if="!isEmptyObject(v)" :is-locked="isLocked" :key="k" :value="v" :linked="linked"></data-node>
        </span>
        <span class="actions">
          <entity-adder class="action" v-if="!isLocked && (isRepeatable(k) || isEmptyObject(v))" :key="k"></entity-adder>
          <span class="action" v-if="!isLocked" class="delete" v-on:click="removeField(k)"><i class="fa fa-trash"></i> Ta bort fält</span>
        </span>
      </li>
    </ul>
    <field-adder v-if="!isLocked" :allowed="allowedProperties" :item="focus"></field-adder>
    <div id="result" v-if="showDev">
      <textarea :value="formData | json" @input="updateFromTextarea">
      </textarea>
    </div>
  </div>
</template>

<style lang="less">
@gray-lighter: #e0e6e9;
@gray-darker: #595d61;
@neutral-color: #ffffff;
@node-bg: #fafafa;
@libris-green: #009788;

// Column widths
@col-label: 200px;
@col-value: 620px;
@col-action: 250px;

.form-component {
  border: 1px solid @libris-green;
  padding-bottom: 10px;
  .form-header {
    background-color: @libris-green;
    font-weight: bold;
    color: @neutral-color;
    text-align: center;
  }
  margin: 20px;
  &.locked {
    background-color: darken(@neutral-color, 10%);
    > ul > li {
      margin: 0px;
    }
  }
  >ul {
    padding-left: 0px;
    >li {
      display: flex;
      padding: 5px 0px;
      list-style: none;
      width: 100%;
      background-color: @node-bg;
      &:nth-child(odd) {
        background-color: darken(@node-bg, 2%);
      }
      &:hover {
        >.actions {
          opacity: 1;
        }
      }
      >.actions {
        text-align: right;
        display: inline-block;
        float: left;
        width: @col-action;
        transition: opacity ease 0.2s;
        opacity: 0;
        padding-left: 10px;
        margin-right: 25px;
        .action {
          display: inline-block;
          cursor: pointer;
          margin-left: 1em;
        }
      }
      >.label {
        float: left;
        display: inline-block;
        width: @col-label;
        text-align: right;
        vertical-align: top;
        line-height: 2.5;
        color: @gray-darker;
        a {
          cursor: help;
          text-decoration: none;
          color: #949a9e;
          line-height: 12px;
          font-weight: normal;
          border-bottom: dashed transparent 1px;
          display: inline-block;
          &:hover {
            text-decoration: none;
            border-bottom: 1px dashed;
          }
        }
      }
      >.value {
        float: left;
        width: @col-value;
        display: inline-block;
        padding: 5px 15px 0px 0px;
        > div {
          > ul > li {
            display: inline-block;
          }
        }
        input {
          padding: 0px;
          width: 100%;
        }
      }
    }
  }
  .node-input {
    width: 420px;
  }
  .node-linked {
    margin: 0px 15px 0px 0px;
    > div.expanded {
      width: @col-value;
    }
  }
  .node-anonymous {
    width: 420px;
    clear: left;
  }
}

</style>
