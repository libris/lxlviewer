<script>
/*
  Controls add new field button and add field modal with it's content
*/

import { filter, isArray } from 'lodash-es';
import { mapGetters } from 'vuex';
import * as StringUtil from 'lxljs/string';
import * as VocabUtil from 'lxljs/vocab';
import * as LayoutUtil from '@/utils/layout';
import PanelComponent from '@/components/shared/panel-component.vue';
import RoundButton from '@/components/shared/round-button.vue';
import { translatePhrase, removeDomain, capitalize } from '@/utils/filters';

export default {
  name: 'field-adder',
  props: {
    allowed: {
      type: Array,
      default: () => [],
    },
    inner: {
      type: Boolean,
      default: false,
    },
    path: {
      type: String,
      default: '',
    },
    index: Number,
    editingObject: {
      type: String,
      default: '',
    },
    entityType: {
      type: String,
      default: '',
    },
    inToolbar: {
      type: Boolean,
      default: false,
    },
    forceActive: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      active: false,
      buttonFixed: true,
      buttonPos: -1,
      filterKey: '',
      showToolTip: false,
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
    modalTitle() {
      const title = StringUtil.getUiPhraseByLang('Add field in', this.user.settings.language, this.resources.i18n);
      const contextString = StringUtil.getLabelByLang(
        this.entityType,
        this.user.settings.language,
        this.resources,
      );
      return `${title}: ${contextString}`;
    },
    filteredResults() {
      const lang = this.user.settings.language;
      if (!this.allowed || this.allowed.length === 0) {
        return [];
      }
      if (!this.filterKey || this.filterKey.length < 1) {
        if (this.allowed) {
          return this.allowed;
        }
      }
      const fKey = this.filterKey.toLowerCase();
      const filtered = filter(this.allowed, (o) => {
        let labelByLang = '';
        if (
          typeof o.item.labelByLang !== 'undefined'
          && typeof o.item.labelByLang[lang] !== 'undefined'
        ) {
          if (isArray(o.item.labelByLang[lang])) {
            labelByLang = o.item.labelByLang[lang][0];
          } else {
            labelByLang = o.item.labelByLang[lang];
          }
        } else if (
          typeof o.item.prefLabelByLang !== 'undefined'
          && typeof o.item.prefLabelByLang[lang] !== 'undefined'
        ) {
          if (isArray(o.item.prefLabelByLang[lang])) {
            labelByLang = o.item.prefLabelByLang[lang][0];
          } else {
            labelByLang = o.item.prefLabelByLang[lang];
          }
        }
        // @id
        const pId = o.item['@id'].toString().toLowerCase();
        // note
        const pNote = o.item.hasOwnProperty('note') ? o.item.note.toString().toLowerCase() : '';
        // label by lang
        const pLabel = labelByLang.toLowerCase() || '';
        return (
          pId.indexOf(fKey) !== -1 || pNote.indexOf(fKey) !== -1 || pLabel.indexOf(fKey) !== -1
        );
      });
      return filtered;
    },
  },
  methods: {
    translatePhrase,
    removeDomain,
    capitalize,
    getKeybindText(eventName) {
      return LayoutUtil.getKeybindingText(eventName);
    },
    toggleFullView() {
      const user = this.user;
      user.settings.forceFullViewPanel = !user.settings.forceFullViewPanel;
      this.$store.dispatch('setUser', user);
    },
    actionHighlight(active, event) {
      if (active) {
        let item = event.target;
        while ((item = item.parentElement) && !item.classList.contains('js-itemLocal'));
        item.classList.add('is-marked');
      } else {
        let item = event.target;
        while ((item = item.parentElement) && !item.classList.contains('js-itemLocal'));
        item.classList.remove('is-marked');
      }
    },
    closeModals() {
      this.hide();
      return true;
    },
    getPropClassInfo(termObj) {
      if (isArray(termObj['@type'])) {
        if (termObj['@type'].indexOf('DatatypeProperty') > -1 && termObj['@type'].indexOf('DatatypeProperty') > -1) {
          return StringUtil.getUiPhraseByLang('Literals and entities', this.user.settings.language, this.resources.i18n);
        } if (termObj['@type'].indexOf('DatatypeProperty') > -1) {
          return StringUtil.getUiPhraseByLang('Literals', this.user.settings.language, this.resources.i18n);
        } if (termObj['@type'].indexOf('ObjectProperty') > -1) {
          return StringUtil.getUiPhraseByLang('Entities', this.user.settings.language, this.resources.i18n);
        }
        return '';
      }
      if (termObj['@type'] === 'DatatypeProperty') {
        return StringUtil.getUiPhraseByLang('Literals', this.user.settings.language, this.resources.i18n);
      } if (termObj['@type'] === 'ObjectProperty') {
        return StringUtil.getUiPhraseByLang('Entities', this.user.settings.language, this.resources.i18n);
      }
      return '';
    },
    getEmptyFieldValue(key, prop) {
      let value = [];
      const contextValue = VocabUtil.getContextValue(key, '@type', this.resources.context);
      if (
        prop['@type'] === 'DatatypeProperty'
        && prop.hasOwnProperty('range')
        && prop.range.some((e) => e['@id'] === 'http://www.w3.org/2001/XMLSchema#boolean')
      ) {
        // Boolean
        value = true;
      } else if (prop['@type'] === 'DatatypeProperty' || contextValue === '@vocab') {
        // String value (first as array and as single item)
        if (VocabUtil.propIsRepeatable(key, this.resources.context)) {
          value = [''];
        } else {
          value = '';
        }
      } else if (VocabUtil.propIsRepeatable(key, this.resources.context)) {
        // Object value (first as array and as single item)
        value = [];
      } else {
        value = null;
      }
      return value;
    },
    addField(prop, close) {
      if (!prop.added) {
        const key = StringUtil.convertToPrefix(prop.item['@id'], this.resources.context);
        this.$store.dispatch('updateInspectorData', {
          changeList: [
            {
              path: `${this.path}.${key}`,
              value: this.getEmptyFieldValue(key, prop.item),
            },
          ],
          addToHistory: true,
        });
        this.$store.dispatch('setInspectorStatusValue', {
          property: 'lastAdded',
          value: `${this.path}.${key}`,
        });
        if (close) {
          this.hide();
        }
      }
      this.$parent.$emit('expand-item', true);
    },
    show() {
      this.$store.dispatch('pushInspectorEvent', {
        name: 'form-control',
        value: 'close-modals',
      })
        .then(() => {
          this.$nextTick(() => {
            this.active = true;
            this.$nextTick(() => {
            // this.$store.dispatch('setStatusValue', {
            //   property: 'keybindState',
            //   value: 'field-adder'
            // });
              if (this.$refs.input) {
                this.$refs.input.focus();
              }
            });
          });
        });
    },
    expand() {
      this.$parent.$emit('expand-item', true);
    },
    hide() {
      if (!this.active) return;
      this.active = false;
      this.filterKey = '';
      // this.$store.dispatch('setStatusValue', {
      //  property: 'keybindState',
      //  value: 'overview'
      // });
    },
  },
  watch: {
    forceActive(newVal, oldVal) {
      if (newVal !== oldVal) {
        this.show();
      }
    },
    'inspector.event'(val) {
      if (val.name === 'form-control') {
        switch (val.value) {
          case 'close-modals':
            this.hide();
            break;
          case 'focus-changed':
            //if (!this.inToolbar) {
              this.hide();
            //}
            break;
          default:
        }
      }
    },
    active(val) {
      if (!val) {
        this.$refs.adderButton.focus();
      }
    },
  },
  mounted() {
    this.$nextTick(() => {
      // TODO: Fix proper scroll tracking. This is just an ugly solution using document.onscroll here and window.scroll in editorcontrols.vue
    });
  },
  components: {
    'panel-component': PanelComponent,
    'round-button': RoundButton,
  },
};
</script>

