<script>
import {cloneDeep, get} from 'lodash-es';
import AutoSize from 'autosize';
import ItemMixin from '@/components/mixins/item-mixin';
import LanguageMixin from '@/components/mixins/language-mixin';

export default {
  name: 'item-bylang.vue',
  mixins: [ItemMixin, LanguageMixin],
  props: {
    fieldValue: {},
    isLocked: {
      type: Boolean,
      default: true,
    },
    byLangify: {
      type: Boolean,
      default: false,
    }
  },
  data() {
    return {
      entries: [],
    };
},
  watch: {
    isLocked(val) {
      if (!val) {
        this.initializeTextarea();
      }
    },
  },
  mounted() {
    this.$nextTick(() => {
        if (!this.isLocked) {
          this.initializeTextarea();
        }
      this.restructureData();
    });
  },
  methods: {
    readyForSave(value) {
      this.$store.dispatch('setInspectorStatusValue', { property: 'readyForSave', value: value });
    },
    handleEnter(e) {
      e.target.blur();
      return false;
    },
    update(newValue) {
      console.log('newValue', newValue);
      const oldValue = cloneDeep(get(this.inspector.data, this.path));

      this.readyForSave(true);
      if (newValue !== oldValue) {
        console.log('newValue != oldvalue:', newValue)
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
    initializeTextarea() {
      this.$nextTick(() => {
        const textarea = this.$refs.textarea;
        AutoSize(textarea);
        AutoSize.update(textarea);
      });
    },
    restructureData() {
      const restructured = [];
      Object.entries(this.fieldValue).forEach(([key, value]) => {
        restructured.push({ tag: key, val: value });
      });
      this.entries = restructured;
    },
  },
};
</script>

<template>
  <div class="ItemBylang">
     <span class="ItemBylang-list">
      <div v-for="entry in entries">
        <div class="ItemBylang-keyvalue">
          <textarea class="ItemBylang-input js-itemValueInput"
                    rows="1"
                    v-model="entry.val"
                    v-if="!isLocked"
                    ref="textarea">
          </textarea>
          <i class="fa fa-language fa-fw action-button icon icon--sm ItemBylang-transIcon"
             tabindex="0"
             role="button"
             :aria-label="'Romanize' | translatePhrase"
             v-on:click="transliterate(entry.val)"
             v-if="!isTransSchema(entry.tag)"
             v-tooltip.top="translate('Romanize')"
             @keyup.enter="transliterate(entry.val)">
      </i>
          <span class="ItemBylang-langLabel"> {{ entry.tag }}</span>
          </div>
      </div>
    </span>
  </div>
</template>

<style lang="less">
.ItemBylang {
  display: flex;
  flex: 1;
  position: relative;
  width: 100%;
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
    margin-bottom: 7px;

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

  &-keyvalue {
    display: flex;
    flex-direction: row;
  }

  &-transItems {
     display: flex;
     flex-direction: row;
     margin-left: 0.5rem;
   }

  &-list {
    position: relative;
    width: 100%;
  }
  &-row {
    display: flex;
    flex-direction: row;
  }

  &-transIcon {
    margin-left: 0.5rem;
    padding: 0.7rem 0.5rem 0.5rem 0;
  }

  &-langLabel {
    color: @text-brand-env;
    font-weight: bold;
    float: right;
    font-size: 0.8em;
    padding: 0.5rem 0.5rem 0.5rem 0.5rem;
  }
}
</style>
