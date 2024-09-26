<script>
import { mapGetters } from 'vuex';
import * as StringUtil from 'lxljs/string';

export default {
  name: 'check-box',
  props: {
    actionLabels: {
      type: Object,
      default: () => ({ on: 'Mark', off: 'Unmark' }),
    },
    selected: {
      type: Boolean,
      default: false,
    },
    showToolTip: {
      type: Boolean,
      default: true,
    }
  },
  data() {
    return {
      isChecked : false,
    };
  },
  emits: ['changed'],
  methods: {
    onChange(e) {
      this.isChecked = !this.isChecked;
      this.$emit('changed', e, this.isChecked);
    },
  },
  computed: {
    ...mapGetters([
      'resources',
      'user',
    ]),
    tooltip() {
      let str = '';
      if (!this.isChecked) {
        str += StringUtil.getUiPhraseByLang(this.actionLabels.on, this.user.settings.language, this.resources.i18n);
      } else {
        str += StringUtil.getUiPhraseByLang(this.actionLabels.off, this.user.settings.language, this.resources.i18n);
      }
      return str;
    },
  },
  components: {
  },
  mounted() {
    this.$nextTick(() => {
      this.isChecked = this.selected;
    });
  },
};
</script>

<template>
  <div class="CheckBox" v-tooltip="{
    content: showToolTip ? tooltip : '',
    trigger: 'hover',
    placement: 'top',}">
    <input id="test" class="customCheckbox-input" type="checkbox" @change="onChange"
      :checked="selected">
    <div class="customCheckbox-icon"></div>
  </div>
</template>

<style lang="less">
.CheckBox {
  background-color: transparent;
  color: @brand-primary;
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 20px;
  height: 20px;
  border-radius: 0.25rem;
  margin-right: 5px;
  font-size: 12px;

  &-label {
    font-weight: 800;
  }
}

</style>
