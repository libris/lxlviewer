<script>
import * as _ from 'lodash';
import * as VocabUtil from '../../utils/vocab';
import * as DataUtil from '../../utils/data';
import * as LayoutUtil from '../../utils/layout';

import CardComponent from '../shared/card-component';
import TooltipComponent from '../shared/tooltip-component';
import EntitySummary from '../shared/entity-summary';
import ProcessedLabel from '../shared/processedlabel';
import ItemMixin from '../mixins/item-mixin';
import LensMixin from '../mixins/lens-mixin';

export default {
  name: 'item-entity',
  mixins: [ItemMixin, LensMixin],
  props: {
    item: {},
    fieldKey: '',
    index: Number,
    isLocked: false,
    parentPath: '',
  },
  data() {
    return {
      inEdit: false,
      searchResult: {},
      searchDelay: 2,
      formObj: {},
      expanded: false,
      showCardInfo: {
        default: false,
        type: Boolean,
      },
      removeHover: false,
    };
  },
  computed: {
    isNewlyAdded() {
      if (this.inspector.status.lastAdded === this.fullPath) {
        return true;
      }
      return false;
    },
    fullPath() {
      return `${this.parentPath}.{"@id":"${this.item['@id']}"}`;
    }
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
    'processed-label': ProcessedLabel,
    'card-component': CardComponent,
    'entity-summary': EntitySummary,
    'tooltip-component': TooltipComponent,
  },
  mounted() {
    this.$nextTick(() => {
      if(this.inspector.status.lastAdded === this.fullPath) {
        setTimeout(() => {
          let element = this.$el;
          let topOfElement = LayoutUtil.getPosition(element).y;
          if (topOfElement > 0) {
            const windowHeight = window.innerHeight || 
            document.documentElement.clientHeight || 
            document.getElementsByTagName('body')[0].clientHeight;
            const scrollPos = LayoutUtil.getPosition(this.$el).y - (windowHeight * 0.2);
            LayoutUtil.scrollTo(scrollPos, 900, 'easeInOutQuad', () => {
              setTimeout(() => {
                this.$store.dispatch('setInspectorStatusValue', { property: 'lastAdded', value: '' });
              }, 1000)
            });
          } else {
            setTimeout(() => {
                this.$store.dispatch('setInspectorStatusValue', { property: 'lastAdded', value: '' });
              }, 1000)
          }
        }, 200);
      }
    });
  }
};
</script>

<template>
  <div class="ItemEntity-container" 
    @mouseleave="showCardInfo=false">
    <div class="ItemEntity" 
      tabindex="0"
      v-if="!expanded" 
      :class="{ 'is-locked': isLocked, 'is-highlighted': showCardInfo, 'is-newlyAdded': isNewlyAdded}" 
      @keyup.enter="showCardInfo=true"
      @mouseenter="showCardInfo=true">
      <span class="ItemEntity-label">
        <span v-if="!expanded">{{getItemLabel}}</span>
        <span class="placeholder"></span></span>
      <div class="ItemEntity-removeButton" v-if="!isLocked">
        <i class="fa fa-times chip-action" 
          v-if="!isLocked" 
          v-on:click="removeThis(true)" 
          @mouseover="removeHover = true" 
          @mouseout="removeHover = false">
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
  display: inline-block;
  background-color: @instance-chip-background;
  border: 1px solid @instance-chip-color;
  border-radius: 2em;
  overflow: hidden;
  line-height: 1.6;
  padding: 3px 0.3em 3px 0.5em;
  transition: .3s ease;

  &-container {
    display: flex;
    margin: 2px 5px 2px 0px;
    position: relative;
  }

  &.is-newlyAdded {
    background-color: @sec-alter;
    -webkit-animation-duration: 1s;
    animation-duration: 1s;
    -webkit-animation-fill-mode: both;
    animation-fill-mode: both;
    -webkit-animation-name: pulse;
    animation-name: pulse;
  }

  &-removeButton {
    display: inline-block;
    width: 1.2em;
    height: 1.2em;
    line-height: 1.2em;
    cursor: pointer;
    border-radius: 1em;
    text-align: center;

    i {
      color: @instance-chip-color;
    }
    &:hover {
      i {
        color: @instance-chip-color-hover;
      }
    }
  }

  &.expanded {
    margin: 0 0 2em 0;
  }

  &.is-locked {
    padding: 3px 0.5em 3px 0.5em;
  }

  a {
    color: white;
    &:hover {
      text-decoration: none;
    }
  }
  &-label {
    color: @instance-chip-color;
    font-weight: 600;
    cursor: default;
  }
  
  @media print {
    border: 1px solid;
  }
}

</style>
