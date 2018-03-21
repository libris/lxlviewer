<script>
/*
  This component is responsible for the actual changes to the formdata.
  It recieves modification events from other components through $dispatch calls
  and makes changes to the bound 'focus' object accordingly.
*/

import * as _ from 'lodash';
import * as ModalUtil from '@/utils/modals';
import * as VocabUtil from '@/utils/vocab';
import * as DisplayUtil from '@/utils/display';
import * as StringUtil from '@/utils/string';
import { mapGetters } from 'vuex';

export default {
  props: {
    locked: false,
    editingObject: '',
    collapsed: false,
  },
  data() {
    return {
      showJson: false,
    };
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
      return this.inspector.status.focus === this.editingObject;
    },
    isHolding() {
      return this.inspector.data[this.editingObject]['@type'] === 'Item';
    },
    isBib() {
      if (VocabUtil.isSubClassOf(
          this.inspector.data[this.editingObject]['@type'], 
          'Instance', 
          this.resources.vocab, 
          this.settings.vocabPfx, 
          this.resources.context
        )
      ) {
        return true;
      } else if (VocabUtil.isSubClassOf(
          this.inspector.data[this.editingObject]['@type'], 
          'Work', 
          this.resources.vocab, 
          this.settings.vocabPfx, 
          this.resources.context
          )
        ) {
        return true;
      } else if (VocabUtil.isSubClassOf(
          this.inspector.data[this.editingObject]['@type'], 
          'Agent', this.resources.vocab, 
          this.settings.vocabPfx, 
          this.resources.context
          )
        ) {
        return true;
      } else if (VocabUtil.isSubClassOf(
          this.inspector.data[this.editingObject]['@type'], 
          'Concept', 
          this.resources.vocab, 
          this.settings.vocabPfx, 
          this.resources.context
        )
      ) {
        return true;
      }
      return false;
    },
    isLocked() {
      if (this.locked) {
        return true;
      }
      return false;
    },
    specialProperties() {
      const props = [];
      for (const prop of this.settings.specialProperties) {
        if (this.inspector.data[this.editingObject][prop]) {
          props.push(prop);
        }
      }
      return props;
    },
    allowedProperties() {
      const settings = this.settings;
      const formObj = this.formData;
      const allowed = VocabUtil.getPropertiesFromArray(
        [StringUtil.convertToVocabKey(
          StringUtil.convertToBaseUri(formObj['@type'], 
          this.resources.context), 
          this.resources.context)],
        this.resources.vocabClasses,
        this.settings.vocabPfx,
        this.resources.vocabProperties,
        this.resources.context
      );
      // Add the "added" property
      for (const element of allowed) {
        const oId = element.item['@id'].replace(settings.vocabPfx, '');
        element.added = (formObj.hasOwnProperty(oId) && formObj[oId] !== null);
      }

      const extendedAllowed = allowed.map(property => {
        const labelByLang = property.item.labelByLang;
        const prefLabelByLang = property.item.prefLabelByLang;
        if (typeof labelByLang !== 'undefined') {
          // Try to get the label in the preferred language
          let label = ((typeof labelByLang[this.settings.language] !== 'undefined') ? labelByLang[this.settings.language] : labelByLang.en);
          // If several labels are present, use the first one
          if (_.isArray(label)) {
            label = label[0];
          }
          return {
            added: property.added,
            item: property.item,
            label: label
          };
        } else if (typeof prefLabelByLang !== 'undefined') {
          // Try to get the label in the preferred language
          let label = ((typeof prefLabelByLang[this.settings.language] !== 'undefined') ? prefLabelByLang[this.settings.language] : prefLabelByLang.en);
          // If several labels are present, use the first one
          if (_.isArray(label)) {
            label = label[0];
          }
          return {
            added: property.added,
            item: property.item,
            label: label
          };
        } else {
          // If no label, use @id as label
          return {
            added: property.added,
            item: property.item,
            label: property.item['@id']
          };
        }
      });
      const sortedAllowed = _.sortBy(extendedAllowed, (prop) => {
        return prop.label.toLowerCase();
      });
      return sortedAllowed;
    },
    formData() {
      return this.inspector.data[this.editingObject];
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
        'full',
        this.resources.display,
        this.settings
      );
      if (propertyList.length === 0) { // If none were found, traverse up inheritance tree
        const baseClasses = VocabUtil.getBaseClassesFromArray(
          formObj['@type'],
          this.resources.vocab,
          this.settings.vocabPfx,
          this.resources.context
        );
        for (const baseClass of baseClasses) {
          propertyList = DisplayUtil.getProperties(
            baseClass.replace(this.settings.vocabPfx, ''),
            'cards',
            this.resources.display,
            this.settings
          );
          if (propertyList.length > 0) {
            break;
          }
        }
        if (propertyList.length === 0) {
          propertyList = DisplayUtil.getProperties(
            'Resource',
            'cards',
            this.resources.display,
            this.settings
          );
        }
      }
      _.each(formObj, (v, k) => {
        if (!_.includes(propertyList, k)) {
          propertyList.push(k);
        }
      });
      _.remove(propertyList, (k) => {
        return (this.settings.specialProperties.indexOf(k) !== -1);
      });

      return propertyList;
    },
  },
  watch: {
  },
  events: {
    'remove-field'(path) {
      const modifiedData = _.cloneDeep(this.formData);
      _.unset(modifiedData, path);
      this.updateForm(this.editingObject, modifiedData, this.formData);
    },
    'update-value'(path, value) {
      // console.log("FormComp: - Updating " + path, 'to', JSON.stringify(value));
      const modified = _.cloneDeep(this.formData);

      _.set(modified, path, value);
      // console.log("New value recieved for", path, "=", value);
      // console.log(modified);
      this.changeStatus('removing', false);
      this.updateForm(this.editingObject, modified, this.formData);
    },
  },
  methods: {
    keyIsLocked(key) {
      return (this.isLocked || key === '@id' || key === '@type');
    },
    updateFromTextarea(e) {
      this.updateForm(this.editingObject, JSON.parse(e.target.value), this.formData);
    },
  },
  components: {
  },
  ready() {
  }
};
</script>

