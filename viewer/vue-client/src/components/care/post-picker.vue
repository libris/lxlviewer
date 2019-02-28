<script>
import { mapGetters } from 'vuex';
import EntitySummary from '@/components/shared/entity-summary';

export default {
  name: 'post-picker',
  props: {
    name: {
      type: String,
      required: true,
    },
    opposite: {
      type: String,
      required: true,
    },
    flaggedInstances: {
      type: Array,
      required: true,
    },
    info: {
      type: String,
      default: '',
    },
    expand: {
      type: Boolean,
      default: false,
    },
  },
  components: {
    'entity-summary': EntitySummary,
  },
  data() {
    return {
      expanded: false,
      selected: null,
      oppositeSelected: null,
      filterPhrase: '',
    };
  },
  computed: {
    ...mapGetters([
      'directoryCare',
    ]),
    filteredInstances() {
      return this.flaggedInstances.filter((el) => {
        let titles = [];
        el.hasTitle.forEach((t) => {
          for (const val in t) {
            if (t.hasOwnProperty(val) && typeof t[val] === 'string' && val !== '@type') { titles.push(t[val]); }
          }
        });
        titles = titles.join(' • ').toLowerCase();
        return titles.indexOf(this.filterPhrase.trim().toLowerCase()) > -1;
      });
    },
  },
  methods: {
    selectThis(item) {
      if (item['@id'] !== this.oppositeSelected) {
        const changeObj = { [this.name]: item['@id'] };
        this.$store.dispatch('setDirectoryCare', { ...this.directoryCare, ...changeObj });
      }
    },
    unselectThis() {
      const changeObj = { [this.name]: null };
      this.$store.dispatch('setDirectoryCare', { ...this.directoryCare, ...changeObj })
        .then(() => this.focusInput());
    },
    toggleDropdown() {
      this.expanded = !this.expanded;
      this.focusInput();
    },
    expandAndFocus() {
      this.expanded = true;
      this.focusInput();
    },
    focusInput() {
      this.$nextTick(() => {
        if (this.expanded) {
          this.$refs.pickerInput.focus();
        }
      });
    },
  },
  mounted() {
    this.$watch(`directoryCare.${this.name}`, (newVal) => { // create dynamic watcher for this component
      if (!newVal) {
        this.selected = newVal;
      } else {
        const match = this.flaggedInstances.filter(el => el['@id'] === newVal);
        this.selected = match[0];
      }
    });

    this.$watch(`directoryCare.${this.opposite}`, (newVal) => { // create dynamic watcher for opposite
      this.oppositeSelected = newVal;
      if (newVal && !this.selected) {
        this.expandAndFocus();
      }
    });
    if (this.expand) {
      this.expandAndFocus();
    }
  },
};
</script>

<template>
  <div class="PostPicker">
    <div class="PostPicker-label uppercaseHeading" 
      :class="{ 'has-selection' : selected}">
      {{ name | translatePhrase }}</div>
    <div class="PostPicker-body" :class="{ 'has-selection' : selected}">
      <div class="PostPicker-dropdownContainer" v-if="!selected && flaggedInstances.length > 0">
        <div class="PostPicker-toggle" 
          @click="toggleDropdown"
          @keyup.enter="toggleDropdown"
          tabIndex="0">
          <span class="PostPicker-toggleLabel">{{ ['Choose', name] | translatePhrase }}</span>
          <span class="PostPicker-toggleIcon" :class="{ 'expanded' : expanded}">
            <i class="fa fa-fw fa-chevron-down"></i>
          </span>
        </div>
        <div class="PostPicker-dropdown" v-show="expanded">
          <div class="PostPicker-inputContainer">
            <input
              type="text" 
              v-model="filterPhrase"
              class="PostPicker-input" 
              ref="pickerInput" 
              :placeholder="'Filter' | translatePhrase"
              :aria-label="'Filter' | translatePhrase">
          </div>
          <div class="PostPicker-items">
            <div class="PostPicker-item"
              :key="item['@id']"
              v-for="item in filteredInstances"
              @click="selectThis(item)"
              @keyup.enter="selectThis(item)"
              :tabindex="item['@id'] === oppositeSelected ? -1 : 0"
              :class="{ 'is-disabled' : item['@id'] === oppositeSelected}">
              <entity-summary 
                :focus-data="item" 
                :should-link="false"
                :valueDisplayLimit=1
                :highlightStr="filterPhrase.trim()"></entity-summary>
            </div>
          </div>
        </div>
      </div>
      <div class="PostPicker-selectedContainer" v-if="selected">
        <entity-summary 
          :focus-data="selected" 
          :should-link="false"
          :valueDisplayLimit=1></entity-summary>
        <span class="PostPicker-closeBtn" 
          role="button" 
          @click="unselectThis"
          @keyup.enter="unselectThis"
          tabindex="0"
          :aria-label="'Close' | translatePhrase">
          <i class="fa fa-fw fa-close icon"></i>
        </span>
      </div>
      <slot name="info"></slot>
    </div>
  </div>
</template>

<style lang="less">

.PostPicker  {
  flex-basis: @directorycare-sidewidth;
  max-width: @directorycare-sidewidth;
  display: flex;
  flex-direction: column;

  @media (max-width: @screen-sm) {
    max-width: 100%;
    width: 100%;
  }

  &-label {
    padding: 5px 10px;
    background-color: @gray-lighter;
    display: inline-block;
    width: fit-content;
    transition: background-color 0.3s ease;

    &.has-selection {
      background-color: @brand-faded;
    }
  }

  &-body {
    background-color: @white;
    border: 1px solid @grey-lighter;
    padding: 0 20px 20px; 
    transition: background-color 0.3s ease;

    &.has-selection {
      background-color: @brand-faded;
      border-color: transparent;
    }
  }

  &-dropdownContainer,
  &-selectedContainer {
    position: relative;
    margin-top: 20px;
    border: 1px solid @gray-lighter;
    box-shadow: @shadow-panel;
    background-color: @white;
  }

  &-selectedContainer {
    padding: 15px;
  }

  &-dropdownContainer {
    padding: 0;
  }

  &-toggle {
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
    padding: 10px 15px;
  }

  &-toggleLabel {
    color: @brand-darker;
    font-weight: 600;
  }

  &-toggleIcon {
    font-size: 14px;
    font-size: 1.4rem;
    transition: transform 0.2s ease;

    &.expanded {
      transform: rotate(180deg);
    }
  }

  &-dropdown {
    margin-top: 10px;
  }

  &-inputContainer {
    padding: 0 15px;
    border-bottom: 1px solid @gray-lighter;
  }

  &-input {
    width: 100%;
    border: 1px solid @grey-light;
    border-radius: 4px;
    padding: 5px 10px;
    margin-bottom: 15px;
  }

  &-closeBtn {
    position: absolute;
    padding: 5px;
    top: 0;
    right: 0;
  }

  &-items {
    max-height: 50vh;
    overflow-y: scroll;
  }

  &-item {
    cursor: pointer;
    border-top: 1px solid @gray-lighter;
    background-color: @white;
    transition: background-color 0.2s ease;
    padding: 0 15px;

    &:first-of-type {
      border-top: none;
    }

    &.is-disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    &:hover:not(.is-disabled),
    &:focus:not(.is-disabled) {
      background-color: @brand-faded;
    }
  }

  & .EntitySummary {
    padding: 15px 5px;
  }

  & .EntitySummary-title {
    font-size: 18px;
    font-size: 1.8rem;
  }
}

</style>
