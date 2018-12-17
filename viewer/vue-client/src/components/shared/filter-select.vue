<script>
/*
  Adds custom select menu with searchable options
*/
import { forEach } from 'lodash-es';
import * as StringUtil from '@/utils/string';
import { mixin as clickaway } from 'vue-clickaway';

export default {
  mixins: [clickaway],
  name: 'filter-select',
  props: {
    options: {},
    optionsAll: {
      type: Array,
      default: () => [],
    },
    optionsSelected: {
      type: String,
      default: '',
    },
    className: {
      type: String,
      default: '',
    },
    customPlaceholder: {
      type: String,
      default: '',
    },
    isFilter: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      selectId: 'filterSelect',
      selectedObject: {},
      currentItem: -1,
      filterVisible: false,
      keyEnums: {
        space: 32,
        left: 37,
        up: 38,
        right: 39,
        down: 40,
      },
    };
  },
  computed: {
    settings() {
      return this.$store.getters.settings;
    },
    translatedPlaceholder() {
      return StringUtil.getUiPhraseByLang(this.customPlaceholder, this.settings.language);
    },
  },
  methods: {
    preventBodyScroll(e) {
      const keys = this.keyEnums;
      if ([
        keys.space,
        keys.left,
        keys.up,
        keys.right,
        keys.down,
      ].indexOf(e.keyCode) > -1) {
        e.preventDefault();
      } 
    },
    checkInput(event) {
      if (event.keyCode === 32) {
        this.filterVisible = true;
      }
    },
    handleKeys(event) {
      if (this.filterVisible) {
        this.preventBodyScroll(event);
      }
    },
    nextItem(event) {
      if (this.filterVisible) {
        const inputContSel = document.getElementsByClassName(this.className);
        const inputContEl = inputContSel[0];
        const texts = inputContEl.getElementsByClassName('js-filterSelectText');
        const items = inputContEl.getElementsByClassName('js-filterSelectItem');

        if (event.keyCode === 38 || event.keyCode === 40) {
          for (let i = 0; i < items.length; i++) {
            items[i].dataset.index = i;
            items[i].classList.remove('isActive');
          }

          if (event.keyCode === 38 && this.currentItem > 0) {
            this.currentItem--;
          } else if (event.keyCode === 40 && this.currentItem < texts.length - 1) {
            this.currentItem++;
          }
          texts[this.currentItem].focus();
          items[this.currentItem].classList.add('isActive');
        }
      }
    },
    filter() {
      const inputContSel = document.getElementsByClassName(this.className);
      const inputContEl = inputContSel[0];
      const inputSel = inputContEl.getElementsByTagName('input');
      const inputEl = inputSel[0];
      const filterSelectContainer = inputEl.parentElement;
      let filterBy = inputEl.value.toUpperCase();
      const dropdownSel = filterSelectContainer.getElementsByClassName('js-filterSelectDropdown');
      const dropdownEl = dropdownSel[0];
      filterBy = inputEl.value.toUpperCase();
      const span = dropdownEl.getElementsByTagName('span');

      for (let i = 0; i < span.length; i++) {
        if (span[i].innerHTML.toUpperCase().indexOf(filterBy) > -1) {
          span[i].style.display = '';
        } else {
          span[i].style.display = 'none';
        }
      }
    },
    selectOption(event, eventObj = {}) {
      const eventObject = eventObj;
      eventObject.label = event.target.textContent;
      eventObject.value = event.target.dataset.filter;
      eventObject.key = event.target.dataset.key;

      this.selectedObject = eventObject;
      this.filterVisible = false;
    },
    showCurrentFilter(label) {      
      const inputContSel = document.getElementsByClassName(this.className);
      const inputContEl = inputContSel[0];
      const inputSel = inputContEl.getElementsByTagName('input');
      const inputEl = inputSel[0];

      inputEl.value = label;
    },
    focusOnInput(event) {
      if (event.target.classList.contains('js-filterSelect') 
      || event.target.classList.contains('js-createSelect')) {
        const input = this.$refs.filterselectInput;
        this.filterVisible = !this.filterVisible;
        input.focus();
      }
    },
    clear() {
      const allObj = {};
      const allValue = this.optionsAll;

      const inputContSel = document.getElementsByClassName(this.className);
      const inputContEl = inputContSel[0];
      const texts = inputContEl.getElementsByClassName('js-filterSelectText');
      
      // Make all options visible again
      forEach(texts, (text) => {
        text.removeAttribute('style');
      });

      allObj.label = '';
      allObj.value = allValue;
      allObj.key = '';

      this.selectedObject = allObj;
      this.filterVisible = false;
    },
    close() {
      this.filterVisible = false;
    },
  },
  watch: {
    selectedObject(value) {
      this.showCurrentFilter(value.label);
      this.$emit('filter-selected', value);
    },
  },
  mounted() {
    this.$el.addEventListener('keyup', this.nextItem);
    this.$el.addEventListener('keyup', this.handleKeys);

    this.$nextTick(() => { 
    });
  },
};
</script>

