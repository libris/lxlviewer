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
      <div v-for="category in availableCategories" :key="category['@id']">
        <tr>
          <td class="key">
            <label for="siteWidthCheckbox">{{ label(category) }}</label>
          </td>
          <td class="value">
            <input id="siteWidthCheckbox"
              class="customCheckbox-input"
              type="checkbox"
              @change="updateChangeCategories(...arguments, sigel, category['@id'])" :checked="isActiveCategory(category['@id'])">
            <div class="customCheckbox-icon"></div>
          </td>
        </tr>
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">

</style>
