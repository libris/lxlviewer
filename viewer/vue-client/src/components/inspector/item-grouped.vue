<script>
import { mapGetters } from 'vuex';
import ItemMixin from '../mixins/item-mixin';

export default {
  name: 'item-grouped',
  mixins: [ItemMixin],
  props: {
    item: {
      type: Object,
      default: () => {},
    },
    fieldKey: {
      type: String,
      default: '',
    },
    index: Number,
    isLocked: {
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
      expanded: false,
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
  },
  mounted() {
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
  },
  components: {
  },
};
</script>

<template>
  <div class="ItemGrouped"
    :id="`formPath-${path}`"
    :class="{'is-expanded': expanded }"
    @keyup.enter="checkFocus()"
    @focus="addFocus()"
    @blur="removeFocus()">

    <strong class="ItemGrouped-heading">
      <div class="ItemGrouped-label"
        :class="{'is-locked': isLocked }"
        @click="toggleExpanded()">
        <i class="ItemGrouped-arrow fa fa-chevron-right"></i>
        <span class="ItemGrouped-type">{{ item.totalItems }} länkningar</span>
      </div>
    </strong>

    <ul class="ItemGrouped-list">
      <field
      v-for="(value, key) in item.items"
      :key="key"
      :entity-type="entityType" 
      :is-inner="false" 
      :is-locked="true" 
      :is-removable="false" 
      :is-grouped="true"
      :field-key="key"
      :field-value="value"></field>
    </ul>  
  </div>
</template>

<style lang="less">
.ItemGrouped {
  width: 100%;
  padding: 5px 0;
  position: relative;
  flex: 1 100%;
  transition: background-color .5s ease;
  
  &-heading {
    display: block;
    flex: 1 100%;
    font-weight: normal;
    position: relative;    

    .is-expanded & {
      margin-bottom: 0.5rem;
    }    
    .icon-hover();
  }

  &-label {    
    cursor: pointer;
    
    &.is-inactive {
      pointer-events: none;
    }
  }

  &-arrow {
    transition: all 0.2s ease;
    padding: 0 2px;
    font-size: 14px;
    color: @grey-darker-transparent;

    .ItemGrouped-label:hover & {
      color: @black;
    }
  }

  &.is-expanded > 
  .ItemGrouped-heading >
  .ItemGrouped-label > 
  .ItemGrouped-arrow {
    transform:rotate(90deg);
    transform-origin: center;
  }

  &.is-highlighted {
    background-color: @form-highlight;
  }

  &-list {
    display: none;
    flex: 1 100%;
    position: relative;
    padding: 0 0 0 4px;

    .is-expanded & {
      display: block;
    }
  }
}

</style>
