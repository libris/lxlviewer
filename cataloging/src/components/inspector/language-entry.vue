<script>
import AutoSize from 'autosize';
import { mapGetters } from 'vuex';
import { Menu } from 'floating-vue';
import { isEqual } from 'lodash-es';
import * as VocabUtil from 'lxljs/vocab';
import { translatePhrase } from '@/utils/filters';
import { formatDate } from '@/utils/datetime';
import PreviewCard from '@/components/shared/preview-card.vue';
import LanguageMixin from '@/components/mixins/language-mixin.vue';
import EntityAdder from './entity-adder.vue';

export default {
  name: 'language-entry',
  mixins: [LanguageMixin],
  props: {
    tag: {
      type: String,
      default: '',
    },
    modelValue: {
      type: String,
      default: '',
    },
    id: {
      Number,
    },
    isLocked: {
      type: Boolean,
      default: true,
    },
    isFirstField: {
      type: Boolean,
      default: false,
    },
    removeIsAllowed: {
      type: Boolean,
      default: false,
    },
    uri: {
      type: String,
      default: '',
    },
    label: {
      type: String,
      default: '',
    },
    data: {
      type: Object,
      default: null,
    },
    recordId: {
      type: String,
      default: '',
    },
    diff: {
      type: Object,
      default: null,
    },
    itemPath: {
      type: String,
      default: '',
    },
    isExpanded: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    ...mapGetters([
      'inspector',
      'settings',
      'resources',
      'supportedTags',
      'status',
      'user',
    ]),
    isByLang() {
      return this.itemPath.includes('ByLang');
    },
    index() {
      return this.id.substring(this.id.indexOf('-') + 1, this.id.length);
    },
    exactPath() {
      if (this.isByLang) { // This is a map in the data
        return `${this.itemPath}.${this.tag}`;
      }
      return `${this.itemPath}[${this.index}]`;
    },
    isLinked() {
      return this.data !== null;
    },
    routerPath() {
      const uriParts = this.recordId.split('/');
      const fnurgel = uriParts[uriParts.length - 1];
      return `/${fnurgel}`;
    },
    diffRemoved() {
      if (this.diff == null) return false;
      return this.diff.removed.some((p) => isEqual(p, this.exactPath));
    },
    diffAdded() {
      if (this.diff == null) return false;
      return this.diff.added.some((p) => isEqual(p, this.exactPath));
    },
    diffModified() {
      if (this.diff == null) return false;
      return this.diff.modified.some((p) => isEqual(p, this.exactPath));
    },
    shouldFocus() {
      const lastAdded = this.inspector.status.lastAdded;
      if (lastAdded === this.exactPath
        || lastAdded === this.itemPath
        || (this.isFirstField && this.itemPath.startsWith(lastAdded))
      ) {
        return true;
      }
      return false;
    },
    isLastAdded() {
      if (this.inspector.status.lastAdded === this.exactPath) {
        return true;
      }
      return false;
    },
    templateText() {
      // comment template for CXZ messages
      if (this.itemPath === 'mainEntity.comment' && VocabUtil.isSubClassOf(
        this.inspector.data.mainEntity['@type'],
        'AdministrativeAction',
        this.resources.vocab,
        this.resources.context,
      )) {
        return `${formatDate(new Date())} ${this.user.settings.activeSigel}: `;
      } return false;
    },
  },
  components: {
    Menu,
    PreviewCard,
    'entity-adder': EntityAdder,
  },
  watch: {
    isLocked(modelValue) {
      if (!modelValue) {
        this.initializeTextarea();
      }
    },
    isExpanded(modelValue) {
      if (modelValue) {
        this.initializeTextarea();
      }
    },
  },
  emits: ['add-lang-tag', 'romanize', 'add-to-cache', 'update', 'remove', 'removeval', 'update:model-value'],
  methods: {
    translatePhrase,
    onLangTaggerEvent(langTag) {
      this.$emit('addLangTag', langTag);
    },
    initializeTextarea() {
      this.$nextTick(() => {
        const textarea = this.$refs.textarea;
        if (this.templateText && !this.modelValue) {
          this.$emit('update:model-value', this.templateText);
        }
        AutoSize(textarea);
        AutoSize.update(textarea);
      });
    },
    addFocus() {
      this.$refs.textarea.focus({ preventScroll: true }); // Prevent scroll as we will handle this ourselves
    },
    highLightLastAdded() {
      if (this.isLastAdded === true) {
        const element = this.$el;
        // FIXME: the highlighting is not visible
        element.classList.add('is-lastAdded');
        setTimeout(() => {
          element.classList.remove('is-lastAdded');
          if (this.isLastAdded) {
            this.$store.dispatch('setInspectorStatusValue', { property: 'lastAdded', value: '' });
          }
        }, 1000);
      }
    },
  },
  mounted() {
    if (this.tag !== 'none') {
      this.$emit('addToCache');

      if (!this.supportedTags.includes(this.tag)) {
        this.$store.dispatch('getIsTagRomanizable', this.tag);
      }
    }

    this.$nextTick(() => {
      if (!this.isLocked) {
        this.highLightLastAdded();
        this.initializeTextarea();
        if (!this.status.isNew && this.shouldFocus) {
          this.addFocus();
        }
      }
    });
  },
};
</script>

