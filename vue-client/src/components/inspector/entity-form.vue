<script>
/*
  This component is responsible for the actual changes to the formdata.
  It recieves modification events from other components through $dispatch calls
  and makes changes to the bound 'focus' object accordingly.
*/
import { mapGetters } from 'vuex';
import * as VocabUtil from 'lxljs/vocab';
import { translatePhrase } from '@/utils/filters';
import LensMixin from '@/components/mixins/lens-mixin.vue';
import FormMixin from '@/components/mixins/form-mixin.vue';

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
    diff: {
      type: Object,
      default: null,
    },
    inClassAndProperty: {
      type: String,
      default: '',
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
        'Agent',

        this.resources.vocab,
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
    showIncomingLinksSection() {
      return Object.keys(this.reverseItemStandalone).length > 0;
    },

    formObj() {
      return this.formData;
    },
  },
  watch: {
  },
  methods: {
    translatePhrase,
    keyIsLocked(key) {
      return (this.isLocked || key === '@id');
    },
    isIntegral(key) {
      if (key.indexOf('@reverse/') >= 0) {
        key = key.split('/').pop();
      }

      return VocabUtil.hasCategory(key, 'integral', this.resources);
    },
  },
  components: {
  },
  mounted() {
  },
};
</script>

<template>
  <div
    class="EntityForm form-component focused-form-component"
    :class="{ 'locked is-locked': isLocked }"
    v-show="isActive">
    <ul
      class="FieldList"
      v-bind:class="{ collapsed: collapsed }">
      <field
        class="FieldList-item"
        v-for="(v, k) in filteredItem"
        v-bind:class="{ locked: isLocked }"
        :entity-type="formObj['@type']"
        :is-inner="false"
        :is-removable="true"
        :is-locked="keyIsLocked(k)"
        :parent-accepted-types="acceptedTypes"
        :is-card="isIntegral(k)"
        :key="k"
        :diff="diff"
        :field-key="k"
        :field-value="v"
        :parent-path="editingObject"
      />
      <div id="result" v-if="user.settings.appTech && !isLocked">
        <pre class="col-md-12">
          {{ formObj }}
        </pre>
      </div>
    </ul>

    <div
      v-if="reverseItem && editingObject === 'mainEntity' && showIncomingLinksSection"
      class="EntityForm-reverse">
      <h6 class="uppercaseHeading">{{ translatePhrase('Incoming links') }}</h6>
      <ul class="FieldList">
        <field
          class="FieldList-item"
          v-for="(v, k) in reverseItemStandalone"
          v-bind:class="{ locked: isLocked }"
          :entity-type="formObj['@type']"
          :is-inner="false"
          :is-removable="false"
          :is-locked="true"
          :is-card="isIntegral(k)"
          :parent-accepted-types="acceptedTypes"
          :key="k"
          :field-key="k"
          :field-value="v"
          :parent-path="'reverseItems'" />
      </ul>
    </div>
  </div>
</template>

<style lang="less">

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
              &:not(.is-diff-removed) {
                &:not(.is-diff-added) {
                  &:not(.is-diff-modified) {
                    background-color: @form-field;
                  }
                }
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
}

</style>
