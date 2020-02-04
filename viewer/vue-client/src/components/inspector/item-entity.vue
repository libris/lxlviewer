<script>
import { size } from 'lodash-es';
import { mapGetters } from 'vuex';
import * as LayoutUtil from '@/utils/layout';
import TooltipComponent from '@/components/shared/tooltip-component';
import ItemMixin from '@/components/mixins/item-mixin';
import LensMixin from '@/components/mixins/lens-mixin';
import PreviewCard from '@/components/shared/preview-card';

export default {
  name: 'item-entity',
  mixins: [ItemMixin, LensMixin],
  props: {
    item: {},
    isLocked: {
      type: Boolean,
      default: false,
    },
    isDistinguished: {
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
    };
  },
  computed: {
    ...mapGetters([
      'settings',
      'user',
      'inspector',
    ]),
    isNewlyAdded() {
      if (this.inspector.status.lastAdded === this.fullPath) {
        return true;
      }
      return false;
    },
    fullPath() {
      return `${this.parentPath}.{"@id":"${this.item['@id']}"}`;
    },
  },
  watch: {
    'inspector.event'(val) {
      this.$emit(`${val.value}`);
    },
  },
  methods: {
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
  },
  components: {
    'tooltip-component': TooltipComponent,
    PreviewCard,
  },
  created() {
    this.$on('collapse-item', () => {
      this.collapse();
    });
    this.$on('expand-item', () => {
      this.expand();
    });
  },
  mounted() {
    this.$nextTick(() => {
      if (this.isNewlyAdded) {
        setTimeout(() => {
          const element = this.$el;
          LayoutUtil.ensureInViewport(element).then(() => {
            setTimeout(() => {
              if (this.isNewlyAdded) {
                this.$store.dispatch('setInspectorStatusValue', { property: 'lastAdded', value: '' });
              }
            }, 1000);
          });
        }, 200);
      }
    });
  },
};
</script>

<template>
  <div 
    class="ItemEntity-container"
    :class="{ 'is-expanded': expanded }">
    <div 
      v-if="isDistinguished"
      class="ItemEntity-expander"
      tabindex="0"
      @click="toggleExpanded()"
      @keyup.enter="toggleExpanded()">
      <i class="ItemEntity-arrow fa fa-chevron-right"></i>
    </div>
    <div
      :id="`formPath-${path}`"
      class="ItemEntity-content"
      v-show="!isDistinguished || !expanded">
      <v-popover class="ItemEntity-popover" placement="bottom-start" @show="$refs.previewCard.populateData()">
        <div class="ItemEntity chip" 
          tabindex="0"
          v-if="!isDistinguished || !expanded" 
          :class="{ 'is-locked': isLocked, 'is-newlyAdded': isNewlyAdded, 'is-removeable': removeHover}">
          <span class="ItemEntity-label chip-label">
            <span v-if="(!isDistinguished || !expanded) && isLibrisResource"><router-link :to="routerPath">{{getItemLabel}}</router-link></span>
            <span v-if="(!isDistinguished || !expanded) && !isLibrisResource"><a :href="item['@id'] | convertResourceLink">{{getItemLabel}}</a></span>
            <span class="placeholder"></span></span>
          <div class="ItemEntity-removeButton chip-removeButton" v-if="!isLocked">
            <i class="fa fa-times-circle icon icon--sm chip-icon" 
              v-if="!isLocked"
              role="button"
              tabindex="0"
              :aria-label="'Remove' | translatePhrase"
              @click="removeThis(true)"
              @keyup.enter="removeThis(true)">

              <tooltip-component 
                :show-tooltip="removeHover" 
                tooltip-text="Remove"></tooltip-component>
            </i>
          </div>
        </div>
        <template slot="popover">
          <PreviewCard ref="previewCard" :focus-data="focusData" :record-id="recordId" />
        </template>
      </v-popover> 
    </div>
    
    <entity-summary 
      v-if="isDistinguished && expanded"
      :focus-data="focusData" 
      :should-link="true"
      :should-open-tab="true"
      :show-all-keys="true"
      :embedded-in-field="true"></entity-summary>
  </div>
</template>

<style lang="less">

@linked-color: #daefec;

.ItemEntity {

  &-container {
    display: flex;
    position: relative;
    width: 100%;

    &.is-expanded > 
    .ItemEntity-expander >
    .ItemEntity-arrow {
      transform:rotate(90deg);
      transform-origin: center;
    }
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

  &-popover > .trigger {
    max-width: 100%;
  }

  &-arrow {
    transition: all 0.2s ease;
    padding: 0 2px;
    font-size: 14px;
    color: @gray-darker-transparent;

    .ItemEntity-expander:hover & {
      color: @black;
    }
  }

  &.is-newlyAdded {
    background-color: @add;
    -webkit-animation-duration: 1s;
    animation-duration: 1s;
    -webkit-animation-fill-mode: both;
    animation-fill-mode: both;
    -webkit-animation-name: pulse;
    animation-name: pulse;
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
    color: @white;
    &:hover {
      text-decoration: none;
    }
  }
  &-label {
    cursor: pointer;
    a {
      color: @link-color;
      &:hover {
        color: @link-color;
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
  background-color: @chip-background;
  border: 1px solid @chip-color;
  color: @chip-color;
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

  &.is-removeable {
    background-color: @danger;
  }

  @media (max-width: @screen-sm) {
    max-width: 100%;
  }
}

</style>
