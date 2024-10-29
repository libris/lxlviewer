<script>
import {translatePhrase} from "@/utils/filters.js";
import FormBuilder from "@/components/care/form-builder.vue";
import IdPill from "@/components/shared/id-pill.vue";
import * as StringUtil from 'lxljs/string.js';
import {mapGetters} from "vuex";
import {
  STATUS_KEY,
} from "@/utils/bulk.js";

export default {
  name: 'bulk-changes-header.vue',
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
    isDraft: false,
  },
  computed: {
    ...mapGetters([
      'user',
      'resources',
    ]),
    name() {
      return this.currentBulkChange.label;
    },
    id() {
      return this.currentBulkChange['@id'];
    },
    status() {
      return StringUtil.getLabelByLang(this.currentBulkChange[STATUS_KEY], this.user.settings.language, this.resources);
    },
  },
  methods: {
    translatePhrase,
    startEdit() {
      if (this.isDraft) {
        this.editing = true;
        this.focusInput()
      }
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
  <div class="BulkChanges">
  <h1>
    <input class="BulkChanges-inputField"
      ref="heading"
      v-if="editing"
      v-model="currentBulkChange.label"
      @blur="stopEdit"
      @keyup.enter="stopEdit"
      @keyup.esc="stopEdit"
    >
    <span class="BulkChanges-header" v-if="!editing"
      :class="{ 'cursor-pointer': !editing && isDraft }"
      @click="startEdit"
      @keyup.enter="startEdit"
      tabindex="0"
    >
      {{this.name}}
    </span>
  <span class="badge badge-accent2">{{ this.status }}</span>
<!--  <span class="BulkChanges-noItems badge badge-accent-2"-->
<!--    v-if="this.noAffected"> {{this.noAffectedLabel}}-->
<!--  </span>-->
  </h1>
    <span class="BulkChanges-id">
      <id-pill
        v-if="!isNew"
        :uri="documentId"
      />
<!--        <span class="badge badge-accent"-->
<!--          v-if="isNew"-->
<!--        >Ny</span>-->
    </span>
  </div>
</template>

<style scoped lang="less">
.BulkChanges {
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
  &-noItems {
    margin-left: 5px;
  }
}
</style>
