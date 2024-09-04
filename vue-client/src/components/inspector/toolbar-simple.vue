<script>
/*
  Simplified toolbar
*/
import { vOnClickOutside } from '@vueuse/components';
import { mapGetters } from 'vuex';
import * as LxlDataUtil from 'lxljs/data';
import * as VocabUtil from 'lxljs/vocab';
import * as StringUtil from 'lxljs/string';
import * as RecordUtil from '@/utils/record';
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
    applyFileAsOverride(data) {
      const splitData = LxlDataUtil.splitJson(data);
      this.$refs.OverridePicker.value = ''; // Important: reset the picker
      if (splitData.record['@id'] === this.inspector.data.record['@id']) {
        this.$store.dispatch('pushInspectorEvent', {
          name: 'apply-override',
          value: splitData,
        });
      } else {
        this.$store.dispatch('pushNotification', {
          type: 'danger',
          message: StringUtil.getUiPhraseByLang('New data @id does not match existing @id', this.user.settings.language, this.resources.i18n),
        });
      }
    },
    applyFileTemplate(data) {
      this.hideToolsMenu();
      const inspectorObj = LxlDataUtil.splitJson(data);
      const preparedData = RecordUtil.prepareDuplicateFor(inspectorObj, this.user, this.settings.keysToClear.duplication);
      const splitData = LxlDataUtil.splitJson(preparedData);
      this.$refs.TemplatePicker.value = ''; // Important: reset the picker
      this.$store.dispatch('pushInspectorEvent', {
        name: 'apply-template',
        value: splitData,
      });
    },
    initOverridePicker() {
      this.hideToolsMenu();
      const self = this;
      this.$refs.OverridePicker.addEventListener('change', (e) => {
        const reader = new FileReader();
        reader.onloadend = function onloadend() {
          try {
            const data = JSON.parse(this.result);
            self.applyFileAsOverride(data);
          } catch (error) {
            const msg = [
              StringUtil.getUiPhraseByLang('Something went wrong', self.settings.language, self.resources.i18n),
              StringUtil.getUiPhraseByLang('Verify structure in template', self.settings.language, self.resources.i18n),
            ];
            self.$store.dispatch('pushNotification', { type: 'danger', message: msg.join() });
          }
        };
        reader.readAsText(e.target.files[0]);
      });
    },
    initTemplatePicker() {
      this.hideToolsMenu();
      const self = this;
      this.$refs.TemplatePicker.addEventListener('change', (e) => {
        const reader = new FileReader();
        reader.onloadend = function onloadend() {
          try {
            const data = JSON.parse(this.result);
            self.applyFileTemplate(data);
          } catch (error) {
            const msg = [
              StringUtil.getUiPhraseByLang('Something went wrong', self.settings.language, self.resources.i18n),
              StringUtil.getUiPhraseByLang('Verify structure in template', self.settings.language, self.resources.i18n),
            ];
            self.$store.dispatch('pushNotification', { type: 'danger', message: msg.join() });
          }
        };
        reader.readAsText(e.target.files[0]);
      });
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
      this.showEmbellishTemplateSubMenu = false;
      this.showEmbellishFromRecordSubMenu = false;
    },
    formControl(control) {
      this.$store.dispatch('pushInspectorEvent', {
        name: 'form-control',
        value: control,
      });
    },
    recordControl(control) {
      // if (!this.inspector.status.updating) {
      this.hideToolsMenu();
      this.$store.dispatch('pushInspectorEvent', {
        name: 'record-control',
        value: control,
      });
      // }
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
    cancel() {
      this.$store.dispatch('flushExtractItemsOnSave');
      this.$store.dispatch('pushInspectorEvent', {
        name: 'record-control',
        value: 'cancel',
      });
    },
    undo() {
      this.showUndo = false;
      this.$store.dispatch('undoInspectorChange');
    },
    edit() {
      this.$store.dispatch('pushInspectorEvent', {
        name: 'record-control',
        value: 'start-edit',
      });
    },
    isSubClassOf(type) {
      return VocabUtil.isSubClassOf(
        this.inspector.data.mainEntity['@type'],
        type,
        this.resources.vocab,
        this.resources.context,
      );
    },
    download(text) {
      let focusId = this.inspector.data.record['@id'];
      if (this.recordType === 'Item') {
        focusId = this.inspector.data.mainEntity.itemOf['@id'].split('#')[0];
      }
      const element = document.createElement('a');
      const blob = new Blob([`${text}`], { type: 'application/marc' });
      element.href = window.URL.createObjectURL(blob);
      const splitIdParts = focusId.split('/');
      const id = splitIdParts[splitIdParts.length - 1];
      element.download = id;
      element.style.display = 'none';
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
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
    validTemplates() {
      const type = this.inspector.data.mainEntity['@type'];
      const baseType = VocabUtil.getRecordType(type, this.resources.vocab, this.resources.context);
      const templates = VocabUtil.getValidTemplates(type, this.templates.combined[baseType.toLowerCase()], this.resources.vocabClasses, this.resources.context);
      return templates.sort((a, b) => a.label.localeCompare(b.label));
    },
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
      this.initTemplatePicker();
      this.initOverridePicker();
    });
  },
};
</script>

<template>
  <div class="Toolbar" id="editor-container">
    <input type="file" class="TemplatePicker" ref="TemplatePicker" accept=".jsonld,application/ld+json,text/*" tabindex="-1" aria-hidden="true" />
    <input type="file" class="OverridePicker" ref="OverridePicker" accept=".jsonld,application/ld+json,text/*" tabindex="-1" aria-hidden="true" />

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
