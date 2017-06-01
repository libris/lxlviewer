<script>
import * as _ from 'lodash';
import * as httpUtil from '../utils/http';
import * as LayoutUtil from '../utils/layout';
import * as VocabUtil from '../utils/vocab';
import * as DisplayUtil from '../utils/display';
import * as RecordUtil from '../utils/record';
import * as StringUtil from '../utils/string';
import Vue from 'vue';
import ProcessedLabel from './processedlabel';
import ItemEntity from './item-entity';
import DataNode from './datanode';
import CardComponent from './card-component';
import ItemMixin from './mixins/item-mixin';
import LensMixin from './mixins/lens-mixin';
import { changeNotification, changeStatus } from '../vuex/actions';
import { getSettings, getVocabulary, getDisplayDefinitions, getEditorData, getStatus } from '../vuex/getters';

export default {
  name: 'item-local',
  mixins: [ItemMixin, LensMixin],
  props: {
    item: {},
    key: '',
    index: Number,
    isLocked: false,
    expanded: false,
  },
  vuex: {
    getters: {
      vocab: getVocabulary,
      display: getDisplayDefinitions,
      settings: getSettings,
      editorData: getEditorData,
      status: getStatus,
    },
    actions: {
      changeStatus,
      changeNotification,
    },
  },
  data() {
    return {
      inEdit: false,
      showCardInfo: false,
      searchResult: {},
      searchDelay: 2,
      extracted: {},
      extractDialogActive: false,
      extracting: false,
    };
  },
  computed: {
    isExtractable() {
      if (this.settings.nonExtractableClasses.indexOf(this.focusData['@type']) === -1) {
        return true;
      }
      return false;
    },
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
  },
  created() {
    this.$options.components['data-node'] = Vue.extend(DataNode);
  },
  methods: {
    openExtractDialog() {
      this.changeStatus('keybindState', 'extraction-dialog');
      LayoutUtil.scrollLock(true);
      this.extractDialogActive = true;
    },
    closeExtractDialog() {
      this.changeStatus('keybindState', 'overview');
      LayoutUtil.scrollLock(false);
      this.extractDialogActive = false;
      this.extracting = false;
    },
    doExtract() {
      this.extracting = true;

      // TODO: Remove this when Summary isn't broken
      const hackedObject = this.extracted;
      delete hackedObject['@graph'][1].summary;
      this.doCreateRequest(httpUtil.post, hackedObject, '/');

      // this.doCreateRequest(httpUtil.post, this.extracted, '/');
    },
    doCreateRequest(requestMethod, obj, url) {
      requestMethod({ url, token: self.access_token }, obj).then((result) => {
        if (result.status === 201) {
          const postUrl = `${result.getResponseHeader('Location')}/data.jsonld`;
          httpUtil.get({ url: postUrl }).then((getResult) => {
            const recievedObj = {
              '@graph': getResult['@graph'],
            }
            const mainEntity = RecordUtil.splitJson(recievedObj).mainEntity;
            this.$dispatch('add-item', mainEntity, this.index);
            this.changeNotification('color', 'green');
            this.changeNotification('message', `${StringUtil.getUiPhraseByLang('Extraction was successful', this.settings.language)}`);
            this.closeExtractDialog();
          }, (error) => {
            this.changeNotification('color', 'red');
            this.changeNotification('message', `${StringUtil.getUiPhraseByLang('Something went wrong', this.settings.language)} - ${StringUtil.getUiPhraseByLang(error, this.settings.language)}`);
            this.closeExtractDialog();
          });
        } else {
          this.changeNotification('color', 'red');
          this.changeNotification('message', `${StringUtil.getUiPhraseByLang('Something went wrong', this.settings.language)} - ${StringUtil.getUiPhraseByLang(error, this.settings.language)}`);
          this.closeExtractDialog();
        }
      }, (error) => {
        this.changeNotification('color', 'red');
        this.changeNotification('message', `${StringUtil.getUiPhraseByLang('Something went wrong', this.settings.language)} - ${StringUtil.getUiPhraseByLang(error, this.settings.language)}`);
        this.closeExtractDialog();
      });
    },
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
  events: {
    'extract-item'() {
      this.openExtractDialog();
    },
    'close-modals'() {
      this.closeExtractDialog();
    },
  },
  ready() {
    this.$nextTick(() => {
      this.extracted = RecordUtil.getObjectAsRecord(this.focusData);
    });
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
    <div class="chip" v-show="!inEdit && !expanded" v-bind:class="{ 'locked': isLocked, 'highlighted': showCardInfo }" @mouseenter="showCardInfo=true">
      <span class="chip-label">
        {{getItemLabel}}
      </span>
      <i v-if="isExtractable && !isLocked" class="chip-action fa fa-file" v-on:click="openExtractDialog" v-if="!isLocked"></i>
    </div>
    <div class="local-form" v-show="inEdit">
      <strong>{{ item['@type'] | labelByLang | uppercase }}</strong> ({{ "Local entity" | translatePhrase }})
      <data-node v-for="(k,v) in filteredItem" :is-inner="true" :is-locked="isLocked" :embedded="true" :is-removable="false" :parent-key="key" :parent-index="index" :key="k" :value="v" :focus="focus" :allow-local="false"></data-node>
      <div class="actions">
        <button v-on:click="removeThis">Radera</button>
        <button v-on:click="closeForm" v-bind:disabled="isEmpty">Klar</button>
      </div>
    </div>
    <card-component :title="getItemLabel" :focus-data="item" :uri="item['@id']" :is-local="true" :is-extractable="isExtractable" :is-locked="isLocked" :should-show="showCardInfo && !inEdit" :floating="!expanded"></card-component>
    <div class="window" v-if="extractDialogActive">
      <div class="header">
        <span class="title">
          {{ "Bryt ut entitet" | translatePhrase }}
        </span>
        <span class="windowControl">
          <i v-on:click="closeExtractDialog" class="fa fa-close"></i>
        </span>
      </div>
      <div class="body">
        <p>
          {{ "Utbrytning av lokala entiteter är ett önskat beteende yadda yadda lorem ipsum" | translatePhrase }}
        </p>
        <div class="button-container">
          <button v-on:click="doExtract()" v-show="!extracting">{{ "Accept" | translatePhrase }}</button>
          <div v-show="extracting"><i class="fa fa-circle-o-notch fa-spin" aria-hidden="true"></i> {{ "Extracting" | translatePhrase }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="less">
@import './_variables.less';

.item-local {
  > .chip {
    .chip-mixin(#a2a2a2, #fff);
  }
  .window {
    .window-mixin();
    .body {
      padding: 2em;
      .button-container {
        text-align: center;
      }
    }
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
