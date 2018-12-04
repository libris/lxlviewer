<script>
import { mapGetters } from 'vuex';
import RoundButton from '@/components/shared/round-button.vue';
import TooltipComponent from '@/components/shared/tooltip-component';

export default {
  name: 'summary-action-button',
  props: {
    options: {
      show: false,
      styling: 'gray',
      text: 'button',
    },
    disabled: true,
    replaced: true,
    extracting: false,
  },
  data() {
    return {
    };
  },
  methods: {
    action() {
      this.$emit('action');
    },
  },
  computed: {
    ...mapGetters([
      'settings',
    ]),
    getIcon() {
      if (this.disabled) return 'check';
      if (this.replaced) return 'ban';
      if (this.options.icon) return this.options.icon;
      return false;
    },
    getTooltipText() {
      if (this.disabled) return 'Added';
      if (this.replaced) return 'Replaced';
      if (this.options.text) return this.options.text;
      return false;
    },
  },
  components: {
    'round-button': RoundButton,
    'tooltip-component': TooltipComponent,
  },
  watch: {
  },
  mounted() { // Ready method is deprecated in 2.0, switch to "mounted"
    this.$nextTick(() => {
    });
  },
};
</script>


<template>
  <div class="SummaryAction">
    <div class="SummaryAction-roundButton">
      <round-button 
        :disabled="disabled || replaced || extracting"
        :color="options.styling"
        :icon="getIcon"
        :indicator="!disabled || !replaced" 
        @click="action()"
        @keyup.enter="action()">
        <template slot="tooltip" v-if="getTooltipText">
          <tooltip-component
            class="Toolbar-tooltipContainer"
            position="right"
            :show-tooltip="true"
            :tooltip-text="getTooltipText" 
            translation="translatePhrase"></tooltip-component>
        </template>
      </round-button>
    </div>
  </div>
</template>

<style lang="less">

.SummaryAction {
  display: flex;
  align-items: baseline;

  &-roundButton {
    margin-top: 5px;

    .fa-stack-1x {
      color: @white;
    }
    .fa-stack-2x {
      transition: color 0.25s ease;
      color: @link-color;
    }
    &:hover {
      .fa-stack-2x {
        color: @link-hover-color;
      }
    }
  }
  

  &-button {
  }
}
</style>
