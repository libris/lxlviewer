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
  <div class="SummaryAction">
     <!-- This component now renders as an icon button or a regular button depending on the action event -->
    <div v-if="options.event === 'add-entity'" class="SummaryAction-icon action-container">
      <i v-show="replaced" class="fa fa-ban icon icon--lg is-disabled" :title="'Replaced by' | translatePhrase"></i>
      <i v-show="disabled" class="fa fa-check-circle icon icon--lg is-added" :title="'Added' | translatePhrase"></i>
      <i 
        v-show="!(disabled || replaced) && options.styling === 'brand'"
          class="fa fa-plus-circle icon icon--lg icon--primary"
          @click.stop="action()"
          @keyup.enter.stop="action()"
          role="button"
          tabindex="0"
          :title="options.text | translatePhrase">
        </i>
        <i 
          v-show="!(disabled || replaced) && options.styling == 'gray'"
          class="fa fa-plus-circle icon icon--lg"
          @click="action()"
          @keyup.enter="action()"
          tabindex="0"
          role="button"
          :title="options.text | translatePhrase">
        </i>
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
  &-icon {
    display: flex;
    align-items: center;
    width: 30px;
  }

  &-button {
  }
}
</style>
