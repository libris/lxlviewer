<script>
import EntityForm from '@/components/inspector/entity-form.vue';
import FieldAdder from '@/components/inspector/field-adder.vue';
import { mapGetters } from 'vuex';
import {convertResourceLink, translatePhrase} from "../../utils/filters.js";

export default {
  name: 'form-builder.vue',
  components: { FieldAdder, EntityForm },
  data() {
    return {
      selected: true,
      showIdListLink: false,
    };
  },
  props: {
    title: '',
    formData: {
      type: Object,
      default: () => ({}),
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    idListLink: {
      type: String,
      default: ''
    },
    firstItemActive: {
      type: Boolean,
      default: false,
    },
  },
  watch: {
    isActive(newValue, oldValue) {
      if (newValue !== oldValue && oldValue) { // active -> inactive
        this.onInactive();
      } else if (newValue !== oldValue && newValue) { // inactive -> active
        this.onActive();
      }
    }
    },
  computed: {
    ...mapGetters([
      'inspector',
    ]),
    formTab() {
      return { id: 'form', text: 'test' };
    },
    showIdList() {
      return this.idListLink !== '';
    }
  },
  emits: ['onInactive', 'onActive', 'removeIdList'],
  methods: {
    convertResourceLink,
    translatePhrase,
    onInactive() {
      this.$emit('onInactive');
    },
    onActive() {
      this.$emit('onActive');
    },
    removeIdList() {
      this.$emit('removeIdList');
    }
  },
};
</script>
<template>
  <div class="FormBuilder">
    <div
      class="FormBuilder-label uppercaseHeading"
      :class="{ 'has-selection': isActive }">
      {{ this.title }}
    </div>
    <div class="FormBuilder-body" :class="{ 'has-selection': isActive }">
      <div class="FormBuilder-idLabel" v-if="showIdList">
        {{translatePhrase("Selection from ID list")}}
      </div>
      <div class="FormBuilder-idList" v-if="showIdList">
        <a class="FormBuilder-link" :href="convertResourceLink(this.idListLink)" target="_blank">{{this.idListLink}}</a>
        <i v-if="firstItemActive"
          @click="removeIdList"
          role="button"
          tabindex="0"
          class="FormBuilder-closeButton fa fa-close icon--md" />
      </div>
      <div>
        <entity-form
          :editing-object="'mainEntity'"
          :key="formTab.id"
          :is-active="true"
          :form-data="formData"
          :locked="!isActive"
          :show-bulkchange-actions="true"
        />
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
.FormBuilder {
  &-label {
    padding: 5px 10px;
    background-color: @grey-lighter;
    display: table; // ie fallback
    width: fit-content;
    transition: background-color 0.3s ease;

    &.has-selection {
      background-color: @brand-faded;
      color: @black;
    }
  }

  &-idList {
    align-items: center;
    display: flex;
    border: 1px solid @grey-lighter;
    margin-bottom: 20px;
    width: 100%;
  }

  &-idLabel {
    width: fit-content;
    font-size: 12px;
    padding-bottom: 4px;
  }

  &-link {
    padding: 10px 20px;
    display: block;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &-closeButton {
    padding-right: 20px;
  }

  &-body {
    height: 100%;
    background-color: @white;
    border: 1px solid @grey-lighter;
    padding:  20px;
    transition: background-color 0.3s ease;

    &.has-selection {
      //background-color: #D9EBDC;
      //background-color: @brand-faded;
      border-color: @brand-faded;
      border-width: 5px;
    }
  }

}
</style>
