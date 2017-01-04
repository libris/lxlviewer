<script>
import * as _ from 'lodash';
import * as httpUtil from '../utils/http';
import * as VocabUtil from '../utils/vocab';
import * as DisplayUtil from '../utils/display';
import Vue from 'vue';
import ProcessedLabel from './processedlabel';
import ItemEntity from './item-entity';
import DataNode from './datanode';
import CardComponent from './card-component';
import { getVocabulary, getDisplayDefinitions, getSettings, getEditorData } from '../vuex/getters';

export default {
  name: 'item-anonymous',
  props: {
    item: {},
    key: '',
    index: Number,
    isLocked: false,
    focus: '',
    status: {},
  },
  vuex: {
    getters: {
      vocab: getVocabulary,
      display: getDisplayDefinitions,
      settings: getSettings,
      editorData: getEditorData,
    },
  },
  data() {
    return {
      inEdit: false,
      showCardInfo: false,
      searchResult: {},
      searchDelay: 2,
    };
  },
  computed: {
    filteredItem() {
      const filteredItem = Object.assign({}, this.item);
      delete filteredItem['@type'];
      return filteredItem;
    },
    // TODO: Refactor computed
    json() {
      return JSON.stringify(this.item);
    },
    formObj() {
      return this.getForm(this.item);
    },
    getChip() {
      const chip = DisplayUtil.getChip(
        this.formObj,
        this.display,
        this.editorData.linked,
        this.vocab,
        this.settings
      );
      return chip;
    },
    getCard() {
      const card = DisplayUtil.getCard(
        this.linkedItem,
        this.display,
        this.editorData.linked,
        this.vocab,
        this.settings
      );
      return card;
    },
    getRange() {
      const types = VocabUtil.getRange(
        this.key,
        this.vocab,
        this.settings.vocabPfx
      );
      return types;
    },
    isEmpty() {
      let bEmpty = true;
      // Check if item has any keys besides @type. If not, we'll consider it empty.
      _.each(this.item, (value, key) => {
        if (key !== '@type') {
          if (value && value !== '') {
            bEmpty = false;
          }
        }
      });
      return bEmpty;
    },
    isWork() {
      return this.focus === 'work';
    },
    isInstance() {
      return this.focus === 'it';
    },
  },
  created() {
    this.$options.components['data-node'] = Vue.extend(DataNode);
  },
  ready() {
    this.$nextTick(() => {
      if (this.isEmpty) {
        this.openForm();
      }
    });
  },
  methods: {
    getForm(item) {
      const formObj = {};
      if (!item['@type']) {
        return formObj;
      }
      let inputKeys = DisplayUtil.getProperties(
        item['@type'],
        'cards',
        this.display
      );
      if (inputKeys.length === 0) {
        const baseClasses = VocabUtil.getBaseClassesFromArray(
          item['@type'],
          this.vocab,
          this.settings.vocabPfx
        );
        for (const className of baseClasses) {
          inputKeys = DisplayUtil.getProperties(
            className.replace(this.settings.vocabPfx, ''),
            'cards',
            this.display
          );
          if (inputKeys.length > 0) {
            break;
          }
        }
      }
      inputKeys = ['@type'].concat(inputKeys);
      for (const key of inputKeys) {
        if (item[key]) {
          formObj[key] = item[key];
        } else {
          formObj[key] = '';
        }
      }
      return formObj;
    },
    openForm() {
      this.inEdit = true;
    },
    closeForm() {
      this.inEdit = false;
    },
    isObject(obj) {
      return _.isObject(obj);
    },
    removeThis() {
      this.$dispatch('remove-item', this.index);
    },
    addFocus() {
      this.focused = true;
    },
    removeFocus() {
      this.focused = false;
    },
  },
  components: {
    'processed-label': ProcessedLabel,
    'item-entity': ItemEntity,
    'card-component': CardComponent,
  },
};
</script>

<template>
  <div class="item-anonymous" @mouseleave="showCardInfo=false">
    <div class="chip" v-show="!inEdit" v-bind:class="{ 'locked': isLocked }" @mouseenter="showCardInfo=true">
      <span class="chip-label">
        {{getChip}}
      </span>
      <i class="chip-action fa fa-pencil" v-on:click="openForm" v-if="!isLocked"></i>
    </div>
    <div class="anonymous-form" v-show="inEdit">
      <i class="fa fa-times action-remove" v-on:click="removeThis"></i>
      <strong>{{ item['@type'] | labelByLang | capitalize }}</strong>
      <data-node v-for="(k,v) in filteredItem" :is-locked="isLocked" :pkey="key" :embedded="true" :is-removable="false" :pindex="index" :key="k" :value="v" :focus="focus" :linked="editorData.linked" :status="status" :allow-anon="false"></data-node>
      <div class="actions">
        <button v-on:click="closeForm" v-bind:disabled="isEmpty">Klar</button>
      </div>
    </div>
    <card-component :title="getChip" :item="getCard" :uri="item['@id']" :should-show="showCardInfo"></card-component>
  </div>
</template>

<style lang="less">
@import './_variables.less';

.item-anonymous {
  .chip {
    .chip-mixin(green);
  }
  .anonymous-form {
    border: 1px solid #ccc;
    border-radius: 5px;
    padding: 5px;
    background-color: #e0e0e0;
    .action-remove {
      float: right;
    }
    &::before {
      content: '\00000A';
    }
  }
}

</style>
