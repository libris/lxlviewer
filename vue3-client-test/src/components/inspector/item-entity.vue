<script>
import { translatePhrase, convertResourceLink } from '@/utils/filters';
import { size } from 'lodash-es';
import { mapActions, mapState } from 'pinia';
import { useInspectorStore } from '@/stores/inspector';
import { useStatusStore } from '@/stores/status';
import { useSettingsStore } from '@/stores/settings';
import * as VocabUtil from 'lxljs/vocab';
import { hasAutomaticShelfControlNumber } from '@/utils/shelfmark';
import * as LayoutUtil from '@/utils/layout';
import { Dropdown } from 'floating-vue';
import ItemMixin from '@/components/mixins/item-mixin.vue';
import LensMixin from '@/components/mixins/lens-mixin.vue';
import PreviewCard from '@/components/shared/preview-card.vue';
import ReverseRelations from '@/components/inspector/reverse-relations.vue';

export default {
  name: 'item-entity',
  mixins: [ItemMixin, LensMixin],
  props: {
    item: {},
    isLocked: {
      type: Boolean,
      default: false,
    },
    isCard: {
      type: Boolean,
      default: false,
    },
    isExpanded: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      inEdit: false,
      searchResult: {},
      searchDelay: 2,
      formObj: {},
      expanded: false,
      removeHover: false,
      animateNewlyAdded: false,
    };
  },
  computed: {
    ...mapState(useInspectorStore, ['inspector']),
    ...mapState(useStatusStore, ['panelOpen']),
    ...mapState(useSettingsStore, ['settings']),
    isNewlyAdded() {
      if (this.inspector.status.lastAdded === this.fullPath) {
        return true;
      }
      return false;
    },
    isMarc() {
      if (this.item.hasOwnProperty('@type') && this.item['@type'].startsWith('marc:')) {
        return true;
      }
      if (this.item['@id'].includes('/marc/')) {
        return true;
      }
      return false;
    },
    fullPath() {
      return `${this.parentPath}.{"@id":"${this.item['@id']}"}`;
    },
    isMaybeMagicShelfMark() {
      return this.focusData['@type'] === 'ShelfMarkSequence';
    },
    recordType() {
      return VocabUtil.getRecordType(
        this.focusData['@type'],
        this.resources.vocab,
        this.resources.context,
      );
    },
    isCardWithData() {
      return this.isCard && this.focusData && Object.keys(this.focusData).length > 1;
    },
  },
  watch: {
    'inspector.event'(val) {
      this.$emit(`${val.value}`);
    },
    'panelOpen'(val) {
      if (this.isNewlyAdded && !val) {
        this.$refs.chip.focus();
        this.setInspectorStatusValue({ property: 'lastAdded', value: '' });
      }
    },
  },
  methods: {
    translatePhrase, convertResourceLink,
    ...mapActions(useInspectorStore, ['setInspectorStatusValue', 'addMagicShelfMark', 'removeMagicShelfMark']),
    expand() {
      this.expanded = true;
    },
    collapse() {
      this.expanded = false;
    },
    toggleExpanded() {
      if (this.expanded === true) {
        this.collapse();
      } else {
        this.expand();
      }
    },
    size(obj) {
      return size(obj);
    },
    isPretty(key, value) {
      return (this.isObject(value) || key === '@id');
    },
    addFocus() {
      this.focused = true;
    },
    removeFocus() {
      this.focused = false;
    },
    isHistoryView() {
      return this.diff != null;
    },
  },
  components: {
    Dropdown,
    PreviewCard,
    ReverseRelations,
    ReverseRelations,
  },
  created() {
    // this.$on('collapse-item', () => {
    //   this.collapse();
    // });
    // this.$on('expand-item', () => {
    //   this.expand();
    // });
    if (this.settings.defaultExpandedProperties.includes(this.fieldKey)) {
      this.expand();
    }
  },
  mounted() {
    this.$nextTick(() => {
      if (this.isMaybeMagicShelfMark) {
        hasAutomaticShelfControlNumber(this.item['@id']).then((hasAutomatic) => {
          if (hasAutomatic) {
            this.addMagicShelfMark(this.actualParentPath);
          }
        }).catch(error => console.error(error));
      }
      if (this.isExpanded && !this.isHistoryView()) {
        this.expand();
      }
      if (this.isNewlyAdded) {
        setTimeout(() => {
          const element = this.$el;
          LayoutUtil.ensureInViewport(element).then(() => {
            this.animateNewlyAdded = true;
            setTimeout(() => {
              this.animateNewlyAdded = false;
            }, 1000);
          });
        }, 200);
      }
    });
  },
  beforeUnmount() {
    if (this.isMaybeMagicShelfMark) {
      this.removeMagicShelfMark(this.actualParentPath);
    }
  },
};
</script>

