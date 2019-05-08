<script>
import { each, uniq, sortBy } from 'lodash-es';
import { mapGetters } from 'vuex';
import * as VocabUtil from '../../utils/vocab';
import * as StringUtil from '../../utils/string';
import ItemMixin from '../mixins/item-mixin';

export default {
  name: 'item-vocab',
  mixins: [ItemMixin],
  props: {
    fieldValue: {
      type: String,
      default: '',
    },
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
      possibleValues: [],
      selected: '',
      disableDataSync: false, // Used to prevent data sync when setting dropdown selected state from code
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
      this.possibleValues = this.getPossibleValues();
      this.selected = this.fieldValue;
      // this.setInitialValue();
    });
  },
  watch: {
    fieldValue(value) {
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
            },
          ],
          addToHistory: true,
        });
      }
    },
  },
  methods: {
    getPossibleValues() {
      let values = [];
      const possibleValues = [];
      each(this.range, (item) => {
        const type = StringUtil.getCompactUri(item, this.resources.context);
        values = values.concat(VocabUtil.getTermByType(type, this.resources.vocab, this.resources.context, this.settings));
      });
      values = uniq(values);
      each(values, (value) => {
        possibleValues.push(StringUtil.getCompactUri(value['@id'], this.resources.context));
      });
      return sortBy(possibleValues, value => StringUtil.getLabelByLang(
        value, 
        this.settings.language, 
        this.resources.vocab, 
        this.resources.context,
      ));
    },
    setInitialValue() {
      // if (this.possibleValues.indexOf(this.fieldValue) > -1) {
      //   this.selected = this.fieldValue;
      // }
    },
  },
  components: {
  },
};
</script>

<template>
  <div class="ItemVocab" :id="`formPath-${path}`" v-bind:class="{'is-locked': isLocked, 'is-unlocked': !isLocked, 'distinguish-removal': removeHover, 'removed': removed}">
    <div v-if="!isLocked && possibleValues.length > 0">
      <select 
        v-model="selected" 
        class="ItemVocab-select customSelect" 
        :aria-label="fieldKey | labelByLang">
        <option 
          v-for="option in possibleValues" 
          :key="option"
          v-bind:value="option">{{ option | labelByLang }}</option>
      </select>
    </div>
    <span class="ItemVocab-text" 
      v-if="isLocked">{{fieldValue | labelByLang}}</span>
  </div>
</template>

<style lang="less">

.ItemVocab {
  &.is-locked {
    line-height: 2;
    // padding-left: 5px;
  }

  &-text {
    word-break: break-word;
  }

  &-select {
    width: 100%;
    margin-top: 0.2em;
  }
}

</style>
