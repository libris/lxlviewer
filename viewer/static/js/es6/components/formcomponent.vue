<script>
/*
  This component is responsible for the actual changes to the formdata.
  It recieves modification events from other components through $dispatch calls
  and makes changes to the bound 'focus' object accordingly.
*/

import * as _ from 'lodash';
import FieldAdder from './fieldadder';
import DataNode from './datanode';
import * as ModalUtil from '../utils/modals';
import * as VocabUtil from '../utils/vocab';
import * as DisplayUtil from '../utils/display';
import { updateForm, changeStatus } from '../vuex/actions';
import { getSettings, getVocabulary, getDisplayDefinitions, getEditorData, getStatus } from '../vuex/getters';

export default {
  vuex: {
    actions: {
      updateForm,
      changeStatus,
    },
    getters: {
      vocab: getVocabulary,
      settings: getSettings,
      editorData: getEditorData,
      display: getDisplayDefinitions,
      status: getStatus,
    },
  },
  props: {
    focus: '',
    locked: false,
  },
  data() {
    return {
      showJson: false,
    };
  },
  computed: {
    isWork() {
      return this.focus === 'work';
    },
    isInstance() {
      return this.focus === 'mainEntity';
    },
    isLocked() {
      if (this.locked || this.status.level !== this.focus) {
        return true;
      }
      return false;
    },
    allowedProperties() {
      const settings = this.settings;
      const formObj = this.formData;
      const allowed = VocabUtil.getPropertiesFromArray(
        formObj['@type'],
        this.vocab,
        this.settings.vocabPfx
      );

      // Add the "added" property
      for (const element of allowed) {
        const oId = element.item['@id'].replace(settings.vocabPfx, '');
        element.added = (formObj.hasOwnProperty(oId) && formObj[oId] !== null);
      }

      return allowed;
    },
    formData() {
      return this.editorData[this.focus];
    },
    sortedFormData() {
      const sortedForm = {};
      for (const property of this.sortedProperties) {
        const k = property;
        if (this.formData[k] || this.formData[k] === '') {
          sortedForm[k] = this.formData[k];
        }
      }
      return sortedForm;
    },
    sortedProperties() {
      const formObj = this.formData;

      // Try to get properties from type of object
      // If none found, try baseClasses
      let propertyList = DisplayUtil.getProperties(
        formObj['@type'],
        'cards',
        this.display,
        this.settings
      );
      if (propertyList.length === 0) { // If none were found, traverse up inheritance tree
        const baseClasses = VocabUtil.getBaseClassesFromArray(
          formObj['@type'],
          this.vocab,
          this.settings.vocabPfx
        );
        for (const baseClass of baseClasses) {
          propertyList = DisplayUtil.getProperties(
            baseClass.replace(this.settings.vocabPfx, ''),
            'cards',
            this.display,
            this.settings
          );
          if (propertyList.length > 0) {
            break;
          }
        }
        if (propertyList.length === 0) {
          propertyList = DisplayUtil.getProperties(
            'Resource',
            'chips',
            this.display,
            this.settings
          );
        }
      }
      _.each(formObj, (v, k) => {
        if (!propertyList.includes(k)) {
          propertyList.push(k);
        }
      });
      return propertyList;
    },
    dummyInstance() {
      return DisplayUtil.getItemLabel(
        this.editorData.mainEntity,
        this.display,
        this.editorData.linked,
        this.vocab,
        this.settings
      );
    },
  },
  events: {
    'add-field'(prop) {
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
    'remove-field'(prop) {
      const modifiedData = Object.assign({}, this.formData);
      delete modifiedData[prop];
      this.updateForm(this.focus, modifiedData);
    },
    'update-value'(path, value) {
      console.log("FormComp:"+this.focus+" - Updating " + path, 'to', JSON.stringify(value));
      const modified = _.cloneDeep(this.formData);
      _.set(modified, path, value);
      console.log("New value recieved for", path, "=", value);
      console.log(modified);
      this.updateForm(this.focus, modified);
    },
  },
  methods: {
    keyIsLocked(key) {
      return (this.isLocked || key === '@id' || key === '@type');
    },
    updateFromTextarea(e) {
      this.updateForm(this.focus, JSON.parse(e.target.value));
    },
  },
  components: {
    'data-node': DataNode,
    'field-adder': FieldAdder,
  },
};
</script>

<template>
  <div class="form-component" :class="{ 'locked': isLocked, 'work-state': isWork, 'instance-state': isInstance, 'focused-form-component': status.level === this.focus }">
    <data-node v-for="(k,v) in sortedFormData" v-bind:class="{ 'locked': isLocked }" :is-removable="true" :is-locked="keyIsLocked(k)" :key="k" :value="v" :focus="focus" :allow-local="true"></data-node>
    <div v-if="focus == 'work'" class="dummy-reverse">
      <div class="label" v-bind:class="{ 'locked': isLocked }">
        Har instanser
      </div>
      <div class="value">
        <div class="chip dummy-chip" v-on:click="changeStatus('level' ,'mainEntity')" :class="{ 'locked': isLocked }" @mouseenter="showCardInfo=true">
          <span class="chip-label">
            {{ dummyInstance }}
          </span>
        </div>
      </div>
      <div class="actions" v-if="!isLocked">
      </div>
    </div>
    <field-adder v-if="!isLocked" :allowed="allowedProperties" :focus="focus"></field-adder>
    <div id="result" v-if="status.isDev && !isLocked">
      <div class="row">
      <pre class="col-md-6">
        SORTED

        {{sortedFormData | json}}
      </pre>
      <pre class="col-md-6">
        ORIGINAL

        {{formData | json}}
      </pre>
      </div>
    </div>
  </div>
</template>

<style lang="less">
@import './_variables.less';

.form-component {
  margin: 10px 10px  80px 10px;
  border: 1px solid #ccc;
  &.locked {
    > ul > li {
      margin: 0px;
    }
  }

  >ul {
    padding-left: 0px;
    margin: 0px;
    >li {
      color: black;
      display: flex;
      flex-direction: row;
      align-items: center;
      padding: 5px 0px;
      list-style: none;
      width: 100%;
      box-shadow: none;
      transition: box-shadow ease-out 0.2s;

      &:hover:not(.locked) {
        >.actions {
          opacity: 1;
        }
      }

    }
  }
  .node-linked {
    > div.expanded {
      width: @col-value;
    }
  }
  .node-local {
    width: 420px;
    clear: left;
  }

  .dummy-reverse {
    display: flex;
    width: 100%;
    flex-direction: row;
    background-color: #f2f2f2;
    .label {
      color: black;
      order: 1;
      flex-basis: @col-label;
      display: flex;
      text-align: right;
      align-items: center;
      justify-content: flex-end;
      font-size: 1.2rem;
      color: #333333;
      font-weight: normal;
    }
    .value {
      order: 2;
      flex-basis: @col-value;
      padding: 5px;
      .dummy-chip {
        .chip-mixin(@brand-primary, #fff);
      }
    }
  }
}

</style>