<template>
  <div class="FieldAdder">
    <span
      v-if="inner"
      class="FieldAdder-innerAdd"
      role="button"
      tabindex="0"
      ref="adderButton"
      :aria-label="translatePhrase(modalTitle)"
      @click="show(), expand()"
      @keyup.enter="show"
      v-tooltip.top="modalTitle"
      @mouseenter="actionHighlight(true, $event)"
      @mouseleave="actionHighlight(false, $event)"
      @focus="actionHighlight(true, $event)"
      @blur="actionHighlight(false, $event)"
    >
      <i
        class="FieldAdder-innerIcon fa fa-plus-circle fa-fw icon icon--sm" />
      <span class="action-label">{{ translatePhrase("Add field") }}</span>
    </span>

    <button
      v-if="!inner"
      class="FieldAdder-add btn btn-default toolbar-button"
      v-on:click="show"
      ref="adderButton"
      @keyup.enter="show"
      v-tooltip.left="`${translatePhrase(modalTitle)} (${getKeybindText('open-field-adder')})`"
      :aria-label="translatePhrase(modalTitle)">
      <i class="FieldAdder-icon fa fa-plus plus-icon" aria-hidden="true" />
      <span v-if="!inToolbar" class="FieldAdder-label"> {{ translatePhrase("Add field") }}</span>
    </button>
    <portal to="sidebar" v-if="active">
      <panel-component
        class="FieldAdder-panel FieldAdderPanel"
        v-if="active"
        :title="modalTitle"
        @close="hide">
        <template #panel-header-extra>
          <div class="FieldAdderPanel-filterContainer form-group">
            <input
              id="field-adder-input"
              type="text"
              ref="input"
              class="FieldAdderPanel-filterInput customInput mousetrap"
              autocomplete="off"
              :placeholder="translatePhrase('Filter by')"
              :aria-label="translatePhrase('Filter by')"
              v-model="filterKey">
          </div>
          <div class="FieldAdderPanel-filterInfo uppercaseHeading">
            <span>
              {{ translatePhrase("Showing") }}
              {{ filteredResults.length }}
              {{ translatePhrase("of") }}
              {{allowed ? allowed.length : '0'}}
              {{ translatePhrase("total") }}
            </span>
          </div>
        </template>
        <template #panel-header-after>
          <div class="FieldAdderPanel-columnHeaders">
            <!-- <span class="FieldAdderPanel-addControl">
          </span> -->
            <span class="FieldAdderPanel-fieldLabel uppercaseHeading">
              {{ translatePhrase("Field label") }}
            </span>
            <span class="uppercaseHeading">
              {{ translatePhrase("Can contain") }}
            </span>
          </div>
        </template>
        <template #panel-body>
          <div>
            <ul class="FieldAdderPanel-fieldList js-fieldlist">
              <li
                class="FieldAdderPanel-fieldItem PanelComponent-listItem"
                v-bind:class="{ 'is-added': prop.added, available: !prop.added }"
                v-for="(prop) in filteredResults"
                @click="addField(prop, false)"
                @keyup.enter="addField(prop, false)"
                :key="prop['@id']">
                <span class="FieldAdderPanel-addControl">
                  <round-button
                    :tabindex="prop.added ? -1 : 0"
                    :icon="prop.added ? 'check' : 'plus'"
                    :indicator="true"
                    :disabled="prop.added"
                    :label="prop.added ? 'Added' : 'Add'" />
                </span>
                <span class="FieldAdderPanel-fieldLabel" :title="capitalize(prop.label)">
                  {{ capitalize(prop.label) }}
                  <span class="typeLabel">{{ removeDomain(prop.item['@id']) }}</span>
                </span>
                <span class="FieldAdderPanel-classInfo">
                  {{ getPropClassInfo(prop.item) }}
                </span>
              </li>
            </ul>
          </div>
          <div v-if="filteredResults.length === 0" class="PanelComponent-searchStatus">
            <span>{{ translatePhrase("Did not find any fields") }}...</span>
          </div>
        </template>
      </panel-component>
    </portal>
  </div>