<template>
  <div
    class="ItemEntity-container"
    :class="{ 'is-expanded': expanded, 'is-card': isCardWithData }"
  >
    <div
      v-if="isCardWithData"
      class="ItemEntity-expander"
      tabindex="0"
      @click="toggleExpanded()"
      @keyup.enter="toggleExpanded()"
    >
      <i class="ItemEntity-arrow fa fa-chevron-right"></i>
    </div>

    <div
      :id="`formPath-${path}`"
      class="ItemEntity-content"
      v-show="!isCardWithData || !expanded"
    >
      <Dropdown class="ItemEntity-popover" placement="bottom-start" :triggers="['hover', 'focus']">
        <div
          class="ItemEntity chip" 
          tabindex="0"
          ref="chip"
          v-if="!isCardWithData || !expanded"
          :class="{
            'is-locked': isLocked,
           'is-marc': isMarc,
           'is-newlyAdded': animateNewlyAdded,
           'is-removeable': removeHover,
           'is-cache': recordType === 'CacheRecord',
           'is-placeholder': recordType === 'PlaceholderRecord',
           'is-ext-link': !isLibrisResource,
           'is-removed': diffRemoved,
           'is-added': diffAdded,
          }"
        >
          <span class="ItemEntity-history-icon" v-if="diffRemoved">
            <i class="fa fa-trash-o icon--sm icon-removed"></i>
          </span>
          <span class="ItemEntity-history-icon" v-if="diffAdded">
            <i class="fa fa-plus-circle icon--sm icon-added"></i>
          </span>
          <span class="ItemEntity-label chip-label">
            <span v-if="(!isCardWithData || !expanded) && isLibrisResource"><router-link :to="routerPath">{{getItemLabel}}</router-link></span>
            <span v-if="(!isCardWithData || !expanded) && !isLibrisResource"><a :href="convertResourceLink(item['@id'])">{{getItemLabel}} <span class="fa fa-arrow-circle-right"></span></a></span>
            <span class="placeholder"></span>
          </span>
          <div class="ItemEntity-removeButton chip-removeButton" v-if="!isLocked">
            <i class="fa fa-times-circle icon icon--sm chip-icon" 
              v-if="!isLocked"
              role="button"
              tabindex="0"
              :aria-label="translatePhrase('Remove')"
              v-tooltip.top="translatePhrase('Remove')"
              @click="removeThis(true)"
              @keyup.enter="removeThis(true)">
            </i>
          </div>
        </div>

        <template #popper>
          <PreviewCard :focus-data="focusData" :record-id="recordId" />
        </template>
      </Dropdown> 
    </div>

    <div class="ItemEntity-content ItemEntity-cardContainer" v-if="isCardWithData && expanded">
      <entity-summary
        :focus-data="focusData" 
        :exclude-properties="excludeProperties"
        :should-link="true"
        :should-open-tab="true"
        :show-all-keys="true"
        :embedded-in-field="true"
      />

      <div class="ItemEntity-reverseRelationsContainer" v-if="recordType === 'Instance'">
        <ReverseRelations
          :main-entity="focusData"
          :mode="'items'"
          :force-load="true"
          :compact="false"
        />
      </div>
    </div>
  </div>
