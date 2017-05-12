<script>
import * as _ from 'lodash';
import HeaderComponent from './headercomponent';
import MarcPreview from '../components/marc-preview';
import CreateItemButton from '../components/create-item-button';
import * as DataUtil from '../utils/data';
import * as DisplayUtil from '../utils/display';
import LensMixin from './mixins/lens-mixin';
import { mixin as clickaway } from 'vue-clickaway';
import { changeSavedStatus, changeStatus } from '../vuex/actions';
import { getSettings, getVocabulary, getDisplayDefinitions, getEditorData, getStatus } from '../vuex/getters';

export default {
  vuex: {
    getters: {
      vocab: getVocabulary,
      display: getDisplayDefinitions,
      settings: getSettings,
      editorData: getEditorData,
      status: getStatus,
    },
    actions: {
      changeSavedStatus,
      changeStatus,
    },
  },
  mixins: [clickaway, LensMixin],
  ready() { // Ready method is deprecated in 2.0, switch to "mounted"
    this.$nextTick(() => {
      window.addEventListener('scroll', (e) => {
        const scrollPosition = e.target.body.scrollTop;
        if (this.headerThreshold < scrollPosition) {
          this.showChipHeader = true;
        } else {
          this.showChipHeader = false;
        }
      });
      const expandableAdminInfo = document.getElementsByClassName('admin-info-container')[0];
      expandableAdminInfo.onresize = this.resize;
    });
  },
  methods: {
    save() {
      this.changeSavedStatus('loading', true);
      this.$dispatch('save-item');
    },
    edit() {
      this.$dispatch('edit-item');
    },
    toggleDev() {
      this.changeStatus('isDev', !this.status.isDev);
    },
    toggleAdminData() {
      this.showAdminInfoDetails = !this.showAdminInfoDetails;
    },
  },
  data() {
    return {
      showChipHeader: false,
      showAdminInfoDetails: false,
      otherFormatMenu: false,
    };
  },
  computed: {
    headerThreshold() {
      const editorContainer = document.getElementById('editor-container');
      return editorContainer.offsetTop;
    },
    focusData() {
      return this.editorData.record;
    },
    isWork() {
      return this.status.level === 'work';
    },
    isInstance() {
      return this.status.level === 'mainEntity';
    },
  },
  components: {
    'header-component': HeaderComponent,
    'marc-preview': MarcPreview,
    'create-item-button': CreateItemButton,
  },
};
</script>

<template>
  <div class="container" id="editor-container" v-bind:class="{'affix': showChipHeader}">
    <div class="editor-controls">
      <div class="admin-info">
        <div class="actions">
          <div class="action">
            <i class="fa fa-info-circle" aria-hidden="true" @click="toggleAdminData()"></i>
          </div>
          <div class="action" v-on:click="toggleDev()" v-bind:class="{'active': status.isDev}">
            <i class="fa fa-wrench" aria-hidden="true"></i>
          </div>
          <div class="action">
            <button v-on:click="otherFormatMenu = true"><i class="fa fa-file-text"></i> data</button>
            <div class="other-format-menu" v-if="otherFormatMenu" v-on-clickaway="otherFormatMenu = false">
              <a :href="`${focusData['@id']}/data.jsonld`">JSON-LD</a>
              <a :href="`${focusData['@id']}/data.ttl`">Turtle</a>
              <a :href="`${focusData['@id']}/data.rdf`">RDF</a>
            </div>
          </div>
        </div>
        <div class="admin-node">
          <span class="node">Skapad {{ getCard.created }} av {{ getCard.assigner }}</span>
        </div>
        <div class="admin-node">
          <span class="node">Ändrad {{ getCard.modified }} av - </span>
        </div>
        <create-item-button v-show="!status.inEdit && editorData.mainEntity['@type'] === 'Instance'"></create-item-button>
        <marc-preview v-show="status.inEdit"></marc-preview>
        <button id="saveButton" v-on:click="save()" v-if="status.inEdit">
          <i class="fa fa-fw fa-cog fa-spin" v-show="status.saved.loading"></i>
          <i class="fa fa-fw fa-save" v-show="!status.saved.loading"></i>
          {{ "Save" | translatePhrase }}
        </button>
        <button id="editButton" v-on:click="edit()" v-if="!status.inEdit">
          <i class="fa fa-fw fa-pencil"></i>
          {{ "Edit" | translatePhrase }}
        </button>

      </div>
      <div>
        <div class="admin-info-container" :class="{ 'show-admin-info-details': showAdminInfoDetails }">
          <div class="admin-info-details">
            <div v-for="(k, v) in getCard">
              <div class="admin-key">
                {{ k | labelByLang | capitalize }}:
              </div>
              <div>
                {{v}}
              </div>
            </div>
          </div>
        </div>
      </div>
      <header-component v-bind:class="{'collapsed': !showChipHeader}" :full="false"></header-component>
    </div>

  </div>
</template>

<style lang="less">
@import './_variables.less';

.container {
  padding: 0px;
  &.affix {
    top: 0;
    z-index: @header-z;
    + .header-component {
      padding-top: 33px;
    }
  }

  .editor-controls {
    background-color: @black;
    .other-format-menu {
      position: absolute;
      top: 2em;
      margin-left: 1em;
      border-radius: 4px;
      background-color: @white;
      line-height: 1.6;
      border: 1px solid @gray-light;
      white-space: normal;
      padding: 0.5em;
      a {
        display: block;
      }
    }
    .admin-info {
      color: @white;
      flex-direction: row;
      display: flex;
      align-items: center;
      position: relative;
      padding: 5px 7px;
      .admin-node {
        flex-grow: 5;
        text-align: center;
        .node {
          font-size: 0.8em;
          vertical-align: middle;
        }
      }
      button {
        margin: 0 0.3em;
      }
      .actions {
        .action {
          display: inline-block;
          cursor: pointer;
          > a {
            color: #fff;
            font-size: 11px;
          }
          &.active {
            i {
              color: @brand-primary;
            }
          }
        }
      }
    }
    .admin-info-container {
      color: white;
      overflow: hidden;
      padding: 0px;
      max-height: 0px;
      transition: all ease 1s;
      &.show-admin-info-details {
        max-height: 120px;
      }
      .admin-info-details {
        > div > div{
          display: inline-block;
          &.admin-key {
            width: 50%;
            text-align: right;
            font-style: italic;
          }
        }
        cursor: auto;
        font-size: 0.8em;
        padding: 5px 0px;
        columns: 2;
        column-fill: balance;
        overflow: hidden;
      }
    }
  }
}
</style>
