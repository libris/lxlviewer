<script>
import { mapGetters } from 'vuex';
import * as StringUtil from 'lxljs/string';
import { translatePhrase } from '@/utils/filters';

export default {
  name: 'select-sigel',
  props: {
    id: String,
    preselectedValue: String,
    updateOnChange: {
      default: true,
      type: Boolean,
    },
  },
  emits: ['changed'],
  methods: {
    translatePhrase,
    getSigelLabel(sigel, len) {
      return StringUtil.getSigelLabel(sigel, len);
    },
    updateSigel(value) {
      const doUpdate = () => {
        const userObj = this.user;
        userObj.settings.activeSigel = value;
        this.$store.dispatch('setUser', userObj);
      };
      if (this.$route.name === 'Inspector' && this.inspector.data.mainEntity && this.inspector.data.mainEntity['@type'] === 'Item') {
        // If editing a holding, the user must accept a cancel dialog before sigel can be changed
        this.$store.dispatch('pushInspectorEvent', {
          name: 'record-control',
          value: 'cancel',
          callback: () => {
            doUpdate();
          },
        });
      } else {
        doUpdate();
      }

      this.$emit('changed');
    },
    onChange(e) {
      if (this.updateOnChange) {
        this.updateSigel(e.target.value);
      }
    },
    onSubmit() {
      this.updateSigel(this.$refs.selectSigel.value);
    },
  },
  computed: {
    ...mapGetters([
      'inspector',
      'user',
    ]),
    selectValue() {
      return this.preselectedValue ? this.preselectedValue : this.user.settings.activeSigel;
    },
    sortedSigels() {
      return [...this.user.collections].sort((a, b) => this.getSigelLabel(a).localeCompare(this.getSigelLabel(b)));
    },
  },
};
</script>

<template>
  <form
    class="SelectSigelForm"
    :class="{ displayInRow: !updateOnChange }"
    @submit.prevent="onSubmit">
    <select
      :id="id"
      class="customSelect"
      ref="selectSigel"
      :value="selectValue"
      @change="onChange">
      <option
        v-for="sigel in sortedSigels"
        :key="sigel.code"
        :value="sigel.code">{{ getSigelLabel(sigel, 50) }} {{ sigel.global_registrant == true ? '👑' : '' }}{{ sigel.code === 'Ssao' ? ' ⚔️' : '' }}</option>
    </select>
    <button
      v-if="!updateOnChange"
      type="submit"
      class="btn btn-primary btn--md">
      <i class="icon icon--white fa fa-exchange" />
      {{ translatePhrase('Växla sigel') }}
    </button>
  </form>
</template>

<style lang="less">

.SelectSigelForm {
  &.displayInRow {
    display: flex;
    flex-direction: column;

    @media screen and (min-width: @screen-sm-min){
      flex-direction: row;
      justify-content: flex-end;
    }

    @media screen and (max-width: @screen-sm-min){
      .btn {
        margin-left: 0;
      }
    }

    .customSelect {
      font-size: 1.4rem;
      @media screen and (max-width: @screen-sm-min){
        margin-bottom: 1.4rem;
      }
    }
  }
}

</style>
