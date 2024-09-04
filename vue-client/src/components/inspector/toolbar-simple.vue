<script>
/*
  Simplified toolbar
*/
import { vOnClickOutside } from '@vueuse/components';
import { mapGetters } from 'vuex';
import * as VocabUtil from 'lxljs/vocab';
import * as LayoutUtil from '@/utils/layout';
import { translatePhrase, labelByLang, convertResourceLink } from '@/utils/filters';
import FieldAdder from '@/components/inspector/field-adder.vue';
import LensMixin from '@/components/mixins/lens-mixin.vue';
import FormMixin from '@/components/mixins/form-mixin.vue';

export default {
  mixins: [LensMixin, FormMixin],
  directives: {
    'on-click-outside': vOnClickOutside,
  },
  props: {
    fieldAdderOpen: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      showAdminInfoDetails: false,
      otherFormatMenuActive: false,
      toolsMenuActive: false,
      loadingEdit: false,
      showEdit: false,
      showTools: false,
      showDisplayAs: false,
      showUndo: false,
      showSave: false,
      showCancel: false,
      showFieldAdderTooltip: false,
      showClarifySave: false,
      showMarcPreview: false,
      showEmbellishTemplateSubMenu: false,
      showEmbellishFromRecordSubMenu: false,
      fieldAdderActive: false,
    };
  },
  watch: {
    'inspector.status.editing'(state) {
      if (state) {
        this.loadingEdit = false;
      }
    },
    'inspector.event'(val) {
      if (val.name === 'form-control') {
        switch (val.value) {
          case 'open-field-adder':
            this.openFieldAdder();
            break;
          case 'undo':
            this.undo();
            break;
          default:
        }
      }
    },
    'status.keyActions'(value) {
      this.formControl(value[value.length - 1]);
    },
  },
  methods: {
    translatePhrase,
    labelByLang,
    convertResourceLink,
    getKeybindText(eventName) {
      return LayoutUtil.getKeybindingText(eventName);
    },
    openFieldAdder() {
      if (!this.fieldAdderActive) {
        this.fieldAdderActive = true;
      } else {
        this.fieldAdderActive = false;
      }
    },
    formControl(control) {
      this.$store.dispatch('pushInspectorEvent', {
        name: 'form-control',
        value: control,
      });
    },
    toggleEditorFocus() {
      if (this.inspector.status.focus === 'record') {
        this.$store.dispatch('setInspectorStatusValue', {
          property: 'focus',
          value: 'mainEntity',
        });
      } else {
        this.$store.dispatch('setInspectorStatusValue', {
          property: 'focus',
          value: 'record',
        });
      }
    },
    undo() {
      this.showUndo = false;
      this.$store.dispatch('undoInspectorChange');
    },
    isSubClassOf(type) {
      return VocabUtil.isSubClassOf(
        this.inspector.data.mainEntity['@type'],
        type,
        this.resources.vocab,
        this.resources.context,
      );
    },
  },
  computed: {
    ...mapGetters([
      'inspector',
      'resources',
      'templates',
      'user',
      'settings',
      'status',
    ]),
    formObj() {
      return this.inspector.data[this.inspector.status.focus];
    },
    allowed() {
      return VocabUtil.getPropertiesFromArray(
        this.formObj['@type'],
        this.resources.vocabClasses,
        this.resources.vocabProperties,
        this.resources.context,
      );
    },
    showRecord() {
      return this.status.showRecord;
    },
    activeSigelId() {
      return this.user.getActiveLibraryUri();
    },
    focusData() {
      return this.inspector.data;
    },
    editing() {
      return this.inspector.status.editing;
    },
  },
  components: {
    'field-adder': FieldAdder,
  },
  mounted() {
    this.$nextTick(() => {
    });
  },
};
</script>

<template>
  <div class="Toolbar" id="editor-container">
    <field-adder
      class="FieldAdder--inToolbar Toolbar-btn"
      :entity-type="inspector.data[inspector.status.focus]['@type']"
      :inner="false"
      :allowed="allowedProperties"
      :path="inspector.status.focus"
      :editing-object="inspector.status.focus"
      :in-toolbar="true"
      :force-active="fieldAdderActive" />

    <button
      class="Toolbar-btn btn btn-default toolbar-button"
      :disabled="inspector.changeHistory.length === 0"
      v-tooltip.left="`${translatePhrase('Undo')} (${getKeybindText('undo')})`"
      @click="undo"
      @mouseover="showUndo = true"
      @mouseout="showUndo = false"
      :aria-label="translatePhrase('Undo')">
      <i class="fa fa-undo" aria-hidden="true" />
    </button>
  </div>
</template>

<style lang="less">

.Toolbar {
  &-placeholder {
    width: 100%;
  }

  &-container {
    bottom: 10px;
    min-width: 65px;
    position: fixed;
    border: 1px solid #cccccc;
    border: 1px solid #cccccc75;
    background-color: #ececec;
    background-color: #ecececd1;
    padding: 6px;
    border-radius: 0.5em;
    box-shadow: 0px 0px 15px 0px @grey;
    box-shadow: 0px 0px 15px 0px rgba(0,0,0,0.2);

    @media (min-width: 992px) {
      top: 11em;
      bottom: auto;
      width: 65px;
    }
    @media (min-width: 1200px) {
      padding: 8px;
    }
    @media print {
      display: none;
    }
  }

  &-container {
    z-index: 3;
  }

  &-menu {
    display: inline-block;
  }

  &-btn {
    border-radius: 100%;
    font-size: 20px;
    font-size: 2rem;
    margin: 4px 0;
    width: 50px;
    height: 50px;
    position: relative;

    &:disabled {
      opacity: 0.65;
    }
  }

  &-menuLink {
    & i {
      margin-right: 5px;
    }
  }

  &-caret {
    position: absolute;
    right: 8px;
    bottom: 12px;
  }

  &-menuList {
    display: block;
    top: auto;
    left: 50px;
    bottom: 0;
    padding: 10px 0;
    min-height: 52px;
    max-height: 300px;
    overflow: hidden;
    overflow-y: auto;

    & .Toolbar-menuItem {
      &.is-active {
        font-weight: bold;
      }
      &.inSubMenu {
        background-color: @grey-lighter;
        & a:hover {
          background-color: darken(@grey-lighter, 5%);
        }
      }
      & .Toolbar-menuLink {
        display: flex;
        align-items: center;
        padding: 5px 15px;
        color: @grey-darker;
      }

      & .submenuControl {
        display: flex;
        flex: 1;
        justify-content: flex-end;
        align-items: center;
      }
    }

    @media (min-width: 992px) {
      top: auto;
      left: auto;
      bottom: auto;
      right: 0;
    }

    @media (min-height: 650px) {
      max-height: 400px;
    }

    @media (min-height: 850px) {
      max-height: 550px;
    }

    @media (min-height: 1000px) {
      max-height: none;
    }
  }
  .TemplatePicker, .OverridePicker {
    width: 1px;
    height: 1px;
    opacity: 0;
  }
}

.dropdown.tools,
.dropdown.other-format {
  li > a {
    cursor: pointer;
    padding: 3px 5px;
  }
  .remove-option {
    a {
      &:hover {
        color: @white;
        background-color: #c55252;
      }
    }
  }
}

</style>
