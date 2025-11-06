<script>
import { mapGetters } from 'vuex';
import * as DisplayUtil from 'lxljs/display';
import * as StringUtil from 'lxljs/string';
import { translatePhrase } from '@/utils/filters';

export default {
  name: 'record-picker',
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
    label: {
      type: String,
      default: '',
    },
    topLabel: {
      type: String,
      default: '',
    },
    locked: {
      type: Boolean,
      default: false
    }
  },
  components: {
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
      'userFlagged',
      'user',
      'resources',
      'inspector',
      'settings',
    ]),
    headers() {
      return this.flaggedInstances.map((instance) => {
        const headerList = DisplayUtil.getItemSummary(
          instance,
          this.resources,
          this.inspector.data.quoted,
          this.settings,
          this.resources.displayGroups,
        ).header;

        const header = StringUtil.getFormattedEntries(
          headerList,
          this.resources.vocab,
          this.user.settings.language,
          this.resources.context,
        ).join(', ');
        return { '@id': instance['@id'], header };
      });
    },
    filteredInstances() {
      const filteredTitles = this.headers.filter((el) => el.header.toLowerCase()
        .indexOf(this.filterPhrase.trim().toLowerCase()) > -1);
      return this.flaggedInstances.filter((instance) => filteredTitles.some((el) => el['@id'] === instance['@id']));
    },
    nameLabel() {
      return this.label.length === 0 ? translatePhrase(this.name) : translatePhrase(this.label);
    },
    upperLabel() {
      return this.topLabel.length === 0 ? translatePhrase(this.name) : translatePhrase(this.topLabel);
    }
  },
  watch: {
    userFlagged(newVal) {
      if (this.selected && !this.locked) {
        const selectedIsFlagged = newVal.filter((item) => item['@id'] === this.selected['@id']);
        if (selectedIsFlagged.length === 0) {
          this.unselectThis();
        }
      }
    },
  },
  methods: {
    translatePhrase,
    selectThis(item) {
      if (item['@id'] !== this.oppositeSelected) {
        const changeObj = { [this.name]: item['@id'] };
        this.$store.dispatch('setDirectoryCare', { ...this.directoryCare, ...changeObj })
          .then(() => {
            this.expanded = false;
          });
      }
    },
    unselectThis() {
      console.log('explicitly unselecting')
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
        const input = this.$refs.pickerInput;
        if (this.expanded && input) {
          input.focus();
        }
      });
    },
  },
  mounted() {
    this.$watch(`directoryCare.${this.name}`, (newVal) => { // create dynamic watcher for this component
      if (!newVal) {
        this.selected = newVal;
      } else {
        const match = this.flaggedInstances.filter((el) => el['@id'] === newVal);
        this.selected = match[0];
      }
    });

    this.$watch(`directoryCare.${this.opposite}`, (newVal) => { // create dynamic watcher for opposite
      this.oppositeSelected = newVal;
      if (newVal && !this.selected) {
        this.expandAndFocus();
      }
    });

    if (this.directoryCare[this.name]) {
      const match = this.flaggedInstances.filter((el) => el['@id'] === this.directoryCare[this.name]);
      this.selected = match[0];
    }

    if (this.expand) {
      this.expandAndFocus();
    }
  },
};
</script>

<template>
  <div class="RecordPicker">
    <div
      class="RecordPicker-label uppercaseHeading"
      :class="{ 'has-selection': selected }">
      {{ this.upperLabel }}</div>
    <div class="RecordPicker-body" :class="{ 'has-selection': selected, 'is-expanded': expanded }">
      <div class="RecordPicker-dropdownWrapper">
        <div class="RecordPicker-dropdownContainer" v-if="!selected && flaggedInstances.length > 0">
          <div
            class="RecordPicker-toggle"
            @click="toggleDropdown"
            @keyup.enter="toggleDropdown"
            tabIndex="0">
            <span class="RecordPicker-toggleLabel">{{ `${translatePhrase('Choose')} ${this.nameLabel}` }}</span>
            <span class="RecordPicker-toggleIcon" :class="{ expanded: expanded }">
              <i class="fa fa-fw fa-chevron-down" />
            </span>
          </div>
          <div class="RecordPicker-dropdown" v-show="expanded">
            <div class="RecordPicker-inputContainer">
              <input
                type="text"
                v-model="filterPhrase"
                class="RecordPicker-input"
                ref="pickerInput"
                :placeholder="translatePhrase('Filter')"
                :aria-label="translatePhrase('Filter')">
            </div>
            <div class="RecordPicker-items">
              <div
                class="RecordPicker-item"
                :key="item['@id']"
                v-for="item in filteredInstances"
                @click="selectThis(item)"
                @keyup.enter="selectThis(item)"
                :tabindex="item['@id'] === oppositeSelected ? -1 : 0"
                :class="{ 'is-disabled': item['@id'] === oppositeSelected }">
                <entity-summary
                  :focus-data="item"
                  :should-link="false"
                  :valueDisplayLimit=1
                  :highlightStr="filterPhrase.trim()"
                  :encodingLevel="item.encodingLevel" />
              </div>
            </div>
          </div>
        </div>
        <div class="RecordPicker-selectedContainer" v-if="selected">
          <entity-summary
            :focus-data="selected"
            :shouldOpenTab="true"
            :valueDisplayLimit=1
            :encodingLevel="selected.encodingLevel" />
          <span
            v-if="!locked"
            class="RecordPicker-closeBtn"
            role="button"
            @click="unselectThis"
            @keyup.enter="unselectThis"
            tabindex="0"
            :aria-label="translatePhrase('Close')">
            <i class="fa fa-fw fa-close icon" />
          </span>
        </div>
      </div>
      <slot name="info" />
    </div>
  </div>
</template>

<style lang="less">

.user-is-tabbing {
  .RecordPicker {
    &-toggle, &-item {
      &:focus {
        .focus-mixin-bg();
      }
    }
  }
}

.RecordPicker  {
  max-width: @directorycare-sidewidth;
  display: flex;
  flex: 1 1 46%;
  flex-direction: column;

  @media (max-width: @screen-sm) {
    flex: 1 1 auto;
    max-width: 100%;
    width: 100%;
  }

  &-label {
    padding: 5px 10px;
    background-color: @grey-lighter;
    display: table; // ie fallback
    width: fit-content;
    transition: background-color 0.3s ease;

    &.has-selection {
      background-color: @brand-faded;
    }
  }

  &-body {
    height: 100%;
    background-color: @white;
    border: 1px solid @grey-lighter;
    padding: 0 20px 20px;
    transition: background-color 0.3s ease;

    &.has-selection {
      background-color: @brand-faded;
      border-color: transparent;
    }

    &.is-expanded {
      z-index: 1;
    }
  }

  &-dropdownContainer,
  &-selectedContainer {
    position: relative;
    border: 1px solid @grey-lighter;
    box-shadow: @shadow-panel;
    background-color: @white;
    margin-top: 20px;
  }

  &-selectedContainer {
    padding: 15px;
  }

  &-dropdownWrapper {
    position: relative;
    margin-bottom: 70px;

    .has-selection & {
      margin-bottom: 0;
    }
  }

  &-dropdownContainer {
    padding: 0;
    position: absolute;
    width: 100%;
  }

  &-toggle {
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
    padding: 10px 15px;
  }

  &-toggleLabel {
    color: @brand-primary;
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
    border-bottom: 1px solid @grey-lighter;
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
    border-top: 1px solid @grey-lighter;
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

    &:hover:not(.is-disabled) {
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
