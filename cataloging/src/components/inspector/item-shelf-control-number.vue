<script>
import AutoSize from 'autosize';
import { debounce, cloneDeep, get } from 'lodash-es';
import { mapGetters } from 'vuex';
import { labelByLang, translatePhrase } from '@/utils/filters';
import ItemMixin from '@/components/mixins/item-mixin.vue';

export default {
  name: 'item-shelf-control-number',
  mixins: [ItemMixin],
  props: {
    fieldValue: {
      type: [String, Number],
      default: '',
    },
    isLocked: {
      type: Boolean,
      default: false,
    },
    isExpanded: {
      type: Boolean,
      default: false,
    },
  },
  watch: {
    isLocked(val) {
      if (!val) {
        this.initializeTextarea();
        this.initializeForEditing();
      }
    },
    isExpanded(val) {
      if (val) {
        this.initializeTextarea();
      }
    },
    fieldValue() {
      this.initializeForEditing();
    },
    mode() {
      this.update(this.value);
    },
    hasAutomaticCounter(val) {
      // if we get linked to another counter we should switch mode to 'generate'
      if (!val) {
        this.shelfMarkUnlinkedAtLeastOnce = true;
      }
      if (val && this.shelfMarkUnlinkedAtLeastOnce) {
        this.mode = 'generate';
      }
    },
  },
  data() {
    return {
      inEdit: false,
      removeHover: false,
      manualValue: '',
      mode: undefined,
      shelfMarkUnlinkedAtLeastOnce: false,
    };
  },
  computed: {
    ...mapGetters([
      'user',
    ]),
    value() {
      return this.mode === 'generate' ? '' : this.textFieldValue;
    },
    textFieldValue: {
      get() {
        return this.mode === 'generate' || !this.fieldValue ? this.manualValue : this.fieldValue;
      },
      set: debounce(function debounceUpdate(newValue) {
        this.manualValue = newValue;
        this.update(newValue);
      }, 1000),
    },
    hasAutomaticCounter() {
      return this.$store.state.inspector.magicShelfMarks.includes(this.actualParentPath);
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
  },
  methods: {
    translatePhrase,
    labelByLang,
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
      this.$store.dispatch('setInspectorStatusValue', { property: 'readyForSave', value: value });
    },
    update(newValue) {
      const oldValue = cloneDeep(get(this.inspector.data, this.path));

      this.readyForSave(true);
      if (newValue !== oldValue && !this.isLocked) {
        this.$store.dispatch('updateInspectorData', {
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
            this.$store.dispatch('setInspectorStatusValue', { property: 'lastAdded', value: '' });
          }
        }, 1000);
      }
    },
    initializeTextarea() {
      this.$nextTick(() => {
        const textarea = this.$refs.textarea;
        AutoSize(textarea);
        AutoSize.update(textarea);
      });
    },
    initializeForEditing() {
      if (this.fieldValue) {
        this.mode = 'manual';
        this.manualValue = this.fieldValue;
      } else {
        this.mode = 'generate';
      }
    },
    isEmpty() {
      return false;
    },
    addFocus() {
      this.$refs.textarea.focus({ preventScroll: true }); // Prevent scroll as we will handle this ourselves
    },
  },
  components: {
  },
  mounted() {
    this.$nextTick(() => {
      if (!this.isLocked) {
        this.highLightLastAdded();
        this.initializeTextarea();
        this.initializeForEditing();
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
    class="ItemShelfControlNumber js-value"
    v-bind:class="{ 'is-locked': isLocked, unlocked: !isLocked }"
    :id="`formPath-${path}`">
    <div v-if="!isLocked">
      <fieldset v-if="hasAutomaticCounter">
        <label class="ItemShelfControlNumber-label">
          <input type="radio" value="generate" v-model="mode">
          {{ translatePhrase("Generate control number when item is saved") }}
        </label>
        <br>
        <label class="ItemShelfControlNumber-label">
          <input type="radio" value="manual" v-model="mode">
          {{ translatePhrase("Enter manual control number") }}
        </label>
      </fieldset>
      <textarea
        class="ItemShelfControlNumber-input js-itemValueInput"
        rows="1"
        v-model="textFieldValue"
        :aria-label="labelByLang(fieldKey)"
        @focus="readyForSave(false)"
        @blur="update($event.target.value)"
        @keydown.exact="readyForSave(false)"
        @keydown.enter.prevent="handleEnter"
        :disabled="hasAutomaticCounter && mode === 'generate'"
        ref="textarea" />
    </div>
    <span
      class="ItemShelfControlNumber-text"
      v-if="isLocked">{{fieldValue}}</span>
  </div>
</template>

<style lang="less">

.ItemShelfControlNumber {
  display: flex;
  flex: 1;
  flex-shrink: 0;
  margin-left: -5px;
  padding: 5px;
  border-radius: 4px;
  transition: background-color 0.2s ease;

  &-input {
    width: 100%;
    display: block;
    border: 1px solid @grey-light;
    border-radius: 2px;
    padding: 2px 10px;
    resize: none;
    transition: border .25s ease-out;

    &:focus {
      border: 1px solid @grey-dark;
    }
  }

  &-text {
    word-break: break-word;
    position: relative;
  }

  &-label {
    font-weight: normal;
  }

  &.is-lastAdded {
    background-color: @form-add;
    -webkit-animation-duration: 1s;
    animation-duration: 1s;
    -webkit-animation-fill-mode: both;
    animation-fill-mode: both;
    -webkit-animation-name: pulse;
    animation-name: pulse;
  }
}

</style>
