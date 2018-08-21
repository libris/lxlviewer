<script>
/*
  Adds custom select menu with searchable options
*/
import * as StringUtil from '@/utils/string';

export default {
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
    }
  },
  watch: {
    selectedObject(value) {
      this.showCurrentFilter(value.label);
      this.$emit('filter-selected', value);
    }
  },
  mounted() {
    this.$nextTick(() => {
      console.log(this.isFilter);    
      });
  },
};
</script>

<template>
  <div class="FilterSelect" 
    :class="className" 
    @blur="filterVisible = false">
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
        @keypress.enter="selectOption"
        v-for="option in options"
        :key="option.key">
        <span class="FilterSelect-dropdownText" 
          :data-filter="option.value"
          :data-key="option.key">{{option.label}}</span>
      </li>
    </ul>
    <i tabindex="0" 
      class="fa FilterSelect-open"
      :class="{'fa-angle-up': filterVisible, 'fa-angle-down': !filterVisible}"
      @click="filterVisible = !filterVisible"></i>
    <i v-if="isFilter" 
      tabindex="0"
      class="fa fa-close FilterSelect-clear"
      @click="clear()"></i>
  </div>
</template>

<style lang="less">
.FilterSelect {
  position: relative;
  display: inline-block;
  font-weight: normal;
  font-size: 12px;
  font-size: 1.2rem;
  width: 100%;
  background-color: lighten(@bib-color, 2%);

  &-input {
    padding: 5px 25px 5px 10px;
    border: none;
    border-bottom: 1px solid #ddd;
    color: #fff;
    width: 100%;
    background-color: lighten(@bib-color, 2%);

    &::placeholder {
      color: #fff;
    }

    &:focus::placeholder {
      opacity: 0;
    }
  }

  &-dropdown {
    height: 0;
    max-height: 0;
    opacity: 0;
    overflow: hidden;
    position: absolute;
    background-color: #fff;
    padding: 0;
    width: 100%;
    border: 0px solid lighten(@bib-color, 2%);
    z-index: 1;
    transition: opacity 0.5s;

    &.is-visible {
      height: auto;
      max-height: 600px;
      opacity: 1;
      border: 1px solid lighten(@bib-color, 2%);
    }
  }

  &-dropdownItem {
    text-decoration: none;
    display: block;
    cursor: pointer;

    &:hover {
      background-color: lighten(@bib-color, 2%);
      color: #fff;
    }
  }

  &-dropdownText {
    display: block;
    padding: 5px;
  }

  &-clear,
  &-open {
    position: absolute;
    top: 6px;
    color: #fff;
    right: 24px;
    cursor: pointer;
  }

  &-open {
    font-size: 18px;
    font-size: 1.8rem;
    font-weight: 700;
    right: 8px;
    top: 3px;
  }
}
</style>