</template>

<style lang="scss">

$linked-color: #daefec;

.ItemEntity {

  &-container {
    display: flex;
    position: relative;
    width: 100%;

    &.is-expanded >
    .ItemEntity-expander >
    .ItemEntity-arrow {
      transform: rotate(90deg);
      transform-origin: center;
    }
  }

  &-cardContainer {
    display: flex;
    flex-direction: column;
    width: 100%;

    border-radius: 4px;
    padding: 0.5em 1em 0.5em 1em;
    margin: 0.6rem 0 0.6rem 0.6rem;
    border: 1px solid $grey-lighter;
    box-shadow: 0 2px 5px rgba(0,0,0,.08);
  }
/*
  &-cardContainer:last-child {
    border-bottom: none;
  }
*/
  &-reverseRelationsContainer {
    display: flex;
    flex-direction: row-reverse;
    width: 100%;
  }
  
  &-expander {
    cursor: pointer;
    padding: 0.3em 0 0 0;
    flex: 0 0 22px;
  }

  &-content {
    flex: 0 1 auto;
    min-width: 0; //prevent flex overflow
  }

  &-history-icon {
    padding: 0 4px 0 2px;
  }

  &-popover > .trigger {
    max-width: 100%;
  }

  &-arrow {
    transition: all 0.2s ease;
    padding: 0 2px;
    font-size: 14px;
    color: $grey-darker-transparent;

    .ItemEntity-expander:hover & {
      color: $black;
    }
  }

  &.is-newlyAdded {
    background-color: $form-add;
    -webkit-animation-duration: 1s;
    animation-duration: 1s;
    -webkit-animation-fill-mode: both;
    animation-fill-mode: both;
    -webkit-animation-name: pulse;
    animation-name: pulse;
  }

  &.is-removed {
    $base-color: $remove;
    border: 1px dashed;
    border-color: $base-color;
    background-color: $form-remove;
  }

  &.is-added {
    $base-color: $form-add;
    background-color: $base-color;
  }

  &-removeButton {
  }

  &.expanded {
    margin: 0 0 2em 0;
  }

  &.is-locked {
    padding: 3px 0.5em 3px 0.5em;
  }
  
  a {
    color: $white;
    &:hover {
      text-decoration: none;
    }
  }
  &-label {
    cursor: pointer;
    a {
      color: $link-color;
      &:hover {
        color: $link-color;
      }
    }
  }
  
  @media print {
    border: 1px solid;
  }
}

.chip {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  height: 33px;
  background-color: $chip-background;
  border: 1px solid $chip-color;
  color: $chip-color;
  border-radius: 2em;
  line-height: 1.6;
  padding: 3px 5px 3px 10px;
  margin: 2px 5px 5px 0px;
  transition: .3s ease, background-color 0.3s ease;
  max-width: 100%;

  &-label {
    font-weight: 600;
    cursor: default;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &-removeButton {
    display: inline-block;
    position: relative;
    top: 3px;
    width: 1.2em;
    height: 1.2em;
    line-height: 1.2em;
    text-align: center;
    margin: 0 5px;
  }

  &.is-cache {
    border-color: $chip-color-cache;
    color: $chip-color-cache;
    a {
      color: $chip-color-cache;
      &:hover {
        //color: $link-color;
      }
    }
  }

  &.is-placeholder {
    border-color: $chip-color-placeholder;
    color: $chip-color-placeholder;
    a {
      color: $chip-color-placeholder;
      &:hover {
        //color: @link-color;
      }
    }
  }

  &.is-external {
    border: 1px solid #29A1A2;
  }
  
  @include media-breakpoint-down(sm) {
    max-width: 100%;
  }
}

.type-icon {
  margin-left: 0.2em;
  margin-right: 0.1em;
}

</style>
