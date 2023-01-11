<script>
import {mapGetters} from 'vuex';
import PreviewCard from '@/components/shared/preview-card';
import LanguageMixin from '@/components/mixins/language-mixin';
import EntityAdder from './entity-adder';

export default {
  name: 'language-entry',
  mixins: [LanguageMixin],
  props: {
    tag: {
      type: String,
      default: '',
    },
    val: {
      type: String,
      default: '',
    },
    isRomanizable: {
      type: Boolean,
      default: false,
    },
    isLocked: {
      type: Boolean,
      default: true,
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
  },
  computed: {
    ...mapGetters([
      'inspector',
      'settings',
      'resources',
    ]),
    isLinked() {
      return this.data !== null;
    },
    routerPath() {
      const uriParts = this.recordId.split('/');
      const fnurgel = uriParts[uriParts.length - 1];
      return `/${fnurgel}`;
    },
  },
  components: {
    PreviewCard,
    'entity-adder': EntityAdder,
  },
  methods: {
    onLangTaggerEvent(langTag) {
      this.$emit('addLangTag', langTag);
    },
  }
};
</script>

<template>
  <div>
  <div class="LanguageEntry-inputcontainer" v-if="!isLocked">
    <span class="LanguageEntry-key">
      <textarea class="LanguageEntry-input js-itemValueInput"
        rows="1"
        v-bind:value="val"
        v-on:input="$emit('input', $event.target.value)">
      </textarea>
    </span>
    <span class="LanguageEntry-value">
      <span class="LanguageEntry-pill" v-if="tag !== 'none'">
  <v-popover v-if="this.isLinked" class="LanguageEntry-popover" placement="bottom-start"
    @show="$refs.previewCard.populateData()">
    <span class="LanguageEntry-pill-label LanguageEntry-pill-link">
      <router-link :to="routerPath">{{ this.label }}</router-link>
    </span>
    <template slot="popover">
      <PreviewCard ref="previewCard" :focus-data="data" :record-id="this.recordId"/>
    </template>
  </v-popover>
  <span class="LanguageEntry-pill-removeButton">
    <i class="fa fa-times-circle icon icon--sm chip-icon"
      v-if="removeIsAllowed"
      role="button"
      tabindex="0"
      @click="$emit('remove')"
      @keyup.enter="$emit('remove')"
      :aria-label="'Remove' | translatePhrase"
      v-tooltip.top="translate('Remove')">
    </i>
    <i class="fa fa-times-circle icon icon--sm chip-icon is-disabled" v-if="!removeIsAllowed"></i>
  </span>
  <span v-if="!this.isLinked" class="LanguageEntry-pill-label">
    {{ this.label }}
  </span>
  </span>
      <span class="LanguageEntry-actions">
        <i class="fa fa-language icon icon--sm LanguageEntry-transIcon"
           tabindex="0"
           role="button"
           :aria-label="'Romanize' | translatePhrase"
           v-on:click="$emit('romanize')"
           v-if="!isTransSchema(tag) && tag !== 'none'"
           v-tooltip.top="translate('Romanize')"
           @keyup.enter="$emit('romanize')">
        </i>
        <i class="fa fa-language icon icon--sm LanguageEntry-transIcon is-disabled"
           v-if="isTransSchema(tag) && tag !== 'none'">
        </i>
         <entity-adder class="LanguageEntry-action Field-entityAdder"
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
                       :icon-add="'fa-globe'"
                       @langTaggerEvent="onLangTaggerEvent(...arguments)">
        </entity-adder>
        <span class="LanguageEntry-remover"
              tabindex="0"
              role="button"
              :aria-label="'Remove' | translatePhrase"
              v-on:click="$emit('removeval')"
              @keyup.enter="$emit('removeval')"
              v-tooltip.top="translate('Remove')">
          <i class="fa fa-trash-o icon icon--sm"></i>
        </span>
      </span>

    </span>
  </div>
  <div v-if="isLocked">
    <div class="LanguageEntry-textcontainer">
      <div class="LanguageEntry-key">
        <div class="LanguageEntry-text">
          {{ val }}
        </div>
      </div>
      <span class="LanguageEntry-tags">
         <span class="LanguageEntry-pill" v-if="tag !== 'none'">
  <v-popover v-if="this.isLinked" class="LanguageEntry-popover" placement="bottom-start"
             @show="$refs.previewCard.populateData()">
    <span class="LanguageEntry-pill-label LanguageEntry-pill-link">
      <router-link :to="routerPath">{{ this.label }}</router-link>
    </span>
    <template slot="popover">
      <PreviewCard ref="previewCard" :focus-data="data" :record-id="this.recordId"/>
    </template>
  </v-popover>
  <span v-if="!this.isLinked" class="LanguageEntry-pill-label">
    {{ this.label }}
  </span>
  </span>
        </span>
    </div>
  </div>
  </div>
</template>

<style lang="less">
.LanguageEntry{
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
    grid-template-columns: 3fr 1fr;
    grid-template-rows: auto;
    grid-template-areas:
    "key tags";
    width: 100%;
    margin-top: 7px;
    margin-bottom: 7px;
  }

  &-text {
    word-break: break-word;
    position: relative;
  }

  &-tags {
    grid-area: tags;
    justify-self: end;
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

    &-label {
      font-weight: 600;
      cursor: default;
      white-space: nowrap;
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
}
</style>
