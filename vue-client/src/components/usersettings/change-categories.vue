<script>
import { mapGetters } from 'vuex';
import LensMixin from '@/components/mixins/lens-mixin';

export default {
  name: 'change-categories',
  mixins: [LensMixin],
  data() {
    return {
      sigelChecked: false,
    };
  },
  props: {
    sigel: Object,
    availableCategories: [],
  },
  methods: {
    updateChangeCategories(e, sigel, categoryId) {
      this.$store.dispatch('updateSubscribedChangeCategories', { libraryId: sigel.code, categoryId: categoryId, checked: e.target.checked });
    },
    toggleChecked() {
      this.sigelChecked = !this.sigelChecked;
    },
    isActiveCategory(categoryId) {
      const obj = this.userChangeCategories.find(c => c.heldBy === this.sigel.code);
      return obj ? obj.triggers.includes(categoryId) : false;
    },
    setActiveChecked() {
      const obj = this.userChangeCategories.find(c => c.heldBy === this.sigel.code);
      if (obj && obj.triggers.length !== 0) {
        this.sigelChecked = true;
      }
    },
    label(obj) {
      return this.getLabel(obj);
    },
  },
  computed: {
    ...mapGetters([
      'userChangeCategories',
    ]),
    isChecked() {
      return this.sigelChecked;
    },
    sigelName() {
      return this.sigel.friendly_name;
    },
  },
  mounted() {
    this.$nextTick(() => {
      this.setActiveChecked();
    });
  },
};
</script>

<template>
  <div class="Categories">
      <div class="Categories-label" @click="toggleChecked">
        <i class="Categories-arrow fa fa-chevron-right"
        :class="{'icon is-expanded' : isChecked}"
        ></i>
      {{ sigelName }}
      </div>

    <div v-if="isChecked">
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
  &.is-expanded >
  .Categories-label >
  .Categories-arrow {
    transform: rotate(90deg);
    transform-origin: center;
  }
}
</style>
