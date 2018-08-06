<script>

export default {
  name: 'filter-select',
  props: {
    options: {},
    optionsAll: '',
    optionsSelected: '',
    selectId: 'filterSelect',
  },
  data() {
    return {
      selectedObject: {},
      filterVisible: false,
    };
  },
  methods: {
    filter () {
      let inputSel, 
      inputEl, 
      filterSelectContainer, 
      filterBy, 
      dropdownSel, 
      dropdownEl,
      span, 
      i;

      inputSel = document.getElementsByClassName('js-filterSelectInput');
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
      let inputSel, inputEl;
      inputSel = document.getElementsByClassName('js-filterSelectInput');
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
  computed: {
  },
  components: {
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
  <div class="FilterSelect" @blur="filterVisible = false">
    <input class="FilterSelect-input js-filterSelectInput" 
      type="text" 
      placeholder="Alla typer" 
      :id="selectId" 
      @keyup="filter(), filterVisible = true"
      @click="filterVisible = true">
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
      class="fa fa-close FilterSelect-clear"
      @click="clear()"></i>
  </div>
</template>

<style lang="less">

.FilterSelect {
  position: relative;
  display: inline-block;
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
    font-weight: normal;
    font-size: 12px;
    font-size: 1.2rem;
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

  &-clear {
    position: absolute;
    top: 6px;
    color: #fff;
    right: 8px;
    cursor: pointer;
  }
}

</style>
