<script>
/*
  This component is responsible for the actual changes to the formdata.
  It recieves modification events from other components through $dispatch calls
  and makes changes to the bound 'focus' object accordingly.
*/

import { cloneDeep, unset, set } from 'lodash-es';
import * as VocabUtil from '@/utils/vocab';
import FormMixin from '@/components/mixins/form-mixin';
import { mapGetters } from 'vuex';

export default {
  mixins: [FormMixin],
  props: {
    editingObject: {
      type: String,
      default: '',
    },
    locked: {
      type: Boolean,
      default: false,
    },
    collapsed: {
      type: Boolean,
      default: false,
    },
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
        this.resources.context,
      )
      ) {
        return true;
      } if (VocabUtil.isSubClassOf(
        this.inspector.data[this.editingObject]['@type'], 
        'Work', 
        this.resources.vocab, 
        this.resources.context,
      )
      ) {
        return true;
      } if (VocabUtil.isSubClassOf(
        this.inspector.data[this.editingObject]['@type'], 
        'Agent', this.resources.vocab, 
        this.resources.context,
      )
      ) {
        return true;
      } if (VocabUtil.isSubClassOf(
        this.inspector.data[this.editingObject]['@type'], 
        'Concept', 
        this.resources.vocab, 
        this.resources.context,
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
    formObj() {
      return this.formData;
    },
    formData() {
      return this.inspector.data[this.editingObject];
    },
  },
  watch: {
  },
  events: {
    'remove-field'(path) {
      const modifiedData = cloneDeep(this.formData);
      unset(modifiedData, path);
      this.updateForm(this.editingObject, modifiedData, this.formData);
    },
    'update-value'(path, value) {
      // console.log("FormComp: - Updating " + path, 'to', JSON.stringify(value));
      const modified = cloneDeep(this.formData);

      set(modified, path, value);
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
  mounted() {
  },
};
</script>

<template>
  <div class="EntityForm form-component focused-form-component" 
    :class="{ 'locked is-locked': isLocked }" 
    v-show="isActive">
    <ul class="FieldList" 
      v-bind:class="{'collapsed': collapsed }">
      <field class="FieldList-item"
        v-for="(v,k) in filteredItem" 
        v-bind:class="{ 'locked': isLocked }" 
        :entity-type="inspector.data[editingObject]['@type']" 
        :is-inner="false" 
        :is-removable="true" 
        :is-locked="keyIsLocked(k)" 
        :key="k" 
        :field-key="k" 
        :field-value="v" 
        :parent-path="editingObject"></field>
      <div id="result" v-if="user.settings.appTech && !isLocked">
        <pre class="col-md-12">
          {{ formData }}
        </pre>
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
  background-color: @form-field;
  border: 1px solid @form-border;
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
    color: @black;
    flex-direction: row;
    list-style: none;
    width: 100%;
    min-height: 60px;
    box-shadow: none;
    // transition: box-shadow ease-out 0.2s;

    &:hover:not(.locked) {
      >.actions {
        opacity: 1;
      }
    }

  }
}

</style>