<template>
  <div>
    <div class="LanguageEntry-inputcontainer" v-if="!isLocked">
      <span class="LanguageEntry-key">
        <textarea
          class="LanguageEntry-input js-itemValueInput"
          rows="1"
          v-bind:value="modelValue"
          v-on:input="$emit('update:model-value', $event.target.value)"
          @blur="$emit('update')"
          ref="textarea"
        />
      </span>
      <span class="LanguageEntry-value">
        <span class="LanguageEntry-pill" v-if="tag !== 'none'">
          <Menu
            v-if="this.isLinked"
            class="LanguageEntry-popover"
            placement="bottom-start"
            :delay="{ show: 200, hide: 0 }"
            :popperHideTriggers="['hover']"
            @apply-show="$refs.previewCard.populateData()"
          >
            <span class="LanguageEntry-pill-label LanguageEntry-pill-link">
              <router-link :to="routerPath">{{ this.label }}</router-link>
            </span>
            <template #popper>
              <PreviewCard ref="previewCard" :focus-data="data" :record-id="this.recordId" />
            </template>
          </Menu>

          <span class="LanguageEntry-pill-removeButton">
            <i
              class="fa fa-times-circle icon icon--sm chip-icon"
              v-if="removeIsAllowed"
              role="button"
              tabindex="0"
              @click="$emit('remove')"
              @keyup.enter="$emit('remove')"
              :aria-label="translatePhrase('Remove')"
              v-tooltip.top="translatePhrase('Remove')" />
            <i class="fa fa-times-circle icon icon--sm chip-icon is-disabled" v-if="!removeIsAllowed" />
          </span>

          <span v-if="!this.isLinked" class="LanguageEntry-pill-label">
            {{ this.label }}
          </span>
        </span>

        <span class="LanguageEntry-actions">
          <i
            class="fa fa-language icon icon--sm LanguageEntry-transIcon"
            tabindex="0"
            role="button"
            :aria-label="translatePhrase('Romanize')"
            v-on:click="$emit('romanize')"
            v-if="isTransSchema(tag) && tag !== 'none'"
            v-tooltip.top="translatePhrase('Romanize')"
            @keyup.enter="$emit('romanize')" />

          <i
            class="fa fa-language icon icon--sm LanguageEntry-transIcon is-disabled"
            v-if="!isTransSchema(tag) && tag !== 'none'" />

          <entity-adder
            class="LanguageEntry-action Field-entityAdder"
            ref="entityAdder"
            v-if="tag === 'none'"
            :field-key="fieldKey"
            :path="path"
            :allow-local="false"
            :all-search-types="['Language']"
            :range="['Language']"
            :range-full="['Language']"
            :property-types="['ObjectProperty']"
            :is-lang-tagger="true"
            :icon-add="'fa-globe-outline'"
            @langTaggerEvent="onLangTaggerEvent" />

          <span
            class="LanguageEntry-remover"
            tabindex="0"
            role="button"
            :aria-label="translatePhrase('Remove')"
            v-on:click="$emit('removeval')"
            @keyup.enter="$emit('removeval')"
            v-tooltip.top="translatePhrase('Remove')">
            <i class="fa fa-trash-o icon icon--sm" />
          </span>
        </span>
      </span>
    </div>

    <div
      v-if="isLocked"
      v-bind:class="{
        'LanguageEntry-is-diff-removed': diffRemoved && !diffAdded,
        'LanguageEntry-is-diff-added': diffAdded && !diffRemoved,
        'LanguageEntry-is-diff-modified': diffModified,
      }">
      <div class="LanguageEntry-textcontainer">
        <div class="LanguageEntry-key">
          <div class="LanguageEntry-text">
            {{ modelValue }}
          </div>
        </div>

        <span class="LanguageEntry-tags">
          <span class="LanguageEntry-pill" v-if="tag !== 'none'">
            <Menu
              v-if="this.isLinked"
              class="LanguageEntry-popover"
              placement="bottom-start"
              :delay="{ show: 200, hide: 0 }"
              :popperHideTriggers="['hover']"
              @apply-show="$refs.previewCard.populateData()">
              <span class="LanguageEntry-pill-label LanguageEntry-pill-link">
                <router-link :to="routerPath">{{ this.label }}</router-link>
              </span>

              <template #popper>
                <PreviewCard ref="previewCard" :focus-data="data" :record-id="this.recordId" />
              </template>
            </Menu>

            <span v-if="!this.isLinked" class="LanguageEntry-pill-label">
              {{ this.label }}
            </span>
          </span>

          <span class="LanguageEntry-tags-history-icon" v-if="diffRemoved && !diffAdded">
            <i class="fa fa-trash-o icon--sm icon-removed" />
          </span>

          <span class="LanguageEntry-tags-history-icon" v-if="diffAdded && !diffRemoved">
            <i class="fa fa-plus-circle icon--sm icon-added" />
          </span>
        </span>
      </div>
    </div>
  </div>
