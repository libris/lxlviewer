<script>
import EntitySummary from './entity-summary';
import * as StringUtil from '../utils/string';
import * as RecordUtil from '../utils/record';
import * as LayoutUtil from '../utils/layout';
import * as HttpUtil from '../utils/http';
import { getSettings, getVocabulary, getEditorData, getStatus } from '../vuex/getters';

export default {
  name: 'instance-list-button',
  props: {
    instanceList: [],
    checkingInstances: true,
  },
  data() {
    return {
      itemData: {},
      embellishedInstanceList: [],
      showInstances: false,
    }
  },
  vuex: {
    getters: {
      vocab: getVocabulary,
      settings: getSettings,
      editorData: getEditorData,
      status: getStatus,
    },
  },
  methods: {
    buildEmbellishedInstanceList(instanceList) {
      const promiseArray = instanceList.map(instanceId => {
        return HttpUtil.get({ url: `${instanceId}/data.jsonld`, accept: 'application/ld+json' }).then(instanceInfo => {
          return RecordUtil.splitJson(instanceInfo);
        }, (error) => {
          console.log("Error fetching relation info");
        });
      });
      Promise.all(promiseArray).then(results => {
        this.embellishedInstanceList = results;
        this.$dispatch('set-checking-relations', false);
      });
    },
    show() {
      LayoutUtil.scrollLock(true);
      this.showInstances = true;
    },
    hide() {
      if (!this.showInstances) return;
      this.showInstances = false;
      LayoutUtil.scrollLock(false);
    },
  },
  computed: {
  },
  components: {
    'entity-summary': EntitySummary,
  },
  watch: {
    instanceList(newInstances) {
      this.buildEmbellishedInstanceList(newInstances);
    },
  },
  events: {
    'close-modals'() {
      this.hide();
      return true;
    },
  },
  ready() { // Ready method is deprecated in 2.0, switch to "mounted"
    this.$nextTick(() => {
    });
  },
};
</script>

<template>
  <div class="instances-button-container">
    <button class="btn btn-primary" @click="show()">
      <i v-if="checkingHolding" class="fa fa-fw fa-circle-o-notch fa-spin"></i>
      {{"Show instantiations" | translatePhrase}}
    </button>
    <div class="window" v-if="showInstances">
      <div class="header">
        <span class="title">
          {{ "Instantiations of this work" | translatePhrase }}
        </span>
        <span class="windowControl">
          <i @click="hide()" class="fa fa-close"></i>
        </span>
      </div>
      <div class="body">
        <a v-for="instance in embellishedInstanceList" :href="instance.record['@id']">
          <entity-summary :focus-data="instance.mainEntity" :add-link="true" :lines="4"></entity-summary>
        </a>
      </div>
    </div>
  </div>
</template>

<style lang="less">
@import './_variables.less';
.instances-button-container {
  button {
    font-weight: bold;
  }
  .window {
    .window-mixin();
    .body {
      width: 100%;
      background-color: white;
      border: 1px solid #ccc;
      padding: 0px;
      overflow-y: scroll;
      > a {
        text-decoration: none;
        .entity-summary {
          &:hover {
            background: darken(@white, 5%);
            cursor: pointer;
            .header {
              text-decoration: underline;
            }
          }
        }
      }
    }
  }
}
</style>