<template>
  <div class="FilterSelect" 
    :class="className" 
    v-on-clickaway="close"
    :tabindex="0"
    @keydown.space="preventBodyScroll"
    @keyup.space="focusOnInput">
    <input class="FilterSelect-input js-filterSelectInput" 
      type="text" 
      v-bind:placeholder="translatedPlaceholder" 
      :id="selectId" 
      @keyup.exact="filter()"
      @keyup.space="checkInput($event)"
      @click="filterVisible = !filterVisible"
      ref="filterselectInput"
      :tabindex="-1">
    <ul class="FilterSelect-dropdown js-filterSelectDropdown"
      :class="{'is-visible': filterVisible}">
      <li class="FilterSelect-dropdownItem js-filterSelectItem"
        @click="selectOption"
        @keyup.enter="selectOption"
        v-for="option in options"
        :key="option.key">
        <span class="FilterSelect-dropdownText js-filterSelectText" 
          tabindex="-1"
          :data-filter="option.value"
          :data-key="option.key">{{option.label}}</span>
      </li>
    </ul>
    <i
      class="fa icon icon--sm FilterSelect-open"
      :class="{'fa-angle-up': filterVisible, 'fa-angle-down': !filterVisible}"
      @click="filterVisible = !filterVisible"
      @keyup.enter="filterVisible = !filterVisible"></i>
    <i v-if="isFilter"
      class="fa fa-close icon icon--sm FilterSelect-clear"
      @click="clear()"
      @keyup.enter="clear()"></i>
  </div>
</template>

<style lang="less">
.FilterSelect {
  position: relative;
  display: inline-block;
  font-weight: normal;
  width: 100%;
  border-radius: 10px;
  box-shadow: @shadow-panel;

  &-input {
    padding: 5px 40px 5px 10px;
    border: none;
    border-bottom: 1px solid #ddd;
    line-height: 1;
    font-size: 16px;
    font-size: 1.6rem;
    width: 100%;
    height: 30px;
    background-color: @white;
    border: 1px solid @gray-light;
    border-radius: 5px;
    z-index: 2;
    position: relative;
    text-overflow: ellipsis;

    &::placeholder {
      color: @black;
    }

    &:focus::placeholder {
      opacity: 0;
    }
  }

  &--insideInput {
    position: absolute;
    width: 50%;
  }

  &-dropdown {
    height: 0;
    max-height: 0;
    opacity: 0;
    overflow: hidden;
    position: absolute;
    top: auto;
    bottom: 28px;
    background-color: @panel-header-bg;
    width: 100%;
    border: 1px solid @gray-light;
    border-radius: 10px;
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
    z-index: 1;
    margin: 0;
    padding: 0;

    &.is-visible {
      height: auto;
      max-height: 400px;
      opacity: 1;
      overflow-y: scroll;
      border: 1px solid @gray-light;
      box-shadow: @shadow-panel;
      z-index: 4;
      padding: 5px 0;
    }

    .FilterSelect--insideInput & {
      top: 26px;
      bottom: auto;
      border-radius: 10px;
      border-top-left-radius: 0;
      border-top-right-radius: 0;
    }
  }

  &-dropdownItem {
    text-decoration: none;
    display: block;
    cursor: pointer;
    padding: 0 5px;

    &:hover,
    &.isActive {
      background-color: @gray-light;
      color: @white;
    }
  }

  &-dropdownText {
    display: block;
    padding: 5px 5px;
  }

  &-clear,
  &-open {
    position: absolute;
    top: 7px;
    right: 24px;
    cursor: pointer;
    z-index: 3;
    font-weight: 300;
  }

  &-open {
    font-size: 18px;
    font-size: 1.8rem;
    font-weight: 700;
    right: 8px;
    top: 6px;
  }
}
</style>