</template>

<style lang="less">
.LanguageEntry {
  &-inputcontainer {
    display: grid;
    justify-items: start;
    align-items: center;
    column-gap: 5px;
    grid-template-columns: 1fr auto;
    grid-template-rows: auto;
    grid-template-areas:
    "key value";
    border: 1px solid @grey-light;
    border-radius: 2px;
    width: 100%;
    margin-top: 7px;
    margin-bottom: 7px;
    background: white;
    &:focus-within {
      border: 1px solid @grey-dark;
    }
  }

  &-textcontainer {
    display: grid;
    justify-items: start;
    align-items: center;
    column-gap: 5px;
    grid-template-columns: 1fr auto;
    grid-template-rows: auto;
    grid-template-areas:
    "key tags";
    width: 100%;
    margin-top: 7px;
    margin-bottom: 7px;
  }

  &-is-diff-added {
    @base-color: @form-add;
    border: 1px solid;
    border-radius: 4px;
    padding: 0px 5px 0 5px;
    border-color: @brand-primary;
    background-color: @base-color;
    margin-bottom: 3px;
  }

  &-is-diff-removed {
    @base-color: @remove;
    border: 1px dashed;
    border-radius: 4px;
    padding: 0px 5px 0 5px;
    border-color: @base-color;
    background-color: @form-remove;
    margin-bottom: 3px;
  }

  &-is-diff-modified {
    @base-color: @brand-primary-orange;
    border: 1px dashed;
    border-radius: 4px;
    padding: 0px 5px 0 5px;
    border-color: @base-color;
    background-color: @form-modified;
    margin-bottom: 3px;
  }

  &-text {
    position: relative;
  }

  &-tags {
    grid-area: tags;
    justify-self: end;
    justify-items: start;
    width: 100%;
    align-items: center;
    display: grid;
    grid-template-columns: 1fr auto;
    overflow: hidden;

    grid-template-areas:
    "pill history";

    &-history-icon {
      padding: 0 4px 0 2px;
      grid-area: history;
    }
  }

  &-key {
    place-self: center stretch;
    grid-area: key;
  }

  &-value {
    grid-area: value;
    display: grid;
    justify-self: end;
    column-gap: 5px;
    grid-template-columns: 1fr auto;
    grid-template-rows: auto;
    align-items: center;
    grid-template-areas:
    "pill actions";
  }

  &-input {
    display: block;
    border: none;
    resize: none;
    transition: border .25s ease-out;
    width: 100%;
    padding: 2px 10px;
  }

  &-pill {
    display: grid;
    justify-items: start;
    align-items: center;
    grid-area: pill;
    grid-template-columns: 1fr auto;
    grid-template-areas:
    "label remove";
    border-radius: 2em;
    min-width: 20px;
    height: 22px;
    color: #196f25;
    background-color: #D9EBDC;
    font-size: 13px;
    overflow: hidden;

    &-label {
      font-weight: 600;
      cursor: default;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      grid-area: label;
      padding: 0 8px 0 8px
    }

    &-link {
      a:link {
        color: #196f25;
      }
      a:visited {
        color: #196f25;
      }
      cursor: pointer;
    }

    &-removeButton {
      width: 1.2em;
      height: 1.2em;
      line-height: 1.2em;
      grid-area: remove;
      padding-right: 20px;
    }
  }

  &-actions {
    grid-area: actions;
    align-items: center;
    column-gap: 5px;
    display: grid;
    grid-template-areas:
    "action remover";
    margin-right: 1rem;

    &-action {
      grid-area: action;
      margin-left: 1rem;
    }
    &-remover {
      grid-area: remover;
      margin-left: 1rem;
    }
  }
  &-transIcon {
    grid-area: action;
    margin-left: 0.5rem;
    margin-right: 0.5rem;
  }
  &-popover > .trigger {
    max-width: 100%;
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
