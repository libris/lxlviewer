<script>
import * as _ from 'lodash';
import * as LayoutUtil from '@/utils/layout';
import * as StringUtil from '@/utils/string';
import CardComponent from '../shared/card-component';
import TooltipComponent from '../shared/tooltip-component';
import ItemMixin from '../mixins/item-mixin';
import LensMixin from '../mixins/lens-mixin';

export default {
  name: 'item-entity',
  mixins: [ItemMixin, LensMixin],
  props: {
    item: {},
    isLocked: {
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
      showCardInfo: false,
      removeHover: false,
    };
  },
  computed: {
    settings() {
      return this.$store.getters.settings;
    },
    isNewlyAdded() {
      if (this.inspector.status.lastAdded === this.fullPath) {
        return true;
      }
      return false;
    },
    fullPath() {
      return `${this.parentPath}.{"@id":"${this.item['@id']}"}`;
    },
    routerPath() {
      if (this.item.hasOwnProperty('@id')) {
        const uriParts = this.item['@id'].split('/');
        const fnurgel = uriParts[uriParts.length - 1];
        return `/${fnurgel}`;
      }
      return '';
    },
    isLibrisResource() {
      return StringUtil.isLibrisResourceUri(this.item['@id'], this.settings);
    },
  },
  watch: {
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
      return _.size(obj);
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
    'card-component': CardComponent,
    'tooltip-component': TooltipComponent,
  },
  mounted() {
    this.$nextTick(() => {
      if (this.isNewlyAdded) {
        setTimeout(() => {
          const element = this.$el;
          LayoutUtil.scrollToElement(element, 1000, () => {
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
  <div class="ItemEntity-container" 
    :id="`formPath-${path}`"
    @keyup.enter="showCardInfo=true"
    @mouseenter="showCardInfo=true"
    @mouseleave="showCardInfo=false">
    <div class="ItemEntity chip" 
      tabindex="0"
      v-if="!expanded" 
      :class="{ 'is-locked': isLocked, 'is-highlighted': showCardInfo, 'is-newlyAdded': isNewlyAdded, 'is-removeable': removeHover}">
      <span class="ItemEntity-label chip-label">
        <span v-if="!expanded && isLibrisResource"><router-link :to="routerPath">{{getItemLabel}}</router-link></span>
        <span v-if="!expanded && !isLibrisResource"><a :href="item['@id']">{{getItemLabel}}</a></span>
        <span class="placeholder"></span></span>
      <div class="ItemEntity-removeButton chip-removeButton icon icon--sm" v-if="!isLocked">
        <i class="fa fa-times-circle" 
          v-if="!isLocked"
          role="button"
          tabindex="0"
          @click="removeThis(true)"
          @keyup.enter="removeThis(true)"
          @mouseover="removeHover = true, showCardInfo = false"
          @mouseout="removeHover = false, showCardInfo = true">

          <tooltip-component 
            :show-tooltip="removeHover" 
            tooltip-text="Remove" 
            translation="translatePhrase"></tooltip-component>
        </i>
      </div>
    </div>
    <card-component 
      :title="getItemLabel" 
      :focus-data="item" 
      :uri="item['@id']" 
      :is-local="false" 
      :is-locked="isLocked" 
      :should-show="showCardInfo" 
      :floating="!expanded" 
      :field-key="fieldKey"></card-component>
  </div>
</template>

<style lang="less">

@linked-color: #daefec;

.ItemEntity {

  &-container {
    display: flex;
    position: relative;
    width: 100%;
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
  max-width: 300px;

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
