<script>
import { translatePhrase } from '@/utils/filters';
import { mapState, mapWritableState } from 'pinia';
import { useInspectorStore } from '@/stores/inspector';
import { useUserStore } from '@/stores/user';

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
  methods: {
    translatePhrase,
    getSigelLabel(sigel, len) {
      if (!sigel.friendly_name) {
        return sigel.code;
      }
      
      const sigelPart = ` (${sigel.code})`;
      const fName = sigel.friendly_name.length + sigelPart.length > len
        ? `${sigel.friendly_name.substr(0, len - sigelPart.length - 3)}...`
        : sigel.friendly_name;
      
      return `${fName}${sigelPart}`;
    },
    updateSigel(value) {
      const doUpdate = () => {
        const userObj = this.user;
        userObj.settings.activeSigel = value;
        this.user = userObj;
      };

      if (this.$route.name === 'Inspector' && this.inspector.data.mainEntity && this.inspector.data.mainEntity['@type'] === 'Item') {
        // If editing a holding, the user must accept a cancel dialog before sigel can be changed
        this.event = { 
          name: 'record-control',
          value: 'cancel',
        };

        doUpdate();
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
    ...mapState(useInspectorStore, ['inspector']),
    ...mapWritableState(useUserStore, ['user']),
    ...mapWritableState(useInspectorStore, ['event']),
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
    :class="{'displayInRow': !updateOnChange}"    
    @submit.prevent="onSubmit">
    <select 
      :id="id" 
      class="customSelect" 
      ref="selectSigel"
      :value="selectValue" 
      @change="onChange">
      <option v-for="sigel in sortedSigels"
        :key="sigel.code" 
        :value="sigel.code">{{ getSigelLabel(sigel, 50) }} {{ sigel.global_registrant == true ? '👑' : '' }}{{ sigel.code === 'Ssao' ? ' ⚔️' : '' }}</option>
    </select>
    <button
      v-if="!updateOnChange"
      type="submit"
      class="btn btn-primary btn--md"
    >
      <i class="icon icon--white fa fa-exchange"></i>
      {{ translatePhrase('Växla sigel') }}
    </button>
  </form>
</template>

<style lang="scss">

.SelectSigelForm {
  &.displayInRow {
    display: flex;
    flex-direction: column;
    
    // @media screen and (min-width: @screen-sm-min){
    //   flex-direction: row;
    //   justify-content: flex-end;      
    // }

    @include media-breakpoint-up(sm) {
      flex-direction: row;
      justify-content: flex-end;
    }

    // @media screen and (max-width: @screen-sm-min){
    //   .btn {
    //     margin-left: 0;
    //   }
    // }

    @include media-breakpoint-down(sm) {
      .btn {
        margin-left: 0;
      }
    }

    .customSelect {
      font-size: 1.4rem;
      // @media screen and (max-width: @screen-sm-min){
      //   margin-bottom: 1.4rem;
      // }
      @include media-breakpoint-down(sm) {
        margin-bottom: 1.4rem;
      }
    }
  }
}

</style>
