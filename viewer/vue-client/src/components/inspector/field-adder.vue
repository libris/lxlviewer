<script>
/*
  Controls add new field button and add field modal with it's content
*/

import { mixin as clickaway } from 'vue-clickaway';
import * as _ from 'lodash';
import * as LayoutUtil from '@/utils/layout';
import * as StringUtil from '@/utils/string';
import * as VocabUtil from '@/utils/vocab';
import ComboKeys from 'combokeys';
import PanelComponent from '@/components/shared/panel-component.vue';
import RoundButton from '@/components/shared/round-button.vue';
import { mapGetters } from 'vuex';
import ToolTipComponent from '../shared/tooltip-component';

export default {
  mixins: [clickaway],
  name: 'field-adder',
  props: {
    allowed: {
      type: Array,
      default: () => [],
    },
    inner: false,
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
    inToolbar: false,
    forceActive: false
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
      const title = StringUtil.getUiPhraseByLang('Add field in', this.settings.language);
      const contextString = StringUtil.getLabelByLang(
        this.entityType, 
        this.settings.language, 
        this.resources.vocab, 
        this.resources.context,
      );
      return `${title}: ${contextString}`;
    },
    filteredResults() {
      const lang = this.settings.language;
      if (!this.allowed || this.allowed.length === 0) {
        return [];
      }
      if (!this.filterKey || this.filterKey.length < 1) {
        if (this.allowed) {
          return this.allowed;
        }
      }
      const fKey = this.filterKey.toLowerCase();
      const filtered = _.filter(this.allowed, (o) => {
        let labelByLang = '';
        if (
          typeof o.item.labelByLang !== 'undefined'
          && typeof o.item.labelByLang[lang] !== 'undefined'
        ) {
          if (_.isArray(o.item.labelByLang[lang])) {
            labelByLang = o.item.labelByLang[lang][0];
          } else {
            labelByLang = o.item.labelByLang[lang];
          }
        } else if (
          typeof o.item.prefLabelByLang !== 'undefined'
          && typeof o.item.prefLabelByLang[lang] !== 'undefined'
        ) {
          if (_.isArray(o.item.prefLabelByLang[lang])) {
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
      if (_.isArray(termObj['@type'])) {
        if (termObj['@type'].indexOf('DatatypeProperty') > -1 && termObj['@type'].indexOf('DatatypeProperty') > -1) {
          return StringUtil.getUiPhraseByLang('Literals and entities', this.settings.language);
        } if (termObj['@type'].indexOf('DatatypeProperty') > -1) {
          return StringUtil.getUiPhraseByLang('Literals', this.settings.language);
        } else if (termObj['@type'].indexOf('ObjectProperty') > -1) {
          return StringUtil.getUiPhraseByLang('Entities', this.settings.language);
        } else {
          return '';
        }
      } else {
        if (termObj['@type'] === 'DatatypeProperty') {
          return StringUtil.getUiPhraseByLang('Literals', this.settings.language);
        } else if (termObj['@type'] === 'ObjectProperty') {
          return StringUtil.getUiPhraseByLang('Entities', this.settings.language);
        }
      }
    },
    getEmptyFieldValue(key, prop) {
      let value = [];
      const contextValue = VocabUtil.getContextValue(key, '@type', this.resources.context);
      if (
        prop['@type'] === 'DatatypeProperty'
        && prop.hasOwnProperty('range')
        && prop.range.some(e => e['@id'] === 'http://www.w3.org/2001/XMLSchema#boolean')
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
      } else {
        // Object value (first as array and as single item)
        if (VocabUtil.propIsRepeatable(key, this.resources.context)) {
          value = [];
        } else {
          value = null;
        }
      }
      return value;
    },
    addField(prop, close) {  
      if (!prop.added) {
        const splitProp = prop.item['@id'].split('/');
        const propLastPart = splitProp[splitProp.length - 1];
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
    forceActive: function (newVal, oldVal) {
      if (newVal != oldVal) {
        this.show();
      }
    },
    'inspector.event'(val, oldVal) {
      if (val.name === 'form-control') {
        switch (val.value) { 
          case 'close-modals':
            this.hide();
            break;
          default:
            
        }
      }
    }, 
  },
  mounted() {
    this.$nextTick(() => { // TODO: Fix proper scroll tracking. This is just an ugly solution using document.onscroll here and window.scroll in editorcontrols.vue

    });
  },
  components: {
    'panel-component': PanelComponent,
    'tooltip-component': ToolTipComponent,
    'round-button': RoundButton,
  },
};
</script>

<template>
  <div class="FieldAdder">
    <span v-if="inner" class="FieldAdder-innerAdd">
      <i 
        class="FieldAdder-innerIcon fa fa-plus-circle fa-fw icon icon--sm" 
        tabindex="0"
        ref="adderButton"
        @click="show(), expand()" 
        @keyup.enter="show"
        @mouseenter="showToolTip = true, actionHighlight(true, $event)" 
        @mouseleave="showToolTip = false, actionHighlight(false, $event)"
        @focus="showToolTip = true, actionHighlight(true, $event)"
        @blur="showToolTip = false, actionHighlight(false, $event)">
        <tooltip-component 
          :show-tooltip="showToolTip" 
          :tooltip-text="modalTitle" 
          translation="translatePhrase"></tooltip-component>
      </i>
      <span class="FieldAdder-innerLabel">{{ "Add field" | translatePhrase }}</span>
    </span>

    <button v-if="!inner" class="FieldAdder-add btn btn-default toolbar-button" 
      v-on:click="show" 
      ref="adderButton"
      @keyup.enter="show"
      @mouseenter="showToolTip = true" 
      @mouseleave="showToolTip = false">
      <i class="FieldAdder-icon fa fa-plus plus-icon" aria-hidden="true">
        <tooltip-component 
          class="Toolbar-tooltipContainer"
          :tooltip-text="modalTitle"
          :position="inToolbar ? 'left' : 'top'"
          keybind-name="open-field-adder"
          :show-tooltip="showToolTip"></tooltip-component>
      </i>
      <span v-if="!inToolbar" class="FieldAdder-label"> {{ "Add field" | translatePhrase }}</span>
    </button>
    <portal to="sidebar" v-if="active">
    <panel-component class="FieldAdder-panel FieldAdderPanel"
      v-if="active"
      :title="modalTitle"
      @close="hide">
      <template slot="panel-header-extra">
        <div class="FieldAdderPanel-filterContainer form-group panel">
          <input id="field-adder-input"
            type="text" 
            ref="input"
            class="FieldAdderPanel-filterInput customInput form-control mousetrap" 
            :placeholder="'Filter by' | translatePhrase"
            v-model="filterKey">
        </div>
        <div class="FieldAdderPanel-filterInfo uppercaseHeading">
          <span>
            {{ "Showing" | translatePhrase }} 
            {{ filteredResults.length }} 
            {{ "of" | translatePhrase }} 
            {{allowed ? allowed.length : '0'}} 
            {{ "total" | translatePhrase }}
          </span>
        </div>
      </template>
      <template slot="panel-header-after">
        <div class="FieldAdderPanel-columnHeaders">
          <!-- <span class="FieldAdderPanel-addControl">
          </span> -->
          <span class="FieldAdderPanel-fieldLabel uppercaseHeading">
            {{ "Field label" | translatePhrase }}
          </span>
          <span class="FieldAdderPanel-classInfo uppercaseHeading">
            {{ "Can contain" | translatePhrase }}
          </span>
        </div>
      </template>
      <template slot="panel-body">
        <div>
          <ul class="FieldAdderPanel-fieldList js-fieldlist">
            <li
              class="FieldAdderPanel-fieldItem PanelComponent-listItem"
              v-bind:class="{ 'is-added': prop.added, 'available': !prop.added }" 
              v-for="(prop) in filteredResults" 
              @click="addField(prop, false)"
              @keyup.enter="addField(prop, false)" 
              :key="prop['@id']">
              <span class="FieldAdderPanel-addControl">
                <round-button
                  :tabindex="prop.added ? -1 : 0"
                  :icon="prop.added ? 'check' : 'plus'"
                  :indicator="true"
                  :disabled="prop.added"/>
              </span>
              <span class="FieldAdderPanel-fieldLabel" :title="prop.label | capitalize">
                {{prop.label | capitalize }}
                <span class="typeLabel">{{ prop.item['@id'] | removeDomain }}</span>
              </span>
              <span class="FieldAdderPanel-classInfo">
                {{ getPropClassInfo(prop.item) }}
              </span>
            </li>
          </ul>
        </div>
        <div v-if="filteredResults.length === 0" class="PanelComponent-searchStatus">
          <span>{{ "Did not find any fields" | translatePhrase }}...</span>
        </div>
      </template>
    </panel-component>
    </portal>
  </div>
</template>

<style lang="less">

.FieldAdder {
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

  &-innerLabel {
    display: none;
  }
  
  &-innerIcon {
  }
}

.FieldAdderPanel {
  &-filterContainer {
    min-height: 40px;
    flex: 1;
  }

  &-filterInput {
  }

  &-filterInfo {
    color: @gray;
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
    border-bottom: 1px solid @gray-lighter;

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
