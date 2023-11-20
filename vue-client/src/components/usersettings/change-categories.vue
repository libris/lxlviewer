<script>
import { mapGetters } from 'vuex';
import { translatePhrase } from '@/utils/filters';
import * as StringUtil from 'lxljs/string';
import LensMixin from '@/components/mixins/lens-mixin';

export default {
  name: 'change-categories',
  mixins: [LensMixin],
  data() {
    return {
      categoriesIsExpanded: false,
      sigelIsExpanded: false,
    };
  },
  props: {
    sigel: Object,
    availableCategories: [],
    availableSigels: [],
  },
  methods: {
    translatePhrase,
    updateSigel(e, sigel) {
      this.$store.dispatch('updateSubscribedSigel', { libraryId: this.sigelUri(sigel), checked: e.target.checked });
    },
    updateCategory(e, categoryId) {
      this.$store.dispatch('updateSubscribedChangeCategory', { categoryId: categoryId, checked: e.target.checked });
    },
    toggleSigelExpanded() {
      this.sigelIsExpanded = !this.sigelIsExpanded;
    },
    toggleCategoriesExpanded() {
      this.categoriesIsExpanded = !this.categoriesIsExpanded;
    },
    isActiveCategory(categoryId) {
      const obj = this.userChangeCategories[0];
      return obj ? obj.triggers.includes(categoryId) : false;
    },
    isActiveSigel(sigel) {
      console.log('this.userChangeCategories', JSON.stringify(this.userChangeCategories));
      const obj = this.userChangeCategories.find(c => c.heldBy === this.sigelUri(sigel));
      return !!obj;
    },
    label(obj) {
      return this.getLabel(obj);
    },
    sigelLabel(sigel) {
      return StringUtil.getSigelLabel(sigel);
    },
    sigelUri(sigel) {
      return StringUtil.getLibraryUri(sigel.code);
    },
  },
  computed: {
    ...mapGetters([
      'userChangeCategories',
    ]),
  },
  mounted() {
  },
};
</script>

<template><div>
  <div class="Categories">
    <div class="Categories-label" @click="toggleSigelExpanded">
      <i class="Categories-arrow fa fa-chevron-right"
      :class="{'icon is-expanded' : sigelIsExpanded}"
      ></i>
      {{ translatePhrase("Collections") }}
    </div>
    <div v-if="sigelIsExpanded">
      <div class="Categories-row" v-for="sigel in availableSigels" :key="sigel.code">
        <div class="Categories-key">{{ sigelLabel(sigel) }}</div>
        <div class="Categories-value">
          <input id="categoryCheckbox"
            class="customCheckbox-input"
            type="checkbox"
            @change="e => updateSigel(e, sigel)" :checked="isActiveSigel(sigel)">
          <div class="customCheckbox-icon"></div>
        </div>
      </div>
    </div>
    <div class="Categories-label" @click="toggleCategoriesExpanded">
      <i class="Categories-arrow fa fa-chevron-right"
        :class="{'icon is-expanded' : categoriesIsExpanded}"
      ></i>
      {{ translatePhrase("Change categories") }}
    </div>
    <div v-if="categoriesIsExpanded">
      <div class="Categories-row" v-for="category in availableCategories" :key="category['@id']">
        <div class="Categories-key">{{ label(category) }}</div>
        <div class="Categories-value">
          <input id="categoryCheckbox"
            class="customCheckbox-input"
            type="checkbox"
            @change="e => updateCategory(e, category['@id'])" :checked="isActiveCategory(category['@id'])">
          <div class="customCheckbox-icon"></div>
        </div>
      </div>
    </div>
  </div>
</div>
</template>

<style scoped lang="less">
.Categories {
  &-arrow {
    transition: all 0.2s ease;
    padding: 0 2px;
    font-size: 14px;
    color: @grey-darker-transparent;

    &.is-expanded {
      transform: rotate(90deg);
    }
    .Categories-label:hover & {
      color: @black
    }
  }
  &-row {
    display: flex;
    border: solid @grey-lighter;
    border-width: 0px 0px 1px 0px;
  }
  &-key {
    padding: 0.6em;
    width: 50%;
  }
  &-value {
    padding: 0.6em;
    width: 50%;
  }
  &-label {
    padding: 0.5em;
    cursor: pointer;
  }
}
</style>
