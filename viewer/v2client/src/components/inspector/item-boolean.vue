<script>
import * as _ from 'lodash';
import * as VocabUtil from '../../utils/vocab';
import * as DataUtil from '../../utils/data';
import * as StringUtil from '../../utils/string';
import ProcessedLabel from '../shared/processedlabel';
import TooltipComponent from '../shared/tooltip-component';
import ItemMixin from '../mixins/item-mixin';
import LensMixin from '../mixins/lens-mixin';
import { mapGetters } from 'vuex';

export default {
  name: 'item-boolean',
  mixins: [ItemMixin],
  props: {
    fieldValue: '',
    fieldKey: '',
    index: Number,
    isLocked: false,
    expanded: false,
    entityType: '',
  },
  data() {
    return {
      inEdit: false,
      showCardInfo: false,
      searchResult: {},
      searchDelay: 2,
      removeHover: false,
      selected: '',
      disableDataSync: false, // Used to prevent data sync when setting state from code
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
      const types = VocabUtil.getFullRange(
        this.entityType,
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
    });
  },
  watch: {
    fieldValue(value, oldValue) {
      if (value !== this.selected) {
        this.selected = this.fieldValue;
      }
    },
    selected(value, oldValue) {
      if (value !== oldValue) {
        this.$store.dispatch('updateInspectorData', {
          changeList: [
            {
              path: this.path,
              value: value,
            }
          ],
          addToHistory: true,
        });
      }
    },
  },
  methods: {
  },
  components: {
    'processed-label': ProcessedLabel,
    'tooltip-component': TooltipComponent,
  },
};
</script>

<template>
  <div class="ItemBoolean" v-bind:class="{'is-locked': isLocked, 'is-unlocked': !isLocked, 'distinguish-removal': removeHover, 'removed': removed}">
    <div v-if="!isLocked">
      <input type="checkbox" class="customCheckbox-input" v-model="selected" :disabled="isLocked" />
      <div class="customCheckbox-icon"></div>
    </div>
    <span class="ItemVocab-text" 
      v-if="isLocked">{{fieldValue ? 'Yes' : 'No' | translatePhrase}}</span>
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
