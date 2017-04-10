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
import ItemMixin from './mixins/item-mixin';
import LensMixin from './mixins/lens-mixin';
import { getSettings, getVocabulary, getDisplayDefinitions, getEditorData } from '../vuex/getters';

export default {
  name: 'item-local',
  mixins: [ItemMixin, LensMixin],
  props: {
    item: {},
    key: '',
    index: Number,
    isLocked: false,
    focus: '',
    expanded: false,
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
      const fItem = Object.assign({}, this.item);
      delete fItem['@type'];
      return fItem;
    },
    formObj() {
      return this.getForm(this.item);
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
      return this.focus === 'mainEntity';
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
        this.display,
        this.settings
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
            this.display,
            this.settings
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
          formObj[key] = [];
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
  <div class="item-local" @mouseleave="showCardInfo=false">
    <div class="chip" v-show="!inEdit" v-bind:class="{ 'locked': isLocked, 'highlighted': showCardInfo }" @mouseenter="showCardInfo=true">
      <span class="chip-label">
        {{getItemLabel}}
      </span>
      <i class="chip-action fa fa-pencil" v-on:click="openForm" v-if="!isLocked"></i>
    </div>
    <div class="local-form" v-show="inEdit">
      <strong>{{ item['@type'] | labelByLang | uppercase }}</strong> ({{ "Local entity" | translatePhrase }})
      <data-node v-for="(k,v) in filteredItem" :is-locked="isLocked" :embedded="true" :is-removable="false" :parent-key="key" :parent-index="index" :key="k" :value="v" :focus="focus" :allow-local="false"></data-node>
      <div class="actions">
        <button v-on:click="removeThis">Radera</button>
        <button v-on:click="closeForm" v-bind:disabled="isEmpty">Klar</button>
      </div>
    </div>
    <card-component :title="getItemLabel" :focus-data="item" :uri="item['@id']" :should-show="showCardInfo && !inEdit" :floating="!expanded"></card-component>
  </div>
</template>

<style lang="less">
@import './_variables.less';

.item-local {
  > .chip {
    .chip-mixin(#a2a2a2, #fff);
  }
  .local-form {
    width: @col-value - 20;
    border: dashed #ababab;
    border-bottom-color: #ccc;
    border-bottom-style: solid;
    border-width: 1px 1px 2px 1px;
    padding: 5px;
    background-color: #ececec;
    .actions {
      margin-top: 0.5em;
      text-align: right;
    }
    &::before {
      content: '\00000A';
    }
  }
}

</style>
