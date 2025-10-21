<script>
import { each, uniq, sortBy } from 'lodash-es';
import { mapGetters } from 'vuex';
import * as VocabUtil from 'lxljs/vocab';
import * as StringUtil from 'lxljs/string';
import { labelByLang } from '@/utils/filters';
import ItemMixin from '../mixins/item-mixin.vue';

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
    asDropdown: {
      type: Boolean,
      default: true,
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
      this.possibleValues = this.getPossibleValues();
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

      console.log('field value', this.fieldValue)
    },
    selected(value, oldValue) {
      if (value !== oldValue && this.initialized && !this.isLocked) {
        console.log('old value', oldValue)
        console.log('value', value)
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
    labelByLang,
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
      
      console.log('VÄRDEN,', possibleValues)

      console.log('recoursceececessss,',this.resources)

      return sortBy(possibleValues, (value) => StringUtil.getLabelByLang(
        value,
        this.user.settings.language,
        this.resources,
      ));
    },
    setTooltipComment(value) {
      const termObject = VocabUtil.getTermObject(value, this.resources.vocab, this.resources.context);

      if (termObject && termObject.commentByLang) {
        if (termObject.commentByLang[this.settings.language]) {
          return termObject.commentByLang[this.settings.language];
        }
        return termObject.commentByLang[0];
      }

      return '';
    },
  },
  components: {

  },
};
</script>

<template>
  <div
    class="ItemVocab"
    :id="`formPath-${path}`"
    v-bind:class="{
      'is-locked': isLocked, 'is-unlocked': !isLocked, 'distinguish-removal': removeHover, removed: removed,
    }">
    <div v-if="!isLocked && possibleValues.length > 0">
      <!-- render as dropdown -->
      <select
        v-if="asDropdown"
        v-model="selected"
        class="ItemVocab-select customSelect"
        :aria-label="labelByLang(fieldKey)">
        <option
          v-for="option in possibleValues"
          :key="option"
          v-bind:value="option">{{ labelByLang(option) }}</option>
      </select>
      <!-- render as radiobuttons -->
      <fieldset v-else>
        <div
          v-for="option in possibleValues"
          :key="option"
          v-tooltip.top="setTooltipComment(option)"
          class="RadioPill">
          <input
            v-model="selected"
            v-bind:value="option"
            v-bind:id="option"
            class="RadioPill-input"
            type="radio"
            name="radios">
          <label
            v-bind:for="option"
            class="RadioPill-label">
            <i class="fa fa-check icon icon--sm" />
            {{ labelByLang(option) }}</label>
        </div>
      </fieldset>

    </div>

    <span
      class="ItemVocab-text"
      v-if="isLocked">{{ labelByLang(fieldValue) }}</span>
  </div>
</template>

<style lang="less">

.ItemVocab {
  &.is-locked {
    line-height: 2;
  }

  &-text {
    word-break: break-word;
  }

  &-select {
    width: 100%;
    margin-top: 0.2em;
    border: 1px solid @grey-light;
    background-color: @white;
  }
}

.RadioPill {
  display: inline-block;
  position: relative;
  margin: 2px 5px 5px 0px;

  &-input {
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    background: none;
    cursor: pointer;
    border: 2px solid;
    height: 100%;
    left: 0;
    opacity: .00001;
    position: absolute;
    top: 0;
    width: 100%;
    z-index: 2;
  }

  &-label {
    display: block;
    height: 33px;
    background-color: @grey-lightest;
    border: 1px solid transparent;
    color: @grey-dark;
    border-radius: 2em;
    line-height: 1.6;
    padding: 3px 14px;
    margin: 0;
    font-weight: 400;

    .icon {
      display: none;
    }
  }

  &-input:hover + &-label {
    color: @black;
  }

  &-input:checked + &-label {
    background: @brand-primary;
    color: @grey-lightest;

    .icon {
      display: inline-block;
      color: @grey-lightest !important;
    }
  }

  .user-is-tabbing &-input:focus + label {
    outline: 2px solid #8cc9c9;
    outline: auto darkcyan;
  }
}

</style>
