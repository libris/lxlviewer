<script>
import { translatePhrase } from '@/utils/filters';
import { mapActions, mapState } from 'pinia';
import { useResourcesStore } from '@/stores/resources';
import { useUserStore } from '@/stores/user';
import { isArray, debounce, cloneDeep, get } from 'lodash-es';
import * as StringUtil from 'lxljs/string';
import { XSD_NUMERIC_TYPES } from 'lxljs/vocab';
import ItemMixin from '@/components/mixins/item-mixin.vue';
import LensMixin from '@/components/mixins/lens-mixin.vue';
import ModalComponent from '@/components/shared/modal-component.vue';
import { useInspectorStore } from '@/stores/inspector';

export default {
  name: 'item-next-shelf-control-number',
  mixins: [ItemMixin, LensMixin],
  props: {
    fieldValue: {
      type: [String, Number],
      default: '',
    },
    isLocked: {
      type: Boolean,
      default: false,
    },
    isRemovable: {
      type: Boolean,
      default: false,
    },
    showActionButtons: {
      type: Boolean,
      default: false,
    },
    isExpanded: {
      type: Boolean,
      default: false,
    },
    range: {
      type: Array,
      default: () => [],
    },
  },

  data() {
    return {
      inEdit: false,
      removeHover: false,
      unlockedByUser: false,
      unlockModalOpen: false,
    };
  },

  computed: {
    ...mapState(useResourcesStore, ['i18n']),
    ...mapState(useUserStore, ['user']),
    value: {
      get() {
        if (this.fieldValue === null) {
          return [];
        }
        let valueArray = this.fieldValue;
        if (!isArray(this.fieldValue)) {
          valueArray = [this.fieldValue];
        }
        return valueArray;
      },
      set: debounce(function debounceUpdate(newValue) {
        this.update(newValue);
      }, 1000),
    },
    newWindowText() {
      return StringUtil.getUiPhraseByLang('Opens in new window', this.user.settings.language, this.i18n);
    },
    shouldFocus() {
      const lastAdded = this.inspector.status.lastAdded;
      if (lastAdded === this.path || lastAdded === this.parentPath) {
        return true;
      }
      return false;
    },
    isLastAdded() {
      if (this.inspector.status.lastAdded === this.path) {
        return true;
      }
      return false;
    },
    // Handling multiple ranges doesn't actually really make sense...
    min() {
      return Math.min(...this.range.map(r => XSD_NUMERIC_TYPES[r]).map(t => (t.min ? t.min : NaN)));
    },
    max() {
      return Math.max(...this.range.map(r => XSD_NUMERIC_TYPES[r]).map(t => (t.max ? t.max : NaN)));
    },
    isDecimal() {
      return this.range.map(r => XSD_NUMERIC_TYPES[r]).some(t => (t.decimal));
    },
    isDisabled() {
      return this.unlockedByUser === false;
    },
  },

  methods: {
    translatePhrase,
    ...mapActions(useInspectorStore, ['updateInspectorData', 'setInspectorStatusValue']),
    removeHighlight(event, active) {
      if (active) {
        let item = event.target;
        while ((item = item.parentElement) && !item.classList.contains('js-value'));
        item.classList.add('is-removeable');
      } else {
        let item = event.target;
        while ((item = item.parentElement) && !item.classList.contains('js-value'));
        item.classList.remove('is-removeable');
      }
    },
    handleEnter(e) {
      e.target.blur();
      return false;
    },
    readyForSave(value) {
      this.setInspectorStatusValue({ property: 'readyForSave', value: value });
    },
    update(newValue) {
      const oldValue = cloneDeep(get(this.inspector.data, this.path));

      this.readyForSave(true);
      if (newValue !== oldValue && !this.isLocked) {
        this.updateInspectorData({
          changeList: [
            {
              path: this.path,
              value: newValue,
            },
          ],
          addToHistory: true,
        });
      }
    },
    highLightLastAdded() {
      if (this.isLastAdded === true) {
        const element = this.$el;
        element.classList.add('is-lastAdded');
        setTimeout(() => {
          element.classList.remove('is-lastAdded');
          if (this.isLastAdded) {
            this.setInspectorStatusValue({ property: 'lastAdded', value: '' });
          }
        }, 1000);
      }
    },
    isEmpty() {
      return false;
    },
    addFocus() {
      this.$refs.textarea.focus({ preventScroll: true }); // Prevent scroll as we will handle this ourselves
    },
    unlockEdit() {
      this.unlockedByUser = true;
      this.closeUnlockModal();
    },
    openUnlockModal() {
      this.unlockModalOpen = true;
      setTimeout(() => {
        this.$refs.unlockButton.focus();
      }, 200);
    },
    closeUnlockModal() {
      this.unlockModalOpen = false;
    },
  },

  components: {
    'modal-component': ModalComponent,
  },

  mounted() {
    this.$nextTick(() => {
      if (!this.isLocked) {
        this.highLightLastAdded();
        if (!this.status.isNew && this.shouldFocus) {
          this.addFocus();
        }
      }
      return false;
    });
  },
};
</script>

