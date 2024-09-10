<script>
import {translatePhrase} from "@/utils/filters.js";
import FormBuilder from "@/components/care/form-builder.vue";

export default {
  name: 'mass-changes-header.vue',
  components: {FormBuilder},
  data() {
    return {
      editing: false,
    };
  },
  props: {
    currentSpec: {}
  },
  computed: {
    specName() {
      return this.currentSpec.label;
    }
  },
  methods: {
    translatePhrase,
    startEdit() {
      this.editing = true;
      this.focusInput()
    },
    stopEdit() {
      this.editing = false;
    },
    focusInput() {
      this.$nextTick(() => {
        this.$refs.heading.focus();
      });
    }
  },
};
</script>
<template>
  <h1>
    <input class="MassChanges-header-inputField"
      ref="heading"
      v-if="editing"
      v-model="currentSpec.label"
      @blur="stopEdit"
      @keyup.enter="stopEdit"
      @keyup.esc="stopEdit"
    >
    <span class="MassChanges-header" v-if="!editing"
      @click="startEdit"
      @keyup.enter="startEdit"
      tabindex="0"
    >
      {{this.specName}}
    </span>
    <span class="badge badge-accent2">{{ translatePhrase("New run specification") }}</span>
    <!-- Visa id om det är en körning som redan finns -->
  </h1>
</template>

<style scoped lang="less">
.MassChanges-header {
  &-inputField {
    width: 100%;
    padding-right: 1rem;
    padding-bottom: 10px;
  }
  font-size: 3rem;
  padding-bottom: 10px;
  padding-right: 1rem;
}
</style>