<template>
  <div class="EntityForm form-component focused-form-component" 
    :class="{ 'locked is-locked': isLocked }" 
    v-show="isActive">
    <div class="EntityForm-container field-container" 
      v-bind:class="{'collapsed': collapsed }">
      <field
        v-for="(v,k) in sortedFormData" 
        v-bind:class="{ 'locked': isLocked }" 
        :entity-type="inspector.data[editingObject]['@type']" 
        :is-inner="false" 
        :is-removable="true" 
        :is-locked="keyIsLocked(k)" 
        :key="k" 
        :field-key="k" 
        :field-value="v" 
        :parent-path="inspector.status.focus"></field>
      <div id="result" v-if="user.settings.appTech && !isLocked">
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
  </div>
</template>

<style lang="less">

.ribbon-mixin(@ribbon-color) {
  // padding: 0 10px 0 10px;
  // position: relative;
  // margin: 0 -10px 0 -10px;
  // box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.15);
  background-color: @ribbon-color;
  border: solid darken(@ribbon-color, 3%);
  border-width: 0px 0px 1px 0px;
  // border-radius: 0px 0px 2px 2px;
  // &:before {
  //   content: ' ';
  //   position: absolute;
  //   width: 0;
  //   height: 0;
  //   right: 0px;
  //   top: 100%;
  //   border-width: 5px 5px;
  //   border-style: solid;
  //   border-color: darken(@ribbon-color, 10%) transparent transparent darken(@ribbon-color, 10%);
  // }
  // &:after {
  //   content: ' ';
  //   position: absolute;
  //   width: 0;
  //   height: 0;
  //   left: 0px;
  //   top: 100%;
  //   border-width: 5px 5px;
  //   border-style: solid;
  //   border-color: darken(@ribbon-color, 10%) darken(@ribbon-color, 10%) transparent transparent;
  // }
}

.EntityForm {
  &-container {
    border: solid #d8d8d8;
    margin: 0px;
    padding: 0;
    border-width: 1px 0px 0px 0px;
    transition: 2s ease max-height;
  }
}

.form-component {
  .form-label {
    color: @white;
    display: flex;
    justify-content: space-between;
    border-width: 0px 0px 1px 0px;
    > span {
      &.left-column {
        flex: 0 0 40%;
        display: flex;
        align-items: center;
        justify-content: flex-start;
        padding: 0 1em;
      }
      &.middle-column {
        flex: 0 0 20%;
        text-align: center;
        // text-shadow: 0px 1px 2px rgba(0, 0, 0, 0.4);
      }
      &.right-column {
        flex: 0 0 40%;
        display: flex;
        align-items: center;
        justify-content: flex-end;
        padding: 0 1em;
        code {
          color: #fff;
          padding: 0em 0.5em;
          background-color: rgba(0, 0, 0, 0.2);
        }
      }
    }
    .type-label {
      font-size: 1.2em;
      font-weight: bold;
    }
    .new-indicator {
      font-size: 1em;
    }
    &.record-style {
      .ribbon-mixin(@gray);
    }
    &.bib-style {
      .ribbon-mixin(@bib-color);
    }
    &.holding-style {
      .ribbon-mixin(desaturate(darken(@holding-color, 10%), 10%));
    }
  }
  .field-container-toggle {
    text-align: center;
    font-weight: bold;
    font-size: 85%;
    text-transform: uppercase;
    cursor: pointer;
    padding: 0.5em;
  }
  box-shadow: @shadow-base;
  margin-bottom: 2em;
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
  .node-local {
    width: 420px;
    clear: left;
  }
}

</style>