<template>
  <div
    class="ItemValue js-value" 
    v-bind:class="{'is-locked': isLocked, 'unlocked': !isLocked, 'is-removed': removed}"
    :id="`formPath-${path}`"
  >
    <input
      class="ItemValue-input js-itemValueInput"
      rows="1"
      v-model="value"
      :aria-label="fieldKey | labelByLang"
      @focus="readyForSave(false)"
      @blur="update($event.target.value)"
      @keydown.exact="readyForSave(false)"
      @keydown.enter.prevent="handleEnter"
      v-if="!isLocked"
      type="number"
      :min="min"
      :max="max"
      :step="isDecimal ? 0.01 : 1"
      :disabled="isDisabled"
      ref="textarea"
    />

    <span class="ItemValue-text" v-if="isLocked">{{fieldValue}}</span>

    <div class="ItemType-actions">
      <div
        class="ItemType-action UnlockAction"
        v-if="!isLocked && isDisabled"
      >
        <font-awesome-icon :icon="['fas', 'lock']"
          role="button"
          size="sm"
          tabindex="0"
          aria-label="Unlock"
          v-tooltip.top="translate('Click to unlock editing')"
          @keyup.enter="openUnlockModal()"
          @click="openUnlockModal()"
        />
      </div>
    </div>

    <div
      class="ItemValue-remover"
      v-show="!isLocked && isRemovable"
      role="button"
      :aria-label="translate('Remove')"
      v-on:click="removeThis()"
      v-tooltip.top="translate('Remove')"
      @focus="removeHover = true, removeHighlight($event, true)"
      @blur="removeHover = false, removeHighlight($event, false)"
      @mouseover="removeHover = true, removeHighlight($event, true)"
      @mouseout="removeHover = false, removeHighlight($event, false)"
    >
      <font-awesome-icon :icon="['fas', 'trash-can']" size="sm" />
    </div>

    <modal-component
      title="Byte av löpnummer"
      modal-type="warning"
      class="ChangeTypeWarningModal"
      :width="'570px'"
      @close="closeUnlockModal()"
      v-if="unlockModalOpen"
    >
      <template #modal-body>
        <div class="ChangeTypeWarningModal-body">
          <p>
            Observera att byte av löpnummer kan påverka övrigt bestånd i signumsviten. Är du säker på att du vill fortsätta?
          </p>

          <div class="ChangeTypeWarningModal-buttonContainer">
            <button class="btn btn-hollow btn--auto btn--md" @click="closeUnlockModal()">
              {{ translatePhrase('Cancel') }}
            </button>

            <button class="btn btn-warning btn--md" ref="unlockButton" @click="unlockEdit()">
              <font-awesome-icon :icon="['fas', 'unlock-keyhole']" class="icon icon--white" />
              {{ translatePhrase('Unlock') }}
            </button>
          </div>
        </div>
      </template>
    </modal-component>

  </div>
</template>

<style lang="scss" scoped>
.ItemType-actions {
  display: flex;
  align-items: center;
  flex: 0;

  .UnlockAction {
    margin-left: .5rem;
  }
}
</style>
