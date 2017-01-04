<script>
import * as _ from 'lodash';
import Notifications from '../components/notifications';
import HeaderComponent from './headercomponent';
import moment from 'moment';
import * as EditUtil from '../utils/edit';
import * as DisplayUtil from '../utils/display';
import { getVocabulary, getDisplayDefinitions, getSettings, getEditorData } from '../vuex/getters';
moment.locale('sv');

export default {
  props: [
    'status',
  ],
  vuex: {
    getters: {
      vocab: getVocabulary,
      display: getDisplayDefinitions,
      settings: getSettings,
      editorData: getEditorData,
    },
  },
  methods: {
    save() {
      this.$dispatch('save-item');
    },
    toggleDev() {
      this.$dispatch('toggle-dev');
    },
    toggleAdminData() {
      this.showAdminInfoDetails = !this.showAdminInfoDetails;
    },
  },
  data() {
    return {
      showAdminInfoDetails: false,
    };
  },
  computed: {
    // TODO: Get all admin data, not only card info
    getCard() {
      const card = DisplayUtil.getCard(
        this.editorData.record,
        this.display,
        this.editorData.linked,
        this.vocab,
        this.settings
      );
      return card;
    },
    isWork() {
      return this.status.state === 'work';
    },
    isInstance() {
      return this.status.state === 'it';
    },
  },
  components: {
    notifications: Notifications,
    'header-component': HeaderComponent,
  },
};
</script>

<template>
  <div class="container editor-container" data-spy="affix" data-offset-top="80">
    <div class="editor-controls" :class="{ 'work-state': isWork, 'instance-state': isInstance }" >
      <div class="admin-info">
        <div class="actions">
          <div class="action">
            <i class="fa fa-info-circle" aria-hidden="true" @click="toggleAdminData()"></i>
          </div>
          <div class="action" v-on:click="toggleDev()" v-bind:class="{'active': status.isDev}">
            <i class="fa fa-wrench" aria-hidden="true"></i>
          </div>
        </div>
        <div class="admin-node">
          <span class="node">Skapad {{ getCard.created }} av {{ getCard.assigner }}</span>
        </div>
        <div class="admin-node">
          <span class="node">Ändrad {{ getCard.modified }} av - </span>
        </div>
        <button id="saveButton" v-on:click="save()">
          <i class="fa fa-fw fa-cog fa-spin" v-show="status.saved.loading"></i>
          <i class="fa fa-fw fa-save" v-show="!status.saved.loading"></i>
          Spara
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
      <header-component :status="status" :full="false"></header-component>
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
    &.instance-state {
      background-color: @instance-background;
      color: @instance-text;
    }
    &.work-state {
      background-color: @work-background;
      color: @work-text;
    }
    .admin-info {
      flex-direction: row;
      display: flex;
      align-items: center;
      position: relative;
      padding: 5px 15px;
      .admin-node {
        flex-grow: 5;
        text-align: center;
        .node {
          font-size: 0.8em;
          vertical-align: middle;
        }
      }
      #saveButton {
        padding: 0px;
        flex-grow: 1;
      }

      .actions {
        .action {
          display: inline-block;
          cursor: pointer;
          &.active {
            i {
              color: @brand-primary;
            }
          }
        }
      }
    }
    .admin-info-container {
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
