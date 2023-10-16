<script>
import { mapGetters } from 'vuex';
import * as StringUtil from 'lxljs/string';
import LensMixin from '@/components/mixins/lens-mixin';

export default {
  name: 'change-categories',
  mixins: [LensMixin],
  data() {
    return {
      expanded: false,
    };
  },
  props: {
    sigel: Object,
    availableCategories: [],
  },
  methods: {
    updateChangeCategories(e, sigel, categoryId) {
      this.$store.dispatch('updateSubscribedChangeCategories', { libraryId: this.sigelUri, categoryId: categoryId, checked: e.target.checked });
    },
    toggleExpanded() {
      this.expanded = !this.expanded;
    },
    isActiveCategory(categoryId) {
      const obj = this.userChangeCategories.find(c => c.heldBy === this.sigelUri);
      return obj ? obj.triggers.includes(categoryId) : false;
    },
    label(obj) {
      return this.getLabel(obj);
    },
  },
  computed: {
    ...mapGetters([
      'userChangeCategories',
    ]),
    isExpanded() {
      return this.expanded;
    },
    sigelLabel() {
      return StringUtil.getSigelLabel(this.sigel);
    },
    sigelUri() {
      return StringUtil.getLibraryUri(this.sigel.code);
    },
  },
  mounted() {
    this.$nextTick(() => {
    });
  },
};
</script>

<template>
  <div class="Categories">
      <div class="Categories-label" @click="toggleExpanded">
        <i class="Categories-arrow fa fa-chevron-right"
        :class="{'icon is-expanded' : isExpanded}"
        ></i>
      {{ sigelLabel }}
      </div>

    <div v-if="isExpanded">
      <div class="Categories-row" v-for="category in availableCategories" :key="category['@id']">
        <div class="Categories-key">{{ label(category) }}</div>
        <div class="Categories-value">
          <input id="categoryCheckbox"
            class="customCheckbox-input"
            type="checkbox"
            @change="updateChangeCategories(...arguments, sigel, category['@id'])" :checked="isActiveCategory(category['@id'])">
          <div class="customCheckbox-icon"></div>
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
    padding: 0.5em;
    width: 50%;
  }
  &-value {
    padding: 0.5em;
    width: 50%;
  }
  &-label {
    padding: 0.5em;
    cursor: pointer;
  }
}
</style>
