<script>
/*
  Adds custom select menu with searchable options
*/
import * as StringUtil from '@/utils/string';
import { mixin as clickaway } from 'vue-clickaway';

export default {
  mixins: [clickaway],
  name: 'filter-select',
  props: {
    options: {},
    optionsAll: '',
    optionsSelected: '',
    selectId: 'filterSelect',
    className: '',
    customPlaceholder: '',
    isFilter: true
  },
  data() {
    return {
      selectedObject: {},
      filterVisible: false
    };
  },
  computed: {
    settings() {
      return this.$store.getters.settings;
    },
    translatedPlaceholder() {
      return StringUtil.getUiPhraseByLang(this.customPlaceholder, this.settings.language);
    }
  },
  methods: {
    filter () {
      let inputSel, 
      inputEl, 
      inputContEl, 
      inputContSel,
      filterSelectContainer, 
      filterBy, 
      dropdownSel, 
      dropdownEl,
      span, 
      i;

      inputContSel = document.getElementsByClassName(this.className);
      inputContEl = inputContSel[0];

      inputSel = inputContEl.getElementsByTagName('input');
      inputEl = inputSel[0];
      filterBy = inputEl.value.toUpperCase();
      filterSelectContainer = inputEl.parentElement;
      dropdownSel = filterSelectContainer.getElementsByClassName('js-filterSelectDropdown');
      dropdownEl = dropdownSel[0];
      filterBy = inputEl.value.toUpperCase();
      span = dropdownEl.getElementsByTagName('span');

      for (i = 0; i < span.length; i++) {
        if (span[i].innerHTML.toUpperCase().indexOf(filterBy) > -1) {
          span[i].style.display = '';
        } else {
          span[i].style.display = 'none';
        }
      }
    },
    selectOption(event) {
      let eventObject = {};

      eventObject.label = event.target.textContent;
      eventObject.value = event.target.dataset.filter;
      eventObject.key = event.target.dataset.key;

      this.selectedObject = eventObject;
      this.filterVisible = false;
    },
    showCurrentFilter(label) {
      let inputSel, inputEl, inputContEl, inputContSel;
      
      inputContSel = document.getElementsByClassName(this.className);
      inputContEl = inputContSel[0];

      inputSel = inputContEl.getElementsByTagName('input');
      inputEl = inputSel[0];

      inputEl.value = label;
    },
    clear() {
      let allObj = {};
      let allValue = this.optionsAll;

      allObj.label = '';
      allObj.value = allValue;
      allObj.key = '';

      this.selectedObject = allObj;
      this.filterVisible = false;
    },
    close() {
      this.filterVisible = false;
    }
  },
  watch: {
    selectedObject(value) {
      this.showCurrentFilter(value.label);
      this.$emit('filter-selected', value);
    }
  },
  mounted() {
    this.$nextTick(() => {});
  },
};
</script>

<template>
  <div class="FilterSelect" 
    :class="className" 
    @blur="filterVisible = false"
    v-on-clickaway="close">
    <input class="FilterSelect-input js-filterSelectInput" 
      type="text" 
      v-bind:placeholder="translatedPlaceholder" 
      :id="selectId" 
      @keyup="filter(), filterVisible = true"
      @click="filterVisible = !filterVisible">
    <ul class="FilterSelect-dropdown js-filterSelectDropdown"
      :class="{'is-visible': filterVisible}">
      <li class="FilterSelect-dropdownItem"
        @click="selectOption"
        @keyup.enter="selectOption"
        v-for="option in options"
        :key="option.key">
        <span class="FilterSelect-dropdownText" 
          tabindex="0"
          :data-filter="option.value"
          :data-key="option.key">{{option.label}}</span>
      </li>
    </ul>
    <i tabindex="0" 
      class="fa icon icon--sm FilterSelect-open"
      :class="{'fa-angle-down': filterVisible, 'fa-angle-up': !filterVisible}"
      @click="filterVisible = !filterVisible"
      @keyup.enter="filterVisible = !filterVisible"></i>
    <i v-if="isFilter" 
      tabindex="0"
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
    bottom: 26px;
    background-color: @panel-header-bg;
    padding: 5px 0;
    width: 100%;
    border: 1px solid @gray-light;
    border-radius: 10px;
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
    z-index: 1;

    &.is-visible {
      height: auto;
      max-height: 400px;
      opacity: 1;
      overflow-y: scroll;
      border: 1px solid @gray-light;
      box-shadow: @shadow-panel;
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

    &:hover {
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
