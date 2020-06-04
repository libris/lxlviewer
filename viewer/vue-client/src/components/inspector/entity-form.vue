<script>
/*
  This component is responsible for the actual changes to the formdata.
  It recieves modification events from other components through $dispatch calls
  and makes changes to the bound 'focus' object accordingly.
*/
import { cloneDeep, groupBy, each } from 'lodash-es';
import { mapGetters } from 'vuex';
import * as VocabUtil from '@/utils/vocab';
import LensMixin from '@/components/mixins/lens-mixin';
import FormMixin from '@/components/mixins/form-mixin';

export default {
  mixins: [FormMixin, LensMixin],
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
    reverseItemSorted() {
      const reverseItem = cloneDeep(this.reverseItem);
      const reverseItemSorted = {};

      each(reverseItem, (item, key) => {
        let groupedReverseItems = {};

        // get label and add it to the object for sorting        
        item.map((obj) => {
          obj.label = this.getLabel(obj);
          return obj;
        });         

        // sort aplphabetically
        item.sort((a, b) => a.label.localeCompare(b.label, 'sv'));

        // group by first letter
        groupedReverseItems = groupBy(item, i => i.label.substring(0, 1));

        // delete label
        Object.keys(groupedReverseItems).forEach((k) => {
          groupedReverseItems[k].forEach(v => delete v.label);
        });        

        reverseItemSorted[key] = {};
        reverseItemSorted[key].items = groupedReverseItems;
        reverseItemSorted[key].isGrouped = true;
        reverseItemSorted[key].totalItems = item.length;
      });

      return reverseItemSorted;
    },
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

    <!-- <div 
      v-if="reverseItem && editingObject === 'mainEntity'"
      class="EntityForm-reverse">
      <h6 class="uppercaseHeading">Resurser som länkar hit</h6>
      <ul class="FieldList">
        <field class="FieldList-item"        
          v-for="(v,k) in reverseItemSorted"
          v-bind:class="{ 'locked': isLocked }" 
          :entity-type="formObj['@type']" 
          :is-inner="false" 
          :is-removable="false" 
          :is-locked="true" 
          :key="k" 
          :field-key="'@reverse/' + k" 
          :field-value="v" 
          :parent-path="editingObject" />
      </ul>
    </div> -->
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

  &-reverse {
    margin-top: 2.4rem;
  }
}

.form-component {
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
        &:not(.is-highlighted) {
          &:not(.is-removeable) {
            &:not(.is-marked) {
              &:not(.is-linked) {
                background-color: @form-field;
              }
            }
          }
        }
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

  &-item.is-linked {
    border-color: rgba(@brand-primary, 23%);
    background-color: lighten(@form-add, 5%);
    
    &:hover {
      & .icon:not(.is-disabled) {
        color: rgba(@brand-primary, 80%);
      }
    }
    & .icon {
      color: rgba(@brand-primary, 40%);

      &:hover:not(.is-disabled),
      &:focus {
        color: @brand-primary;
      }
    }
  }
}

</style>
