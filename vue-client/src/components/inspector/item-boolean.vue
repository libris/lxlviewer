<script>
import { mapGetters } from 'vuex';
import * as VocabUtil from 'lxljs/vocab';
import { translatePhrase, labelByLang } from '@/utils/filters';
import ItemMixin from '../mixins/item-mixin.vue';

export default {
  name: 'item-boolean',
  mixins: [ItemMixin],
  props: {
    fieldValue: {
      type: Boolean,
      default: false,
    },
    fieldKey: {
      type: String,
      default: '',
    },
    index: Number,
    isLocked: {
      type: Boolean,
      default: false,
    },
    expanded: {
      type: Boolean,
      default: false,
    },
    entityType: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      inEdit: false,
      showCardInfo: false,
      searchResult: {},
      searchDelay: 2,
      removeHover: false,
      selected: '',
      initialized: false,
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
    range() {
      const types = VocabUtil.getRangeFull(
        this.fieldKey,
        this.resources.vocab,
        this.resources.context,
        this.resources.vocabClasses,
      );
      return types;
    },
  },
  mounted() {
    this.$nextTick(() => {
      this.selected = this.fieldValue;
      this.$nextTick(() => {
        this.initialized = true;
      });
    });
  },
  watch: {
    fieldValue(value) {
      if (value !== this.selected) {
        this.selected = this.fieldValue;
      }
    },
    selected(value, oldValue) {
      if (value !== oldValue && this.initialized) {
        this.$store.dispatch('updateInspectorData', {
          changeList: [
            {
              path: this.path,
              value: value,
            },
          ],
          addToHistory: true,
        });
      }
    },
  },
  methods: {
    translatePhrase,
    labelByLang,
  },
  components: {
  },
};
</script>

<template>
  <div
    class="ItemBoolean"
    v-bind:class="{
      'is-locked': isLocked, 'is-unlocked': !isLocked, 'distinguish-removal': removeHover, removed: removed,
    }">
    <div v-if="!isLocked">
      <input
        type="checkbox"
        class="customCheckbox-input"
        v-model="selected"
        :disabled="isLocked"
        :aria-label="labelByLang(fieldKey)" />
      <div class="customCheckbox-icon" />
    </div>
    <span
      class="ItemVocab-text"
      v-if="isLocked">{{ translatePhrase(fieldValue ? 'Yes' : 'No') }}</span>
  </div>
</template>

<style lang="less">

.ItemBoolean {
  &.is-locked {
    line-height: 2;
  }

  &-text {
    word-break: break-word;
  }
}

</style>
