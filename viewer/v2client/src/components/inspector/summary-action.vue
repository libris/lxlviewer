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
    replaced: true
  },
  data() {
    return {
    }
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
      if (this.disabled) return 'check'
      if (this.replaced) return 'ban'
      if (this.options.icon) return this.options.icon
      else return false;
    }
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
    <div v-if="options.icon !== null" class="SummaryAction-roundButton">
      <!-- <i v-show="replaced" class="fa fa-fw fa-ban icon icon--lg is-disabled" :title="'Replaced by' | translatePhrase"></i>
      <i v-show="disabled" class="fa fa-fw fa-check-circle icon icon--lg is-added" :title="'Added' | translatePhrase"></i> -->
      <!-- <i v-show="!disabled && !replaced" class="fa fa-fw fa-circle fa-stack-2x"></i> -->
      <!-- <i 
        v-show="!(disabled || replaced) && options.styling === 'brand'"
          class="fa fa-fw icon fa-stack-1x"
          :class="options.icon"
          @click.stop="action()"
          @keyup.enter.stop="action()"
          role="button"
          tabindex="0"
          :title="options.text | translatePhrase">
        </i> -->

        <!-- <i 
          v-show="!(disabled || replaced) && options.styling == 'gray'"
          class="fa fa-fw icon fa-stack-1x"
          :class="options.icon"
          @click="action()"
          @keyup.enter="action()"
          tabindex="0"
          role="button"
          :title="options.text | translatePhrase">
        </i> -->
      <round-button 
        :disabled="disabled || replaced"
        :color="options.styling"
        :icon="getIcon"
        :indicator="!disabled || !replaced" 
        @click="action()"
        @keyup.enter="action()">
        <template slot="tooltip">
          <tooltip-component 
            class="Toolbar-tooltipContainer"
            position="left"
            :show-tooltip="true"
            :tooltip-text="'Hi!'" 
            translation="translatePhrase"></tooltip-component>
        </template>
      </round-button>
    </div>
    <button v-else class="SummaryAction-button btn btn--sm"
      @click="action()"
      @keyup.enter="action()"
      :class="{'btn-primary' : options.styling === 'brand'}">
      {{options.text | translatePhrase}}
    </button>
  </div>
</template>

<style lang="less">

.SummaryAction {
  display: flex;
  align-items: baseline;

  &-roundButton {
    margin-top: 10px;

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
