<script>
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
    formObj: {},
    isSetToReady: false,
    showFieldAdder: {
      type: Boolean,
      default: false,
    },
    showUndo: {
      type: Boolean,
      default: false,
    },
    lastItemActive: {
      type: Boolean,
      default: false,
    },
    firstItemActive: {
      type: Boolean,
      default: false,
    },
    hasUnsaved: {
      type: Boolean,
      default: false,
    },
    hasNext: {
      type: Boolean,
      default: false,
    },
    hasPrevious: {
      type: Boolean,
      default: false,
    },
    finished: {
      type: Boolean,
      default: false,
    },
    isDraft: {
      type: Boolean,
      default: false,
    },
    isNew: {
      type: Boolean,
      default: false,
    },
    loadingPreview: {
      type: Object,
      default: () => ({'next' : false, 'previous' : false}),
    },
  },
  data() {
    return {
      fieldAdderActive: false,
      toolsMenuActive: false,
      showTools: false,
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
          case 'next':
            this.next();
            break;
          case 'previous':
            this.previous();
            break;
          case 'next-preview':
            this.nextPreview();
            break;
          case 'previous-preview':
            this.previousPreview();
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
    hideToolsMenu() {
      this.toolsMenuActive = false;
    },
    showToolsMenu() {
      this.toolsMenuActive = !this.toolsMenuActive;
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
      this.$store.dispatch('undoInspectorChange');
    },
    next() {
      this.$emit('next');
    },
    previous() {
      this.$emit('previous');
    },
    preview() {
      this.$emit('preview');
    },
    nextPreview() {
      this.$emit('nextPreview');
    },
    previousPreview() {
      this.$emit('previousPreview');
    },
    isSubClassOf(type) {
      return VocabUtil.isSubClassOf(
        this.inspector.data.mainEntity['@type'],
        type,
        this.resources.vocab,
        this.resources.context,
      );
    },
    handleSave() {
      this.$emit('save');
    },
    handleReady() {
      this.$emit('ready');
    },
    cancel() {
      this.$emit('setAsDraft');
    },
    importFromIdList() {
      this.hideToolsMenu();
      this.$emit('openIdListModal');
    },
    showAsRecord() {
      this.hideToolsMenu();
      this.$emit('showAsRecord');
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
    showRecord() {
      return this.status.showRecord;
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
    <div
      class="dropdown Toolbar-menu ToolsMenu"
      v-on-click-outside="hideToolsMenu">
      <button
        class="Toolbar-btn btn btn-default ToolsMenu-button"
        @click="showToolsMenu"
        aria-haspopup="true"
        aria-expanded="true"
        v-tooltip.left="translatePhrase('Tools')"
        @mouseover="showTools = true"
        @mouseout="showTools = false"
        :aria-label="translatePhrase('Tools')">
        <i class="fa fa-fw fa-wrench" aria-hidden="true"/>
        <span class="Toolbar-caret caret"/>
      </button>
      <ul
        class="dropdown-menu Toolbar-menuList ToolsMenu-menu"
        v-show="toolsMenuActive">
        <li class="Toolbar-menuItem">
          <a class="Toolbar-menuLink" @click="formControl('expand-item'), hideToolsMenu()">
            <i class="fa fa-fw fa-expand" aria-hidden="true" />
            {{ translatePhrase("Expand all") }}{{ getKeybindText('expand-item') ? ` (${getKeybindText('expand-item')})` : ''}}
          </a>
        </li>
        <li class="Toolbar-menuItem">
          <a class="Toolbar-menuLink" @click="formControl('collapse-item'), hideToolsMenu()">
            <i class="fa fa-fw fa-compress" aria-hidden="true" />
            {{ translatePhrase("Collapse all") }}{{ getKeybindText('collapse-item') ? ` (${getKeybindText('collapse-item')})` : ''}}
          </a>
        </li>
        <li class="Toolbar-menuItem">
          <a class="Toolbar-menuLink" @click="importFromIdList" v-if="firstItemActive">
            <i class="fa fa-fw fa-chain" />
            {{ translatePhrase('Import selection from ID list') }}
          </a>
        </li>
        <li class="Toolbar-menuItem" v-if="!isNew">
          <a class="Toolbar-menuLink" @click="showAsRecord">
            <i class="fa fa-fw fa-eye" />
            {{ translatePhrase('Show as record') }}
          </a>
        </li>
      </ul>
    </div>
    <button
      v-if="isDraft"
      class="Toolbar-btn btn btn-default toolbar-button"
      :disabled="firstItemActive"
      v-tooltip.left="`${translatePhrase('Previous')} (${getKeybindText('previous')})`"
      @click="previous"
      :aria-label="translatePhrase('Previous')">
      <i class="fa fa-arrow-up" aria-hidden="true" />
    </button>
    <button
      v-if="isDraft"
      class="Toolbar-btn btn btn-default toolbar-button"
      :disabled="lastItemActive"
      v-tooltip.left="`${translatePhrase('Next')} (${getKeybindText('next')})`"
      @click="next"
      :aria-label="translatePhrase('Next')">
      <i class="fa fa-arrow-down" aria-hidden="true" />
    </button>
    <field-adder
      v-if="showFieldAdder && !finished"
      class="FieldAdder--inToolbar Toolbar-btn"
      :entity-type="inspector.data[inspector.status.focus]['@type']"
      :inner="false"
      :allowed="allowedProperties"
      :path="inspector.status.focus"
      :editing-object="inspector.status.focus"
      :in-toolbar="true"
      :force-active="fieldAdderActive"
    />
    <button
      v-if="showUndo && !finished"
      class="Toolbar-btn btn btn-default toolbar-button"
      :disabled="inspector.changeHistory.length === 0 || !showUndo"
      v-tooltip.left="`${translatePhrase('Undo')} (${getKeybindText('undo')})`"
      @click="undo"
      :aria-label="translatePhrase('Undo')">
      <i class="fa fa-undo" aria-hidden="true" />
    </button>
    <button
      v-if="lastItemActive && !finished"
      class="Toolbar-btn btn btn-default toolbar-button"
      :disabled="!hasPrevious"
      v-tooltip.left="`${translatePhrase('Previous')} (${getKeybindText('previous-preview')})`"
      @click="formControl('previous-preview')"
      :aria-label="translatePhrase('Previous')">
      <i class="fa fa-fw fa-circle-o-notch fa-spin" v-show="loadingPreview.previous" />
      <i class="fa fa-arrow-left" v-show="!loadingPreview.previous" />
    </button>
    <button
      v-if="lastItemActive && !finished"
      class="Toolbar-btn btn btn-default toolbar-button"
      :disabled="!hasNext"
      v-tooltip.left="`${translatePhrase('Next')} (${getKeybindText('next-preview')})`"
      @click="formControl('next-preview')"
      :aria-label="translatePhrase('Next')">
      <i class="fa fa-fw fa-circle-o-notch fa-spin" v-show="loadingPreview.next" />
      <i class="fa fa-arrow-right" v-show="!loadingPreview.next" />
    </button>
    <button
      v-if="isDraft"
      class="Toolbar-btn btn btn-primary"
      v-tooltip.left="`${translatePhrase('Save')}`"
      id="saveDoneButton"
      @click="handleSave"
      @mouseover="showClarifySave = true"
      @mouseout="showClarifySave = false"
      :aria-label="translatePhrase('Save')">
      <i class="fa fa-fw fa-circle-o-notch fa-spin" v-show="inspector.status.saving" />
      <i class="fa fa-fw fa-save" v-show="!inspector.status.saving" />
    </button>
    <button
      v-if="!this.isSetToReady || finished"
      class="Toolbar-btn btn btn-primary"
      v-tooltip.left="finished ? `${translatePhrase('Run again')}` : `${translatePhrase('Run')}`"
      id="runButton"
      @click="handleReady">
      <i class="fa fa-fw fa-play" />
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
