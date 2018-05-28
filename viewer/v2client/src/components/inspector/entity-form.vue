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
import FormMixin from '@/components/mixins/form-mixin';
import { mapGetters } from 'vuex';

export default {
  mixins: [FormMixin],
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
          this.resources.context
        )
      ) {
        return true;
      } else if (VocabUtil.isSubClassOf(
          this.inspector.data[this.editingObject]['@type'], 
          'Work', 
          this.resources.vocab, 
          this.resources.context
          )
        ) {
        return true;
      } else if (VocabUtil.isSubClassOf(
          this.inspector.data[this.editingObject]['@type'], 
          'Agent', this.resources.vocab, 
          this.resources.context
          )
        ) {
        return true;
      } else if (VocabUtil.isSubClassOf(
          this.inspector.data[this.editingObject]['@type'], 
          'Concept', 
          this.resources.vocab, 
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
    formObj() {
      return this.formData;
    },
    allowed() {
      return VocabUtil.getPropertiesFromArray(
        formObj['@type'],
        this.resources.vocabClasses,
        this.resources.vocabProperties,
        this.resources.context
      );
    },
    formData() {
      return this.inspector.data[this.editingObject];
    },
    sortedFormData() {
      const sortedForm = {};
      for (const property of this.sortedProperties) {
        const k = property;
        if (typeof this.formData[k] !== 'undefined' || this.formData[k] === '') {
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
          this.resources.context
        );
        for (const baseClass of baseClasses) {
          propertyList = DisplayUtil.getProperties(
            StringUtil.getCompactUri(baseClass, this.resources.context),
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
  mounted() {
  }
};
</script>

<template>
  <div class="EntityForm well form-component focused-form-component" 
    :class="{ 'locked is-locked': isLocked }" 
    v-show="isActive">
    <ul class="FieldList" 
      v-bind:class="{'collapsed': collapsed }">
      <field class="FieldList-item"
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
    </ul>
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
}

.EntityForm {
  margin: 20px 0 0;
  padding: 0;

  &-fieldList {
    padding: 0;
    border-width: 1px 0px 0px 0px;
    transition: 2s ease max-height;
  }
}

.form-component {
  .form-label {
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
}

.FieldList {
  padding-left: 0px;
  margin: 0px;
  &-item {
    color: black;
    flex-direction: row;
    align-items: center;
    padding:  5px 0;
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

</style>
