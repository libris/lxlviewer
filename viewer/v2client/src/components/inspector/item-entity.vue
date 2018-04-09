<script>
import * as _ from 'lodash';
import * as VocabUtil from '../../utils/vocab';
import * as DataUtil from '../../utils/data';
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
      isNewlyAdded: false,
      removeHover: false,
    };
  },
  computed: {
  },
  ready() {
  },
  events: {
    'focus-new-item'(index) {
      if (index === this.index) {
        this.isNewlyAdded = true;
        setTimeout(() => {
          this.isNewlyAdded = false;
        }, 1500);
      }
    }
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
    isEmpty() {
      // TODO: Is the item empty?
      return false;
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
};
</script>

<template>
  <div class="ItemEntity-container" @mouseleave="showCardInfo=false" v-bind:class="{'highlight': isNewlyAdded }">
    <div class="ItemEntity" v-if="!expanded" :class="{ 'locked': isLocked, 'highlighted': showCardInfo }" @mouseenter="showCardInfo=true">
      <span class="ItemEntity-label"><span v-if="!expanded">{{getItemLabel}}</span><span class="placeholder"></span></span>
      <div class="ItemEntity-removeButton" v-if="!isLocked">
        <i v-if="!isLocked" class="fa fa-times chip-action" v-on:click="removeThis(true)" @mouseover="removeHover = true" @mouseout="removeHover = false">
          <tooltip-component :show-tooltip="removeHover" tooltip-text="Remove" translation="translatePhrase"></tooltip-component>
        </i>
      </div>
    </div>
    <card-component :title="getItemLabel" :focus-data="item" :uri="item['@id']" :is-local="false" :is-locked="isLocked" :should-show="showCardInfo" :floating="!expanded" :field-key="fieldKey"></card-component>
  </div>
</template>

<style lang="less">

@linked-color: #daefec;

.ItemEntity {
  display: inline-block;
  background-color: lighten(@bib-color, 2%);
  border: none;
  border-radius: 2em;
  overflow: hidden;
  line-height: 1.6;
  padding: 3px 0.3em 3px 0.5em;

  &-container {
    margin: 0px 0.5em 0px 0px;
  }
  &-removeButton {
    display: inline-block;
    width: 1.2em;
    height: 1.2em;
    line-height: 1.2em;
    cursor: pointer;
    // background-color: rgba(255, 255, 255, 0.25);
    i {
      color: fadeout(white, 35%);
    }
    &:hover {
      // background-color: rgba(255, 255, 255, 0.35);
      i {
        color: white;
      }
    }
    display: inline-block;
    border-radius: 1em;
    text-align: center;
  }
  &.expanded {
    margin: 0 0 2em 0;
  }

  &.locked {
    padding: 3px 0.5em 3px 0.5em;
  }
  &:hover {
    background-color: darken(@bib-color, 2%);
  }
  a {
    color: white;
    &:hover {
      text-decoration: none;
    }
  }
  &-label {
    color: white;
    cursor: default;
  }
}

</style>
