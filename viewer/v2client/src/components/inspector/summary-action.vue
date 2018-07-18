<script>
import { mapGetters } from 'vuex';

export default {
  name: 'summary-action-button',
  props: {
    options: {
      show: false,
      styling: 'gray',
      text: 'button',
      inspectAction: false,
    },
    disabled: true,
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
    inspectUrl() {
      const uriParts = this.options.payload['@id'].split('/');
      const fnurgel = uriParts[uriParts.length-1];
      return `/katalogisering/${fnurgel}`;
    },
    isLibrisResource() {
      return StringUtil.isLibrisResourceUri(this.options.payload['@id'], this.settings.apiPath);
    }
  },
  components: {
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
  <div class="SummaryAction action-container">
    <i v-show="disabled" class="fa fa-check-circle icon icon--lg is-disabled" :title="'Added' | translatePhrase"></i>
    <!-- <button class="SummaryAction-button"
      @click="action()"
      :class="'SummaryAction-button--'+options.styling">
      {{options.text | translatePhrase}}
    </button> -->
    <i 
      v-show="!disabled && options.styling === 'brand'"
      class="fa fa-plus-circle icon icon--lg icon--primary"
      @click="action()"
      :title="options.text | translatePhrase">
    </i>
    <i 
      v-show="!disabled && options.styling == 'gray'"
      class="fa fa-plus-circle icon icon--lg"
      @click="action()"
      :title="options.text | translatePhrase">
    </i>
  </div>
</template>

<style lang="less">

.SummaryAction {
  display: flex;
  align-items: center;
  width: 30px;

  &-button {
    // min-width: 90px;
    // padding: 3px 10px;
    // font-size: 12px;
    // font-size: 1.2rem;
    // line-height: 1.2;

    &--brand {
      // color: @white;
      // background: @brand-primary;

      &:hover {
        // background: lighten(@brand-primary, 5%);
      }

      &:active {
        // background: darken(@brand-primary, 5%);
      }
    }

    &--gray {
      // color: @black;
      // background: @gray-light;

      &:hover {
        // background: lighten(@gray-light, 5%);
      }

      &:active {
        // background: darken(@gray-light, 5%);
      }
    }
  }
}

</style>
