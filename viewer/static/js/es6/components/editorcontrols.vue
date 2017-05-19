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
            <i class="fa fa-chevron-down" :class="{'up': showAdminInfoDetails}" aria-hidden="true" @click="toggleAdminData()"></i>
          </div>
          <div class="action" v-on:click="toggleDev()" v-bind:class="{'active': status.isDev}">
            <i class="fa fa-wrench" aria-hidden="true"></i>
          </div>
          <div class="action">
            <span class="data-selector" v-on:click="otherFormatMenu = true"></i> {{"Data" | translatePhrase}} <i class="fa fa-caret-down" aria-hidden="true"></i></span>
            <div class="other-format-menu" v-if="otherFormatMenu" v-on-clickaway="otherFormatMenu = false">
              <a :href="`${focusData['@id']}/data.jsonld`">JSON-LD</a>
              <a :href="`${focusData['@id']}/data.ttl`">Turtle</a>
              <a :href="`${focusData['@id']}/data.rdf`">RDF</a>
            </div>
          </div>
        </div>
        <marc-preview v-show="status.inEdit"></marc-preview>
        <div class="admin-node">
          <span class="node">Skapad {{ getCard.created }} av {{ getCard.assigner }}</span>
        </div>
        <div class="admin-node">
          <span class="node">Ändrad {{ getCard.modified }} av - </span>
        </div>
        <create-item-button v-show="!status.inEdit && editorData.mainEntity['@type'] === 'Instance'"></create-item-button>
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
    .data-selector {
      padding: 0 0.5em;
    }
    .other-format-menu {
      position: absolute;
      top: 1.5em;
      line-height: 1.6;
      white-space: normal;
      a {
        background-color: @black;
        display: block;
        padding: 0.1em 0.5em;
        text-decoration: none;
        color: white;
        &:hover {
          background-color: @gray-dark;
        }
      }
      &::before {
        content: "";
        width: 0;
        height: 0;
        border-style: solid;
        border-width: 0 5px 6px 5px;
        border-color: transparent transparent @black transparent;
        font-size: 0;
	      line-height: 0;
        margin-left: 29px;
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
        padding: 3px 10px;
        font-size: 12px;
        line-height: 20px;
        background-color: #efefef;
        border: 1px solid rgba(27,31,35,0);
      }
      .actions {
        .action {
          display: inline-block;
          cursor: pointer;
          margin: 0 0.5em;
          > a {
            color: #fff;
            font-size: 11px;
          }
          &.active {
            i {
              color: @brand-primary;
            }
          }
          i {
            transition: all 0.5s ease;
            &.up {
              transform:rotate(-180deg);
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
