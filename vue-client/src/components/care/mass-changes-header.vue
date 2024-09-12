<script>
import {translatePhrase} from "@/utils/filters.js";
import FormBuilder from "@/components/care/form-builder.vue";
import IdPill from "@/components/shared/id-pill.vue";

export default {
  name: 'mass-changes-header.vue',
  components: {IdPill, FormBuilder},
  data() {
    return {
      editing: false,
    };
  },
  props: {
    currentBulkChange: {},
    documentId: '',
    isNew: false,
  },
  computed: {
    name() {
      return this.currentBulkChange.label;
    },
    id() {
      return this.currentBulkChange['@id'];
    },
    status() {
      if (this.currentBulkChange.bulkChangeStatus === 'DraftBulkChange') {
        return 'Draft';
      }
    },
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
  <div class="MassChanges">
  <h1>
    <input class="MassChanges-inputField"
      ref="heading"
      v-if="editing"
      v-model="currentBulkChange.label"
      @blur="stopEdit"
      @keyup.enter="stopEdit"
      @keyup.esc="stopEdit"
    >
    <span class="MassChanges-header" v-if="!editing"
      :class="{ 'cursor-pointer': !editing }"
      @click="startEdit"
      @keyup.enter="startEdit"
      tabindex="0"
    >
      {{this.name}}
    </span>
  <span class="badge badge-accent2">{{ translatePhrase(this.status) }}</span>
  </h1>
    <span class="MassChanges-id">
      <id-pill
        v-if="!isNew"
        :uri="documentId"
      />
<!--        <span class="badge badge-accent"-->
<!--          v-if="isNew"-->
<!--        >Ny</span>-->
    </span>
  </div>
    <!-- Visa id om det är en körning som redan finns -->
</template>

<style scoped lang="less">
.MassChanges {
  display: flex;
  flex-direction: row;
  align-items: center;
  &-header {
    font-size: 3rem;
    padding-bottom: 10px;
    padding-right: 1rem;
    &.cursor-pointer {
      cursor: pointer;
    }
  }
  &-inputField {
    font-size: 3rem;
    padding-bottom: 10px;
    margin-right: 1rem;
    padding-right: 1rem;
  }
  &-id {
    margin-left: auto;
    text-align:right;
  }
}
</style>
