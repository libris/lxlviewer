<script>
import AutoSize from 'autosize';
import { isArray, debounce, cloneDeep, get } from 'lodash-es';
import { mapGetters } from 'vuex';
import * as StringUtil from 'lxljs/string';
import ItemMixin from '@/components/mixins/item-mixin';
import LensMixin from '@/components/mixins/lens-mixin';
import * as httpUtil from "../../utils/http";

export default {
  name: 'item-value',
  mixins: [ItemMixin, LensMixin],
  props: {
    fieldValue: {
      type: [String, Number],
      default: '',
    },
    isUriType: {
      type: Boolean,
      default: false,
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
    isTransliterable: {
      type: Boolean,
      default: true,
    },
  },
  watch: {
    isLocked(val) {
      if (!val) {
        this.initializeTextarea();
      }
    },
    isExpanded(val) {
      if (val) {
        this.initializeTextarea();
      }
    },
  },
  data() {
    return {
      inEdit: false,
      removeHover: false,
    };
  },
  computed: {
    ...mapGetters([
      'user',
      'resources',
    ]),
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
    shouldLink() {
      return this.isUriType && this.fieldValue.startsWith('http');
    },
    newWindowText() {
      return StringUtil.getUiPhraseByLang('Opens in new window', this.user.settings.language, this.resources.i18n);
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
    langCodes() {
      //  First need to get available language codes
      //  We can mock this to start with
      //  get these via find API later (id.kb.se yadayada find?type=LanguageForm&_limit=2000)
      return ['uk', 'kk'];
    },
  },
  methods: {
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
      if (newValue !== oldValue) {
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
    isEmpty() {
      return false;
    },
    addFocus() {
      this.$refs.textarea.focus({ preventScroll: true }); // Prevent scroll as we will handle this ourselves
    },
    async requestTransliteration(sourceObj) {
      let trans;
      trans = httpUtil.post({
        url: `${this.settings.apiPath}/_transliterate`,
        token: this.user.token
      }, sourceObj)
        .then((result) => {
          console.log('result', result);
          return result;
        });
      return trans;
    },
    async transliterate() {
      const lastIndex = this.path.lastIndexOf('.')
      const lastProperty = this.parentPath.slice(lastIndex + 1);
      const parentsParent = this.parentPath.slice(0, lastIndex);
      let parentsParentValue = get(this.inspector.data, parentsParent);
      console.log('parentsParentValue', JSON.stringify(parentsParentValue));
      const byLangified = lastProperty.concat('ByLang');
      const langCode = "uk";
      const source = this.value[0];
      let result = await this.requestTransliteration({"langTag": langCode, "source": source});

      console.log(JSON.stringify({langCode, source}));
      parentsParentValue[byLangified] =  Object.assign({"uk": this.value[0]}, result);

      await this.$store.dispatch('updateInspectorData', {
        changeList: [
          {
            path: parentsParent,
            value: parentsParentValue,
          },
        ],
        addToHistory: true,
      })
    },
  },
  components: {
  },
  mounted() {
    this.$nextTick(() => {
      if (!this.isLocked) {
        this.highLightLastAdded();
        this.initializeTextarea();
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
  <div class="ItemValue js-value" 
    v-bind:class="{
    'is-locked': isLocked,
    'unlocked': !isLocked,
    'is-removed': removed,
    'is-diff-removed': diffRemoved && !diffAdded,
    'is-diff-added': diffAdded && !diffRemoved,
    'is-diff-modified': diffModified }"
    :id="`formPath-${path}`">
    <textarea class="ItemValue-input js-itemValueInput" 
      rows="1" 
      v-model="value"
      :aria-label="fieldKey | labelByLang"
      @focus="readyForSave(false)"
      @blur="update($event.target.value)"
      @keydown.exact="readyForSave(false)"
      @keydown.enter.prevent="handleEnter"
      v-if="!isLocked"
      ref="textarea"></textarea>

    <div class="ItemValue-transItems" v-show="isTransliterable">
      <i class="fa fa-language fa-fw action-button icon icon--sm ItemValue-transIcon"
         tabindex="0"
         role="button"
         :aria-label="'Romanize' | translatePhrase"
         v-on:click="transliterate"
         v-tooltip.top="translate('Romanize')"
         @keyup.enter="transliterate">
      </i>
      <span class="ItemValue-langLabel"
            tabindex="0"
            role="button"
            v-tooltip.top="translate('Byt språk för romanisering från: ukrainska')">
            {{ langCodes[0] }}
          </span>
    </div>

    <span class="ItemValue-text"
      v-if="isLocked && !shouldLink">{{fieldValue}}</span>
    <a class="ItemValue-text"
      v-if="isLocked && shouldLink"
      :href="fieldValue | convertResourceLink" 
      target="_blank" 
      :title="`${fieldValue} (${newWindowText})`">
        {{fieldValue}} 
        <i class="fa fa-external-link" aria-hidden="true"></i>
    </a>
    <div class="ItemValue-remover"
      v-show="!isLocked && isRemovable"
      role="button"
      :aria-label="'Remove' | translatePhrase"
      v-on:click="removeThis()"
      v-tooltip.top="translate('Remove')"
      @focus="removeHover = true, removeHighlight($event, true)"
      @blur="removeHover = false, removeHighlight($event, false)"
      @mouseover="removeHover = true, removeHighlight($event, true)"
      @mouseout="removeHover = false, removeHighlight($event, false)">
      <i class="fa fa-trash-o icon icon--sm">
      </i>
    </div>
    <span class="ItemLocal-history-icon" v-if="diffRemoved && !diffAdded">
      <i class="fa fa-trash-o icon--sm icon-removed"></i>
    </span>
    <span class="ItemLocal-history-icon" v-if="diffAdded && !diffRemoved">
      <i class="fa fa-plus-circle icon--sm icon-added"></i>
    </span>
  </div>
</template>

<style lang="less">

.ItemValue {
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

  &.is-removed {
    transition: all 0.5s ease;
    max-height: 0px;
    margin: 0px;
    border: none;
    overflow: hidden;
  }

  &.is-diff-removed {
    @base-color: @remove;
    border: 1px dashed;
    border-color: @base-color;
    background-color: @form-remove;
    margin-bottom: 2px;
  }

  &.is-diff-added {
    @base-color: @form-add;
    border: 1px solid;
    border-color: @brand-primary;
    background-color: @base-color;
    margin-bottom: 2px
  }

  &.is-diff-modified {
    //$kb-primary-orange
    @base-color: rgb(247, 160, 123);
    border: 1px dashed;
    border-color: @base-color;
    background-color: hsl(hue(@base-color), 80%, 90%);
    margin-bottom: 2px;
  }

  &-history-icon {
    padding: 0px 10px;
    margin-left: auto;
    margin-right: 0;
    display: block;
  }

  &-remover {
    font-size: 16px;
    font-size: 1.6rem;
    float: right;
    display: inline-block;
    cursor: pointer;
    color: @grey;
    min-width: 20px;
    margin-left: 5px;


    &:hover {
      color: @black;
    }
  }

  &.is-removeable {
    background-color: @form-remove;
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

  &-langLabel {
    color: @text-brand-env;
    font-weight: bold;
    float: right;
    //position: relative;
    font-size: 0.8em;
    padding: 0.5rem 0.5rem 0.5rem 0;
  }

  &-transIcon {
    //position: relative;
    //top: 0.9rem;
    padding: 0.7rem 0.5rem 0.5rem 0;
  }

  &-transItems {
    display: flex;
    flex-direction: row;
    margin-left: 0.5rem;
  }
}
</style>
