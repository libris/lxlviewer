<script>
import {translatePhrase} from "@/utils/filters.js";
import FormBuilder from "@/components/care/form-builder.vue";
import IdPill from "@/components/shared/id-pill.vue";
import * as StringUtil from 'lxljs/string.js';
import {mapGetters} from "vuex";
import {
  STATUS_KEY,
  Type
} from "@/utils/bulk.js";

export default {
  name: 'bulk-changes-header.vue',
  components: {IdPill, FormBuilder},
  data() {
    return {
      editing: false,
      iconMap: {
        [Type.Update]: 'edit',
        [Type.Delete]: 'trash-o',
        [Type.Create]: 'plus',
        [Type.Merge]: 'compress',
      },
    };
  },
  props: {
    currentBulkChange: {},
    documentId: '',
    isNew: false,
    isDraft: false,
    specType: ''
  },
  computed: {
    ...mapGetters([
      'user',
      'resources',
    ]),
    convertedType() {
      return this.specType.replace('https://id.kb.se/vocab/', '');
    },
    iconClass() {
      let iconName = '';
      if (this.iconMap.hasOwnProperty(this.convertedType)) {
        iconName = this.iconMap[this.convertedType];
      } else {
        iconName = 'file-text-o';
      }
      return `fa fa-fw fa-${iconName}`;
    },
    name() {
      return this.currentBulkChange.label;
    },
    comments() {
      const c = this.currentBulkChange['comment'] || []
      return Array.isArray(c) ? c : [c];
    },
    id() {
      return this.currentBulkChange['@id'];
    },
    status() {
      return StringUtil.getLabelByLang(this.currentBulkChange[STATUS_KEY], this.user.settings.language, this.resources);
    },
    typeLabel() {
      return StringUtil.getLabelByLang(this.specType, this.user.settings.language, this.resources);
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
    <span class="BulkChanges-type" v-tooltip.right="typeLabel">
      <i :class="iconClass"/>
    </span>
    <span class="BulkChanges-id">
      <id-pill
        v-if="!isNew"
        :uri="documentId"
      />
    </span>
  </div>
  <div v-if="comments.length > 0" class="BulkChanges-comments">
    <div v-for="(comment) in comments" class="BulkChanges-comment">
      <span>{{comment}}</span>
    </div>
  </div>
</template>

<style scoped lang="less">
.BulkChanges {
  display: flex;
  flex-direction: row;
  align-items: center;
  &-header {
    font-size: 3rem;
    padding-right: 1rem;
    font-weight: 600;
    &.cursor-pointer {
      cursor: pointer;
    }
  }
  &-inputField {
    font-size: 3rem;
    font-weight: 600;
    padding-bottom: 10px;
    margin-right: 1rem;
    padding-right: 1rem;
  }
  &-id {
    margin-left: auto;
    text-align:right;
  }
  &-typeHeader {
    display: flex;
    width: 100%;
    flex-wrap: wrap;
  }
  &-type{
    margin-left: 3px;
    display: flex;
    font-size: 16px;
    background-color: @grey-lightest;
    color: @brand-primary;
    justify-content: center;
    align-items: center;
    min-width: 25px;
    height: 25px;
    border-radius: 0.25rem;
  }
  &-comments {
    padding-bottom: 20px;
  }
  &-comment {
    padding-left: 1px;
  }
}

</style>
