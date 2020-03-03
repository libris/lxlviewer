<script>
/*
  This component is responsible for the actual changes to the formdata.
  It recieves modification events from other components through $dispatch calls
  and makes changes to the bound 'focus' object accordingly.
*/

import { mapGetters } from 'vuex';
import * as VocabUtil from '@/utils/vocab';
import FormMixin from '@/components/mixins/form-mixin';

export default {
  mixins: [FormMixin],
  props: {
    formData: {
      type: Object,
      default: null,
    },
    editingObject: {
      type: String,
      default: '',
    },
    locked: {
      type: Boolean,
      default: false,
    },
    isActive: {
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
    // formData() {
    //   return this.inspector.data[this.editingObject];
    // },
  },
  watch: {
  },
  methods: {
    keyIsLocked(key) {
      return (this.isLocked || key === '@id');
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
        :entity-type="formObj['@type']" 
        :is-inner="false" 
        :is-removable="true" 
        :is-locked="keyIsLocked(k)" 
        :is-distinguished="k === 'instanceOf'"
        :key="k" 
        :field-key="k" 
        :field-value="v" 
        :parent-path="editingObject" />
      <div id="result" v-if="user.settings.appTech && !isLocked">
        <pre class="col-md-12">
          {{ formObj }}
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
  border-bottom: 2px solid @form-border;

  &-item {
    color: @black;
    &:not(.is-diff) {
      &:not(.is-new) {
        background-color: @form-field;
      }
    }
    border: 1px solid @form-border;
    border-bottom-width: 0;
    flex-direction: row;
    list-style: none;
    width: 100%;
    box-shadow: none;
  }

  &-item.is-distinguished {    
    border-bottom-width: 2px;
    margin-bottom: 1rem;
  }

  &-item.is-distinguished.is-linked {
    border-color: rgba(@brand-success, 23%);
    background-color: rgba(@brand-success, 4%);
    
    &:hover {
      & .icon:not(.is-disabled) {
        color: rgba(@brand-success, 80%);
      }
    }
    & .icon {
      color: rgba(@brand-success, 40%);

      &:hover:not(.is-disabled),
      &:focus {
        color: @brand-darker;
      }
    }
  }
}

</style>