</template>

<style lang="less">

.FieldAdder {
  &-innerAdd {
    .action-label {
      display: none;
    }
  }
  &-add {
    font-size: 14px;
    font-size: 1.4rem;

    .FieldAdder--inToolbar & {
      border-radius: 100%;
      font-size: 22px;
      font-size: 2.2rem;
      width: 50px;
      height: 50px;
      line-height: 1;
    }
  }

  &--inToolbar {
    display: inline-block;
    position: relative;
  }
}

.FieldAdderPanel {
  &-filterContainer {
    min-height: 40px;
    flex: 1;
  }

  &-filterInfo {
    color: @grey-darker;
    margin-bottom: 10px;
  }

  &-body {
    display: flex;
    flex-direction: column;
  }

  &-columnHeaders {
    display: flex;
    background-color: @white;
    width: 100%;
    padding: 5px 15px;
    border-bottom: 1px solid @grey-lighter;

    & .FieldAdderPanel-fieldLabel {
      padding-left: 0;
    }
  }

  &-fieldLabel {
  display: inline-block;
  flex-basis: 75%;
  padding: 0 15px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  .typeLabel {
    display: block;
    font-size: 14px;
    font-size: 1.4rem;
    font-family: monospace;
    font-weight: normal;
  }
}

  &-classInfo {
    display: inline-block;
    flex-basis: 25%;
    font-size: 14px;
    font-size: 1.4rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &-addControl {
    display: flex;
    align-items: center;
  }

  &-fieldList {
    width: 100%;
    padding: 0;
    margin: 0;
    list-style-type: none;
  }

  &-fieldItem {
    font-size: 16px;
    font-size: 1.6rem;

    &.available {
      cursor: pointer;
    }
  }
}
</style>
