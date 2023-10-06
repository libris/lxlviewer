<script>
import { mapGetters } from 'vuex';
import { CHANGE_CATEGORIES } from '../../utils/changecategories';

export default {
  name: 'change-categories',
  data() {
    return {
      sigelChecked: false,
    };
  },
  props: {
    sigel: Object,
  },
  methods: {
    updateChangeCategories(e, sigel, category) {
      this.$store.dispatch('updateSubscribedChangeCategories', { libraryId: sigel.code, categoryId: category, checked: e.target.checked });
    },
    toggleChecked() {
      this.sigelChecked = !this.sigelChecked;
    },
    isActiveCategory(category) {
      const obj = this.userChangeCategories.find(c => c.heldBy === this.sigel.code);
      return obj ? obj.triggers.includes(category) : false;
    },
    setActiveChecked() {
      const obj = this.userChangeCategories.find(c => c.heldBy === this.sigel.code);
      if (obj && obj.triggers.length !== 0) {
        this.sigelChecked = true;
      }
    },
  },
  computed: {
    ...mapGetters([
      'userChangeCategories',
    ]),
    changeCategories() {
      return CHANGE_CATEGORIES.map(c => c['@id']);
    },
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
  <div>
    <tr>
      <td class="key">
        <label for="siteWidthCheckbox">{{ sigelName }}</label>
      </td>
      <td class="value">
        <input id="siteWidthCheckbox"
          class="customCheckbox-input"
          type="checkbox"
          @change="toggleChecked">
        <div class="customCheckbox-icon"></div>
      </td>
    </tr>
    <div v-if="isChecked">
      <div v-for="category in changeCategories" :key="category">
        <tr>
          <td class="key">
            <label for="siteWidthCheckbox">{{ category }}</label>
          </td>
          <td class="value">
            <input id="siteWidthCheckbox"
              class="customCheckbox-input"
              type="checkbox"
              @change="updateChangeCategories(...arguments, sigel, category)" :checked=isActiveCategory(category)>
            <div class="customCheckbox-icon"></div>
          </td>
        </tr>
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">

</style>
