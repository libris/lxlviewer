<script>
import * as LayoutUtil from '../utils/layout';
import { getStatus } from '../vuex/getters';
import { changeStatus } from '../vuex/actions';
import * as helpdocsJson from '../helpdocs';

export default {
  name: 'help-component',
  data() {
    return {
      openAll: 'open-all',
      activeSection: '',
    }
  },
  vuex: {
    actions: {
      changeStatus,
    },
    getters: {
      status: getStatus,
    },
  },
  methods: {
    hide() {
      this.changeStatus('showHelp', false);
      LayoutUtil.scrollLock(false);
      this.changeStatus('keybindState', 'overview');
    },
  },
  events: {
    'close-modals'() {
      this.hide();
    },
  },
  computed: {
    helpSection() {
      return this.status.helpSection;
    },
    docs() {
      const json = helpdocsJson;
      delete json.default;
      return json;
    }
  },
  components: {
  },
  watch: {
  },
  ready() { // Ready method is deprecated in 2.0, switch to "mounted"
    this.$nextTick(() => {
      // Do stuff
    });
  },
};
</script>

<template>
  <div class="help-component">
      <div class="window"  v-show="status.showHelp">
        <div class="header">
          <span class="title">
            {{ "Help" | translatePhrase }}
          </span>
          <span class="windowControl">
            <i v-on:click="hide" class="fa fa-close"></i>
          </span>
        </div>
        <div class="body">
          <div class="menu">
            <ul>
              <li v-for="section in docs" v-bind:class="{'active': section.title == activeSection }" v-on:click="activeSection = section.title">{{section.title}}</li>
            </ul>
          </div>
          <div class="content">
            <div v-show="activeSection == ''">
              <h1>Hjälp</h1>
              <p>
                Här kan du få hjälp. Välj avsnitt till vänster.
              </p>
            </div>
            <div v-for="section in docs" v-html="section.body" v-show="section.title == activeSection"></div>
          </div>
        </div>
      </div>
  </div>
</template>

<style lang="less">
@import './_variables.less';

.help-component {
  .window {
    .window-mixin();
    .body {
      padding: 1em 1em 4em;
      overflow-y: scroll;
      .content {
        padding: 0em 1em;
        width: 80%;
        float: right;
        h1, h2, h3, h4 {
          font-weight: normal;
          margin-top: 0px;
          border: solid @gray;
          border-width: 0px 0px 1px 0px;
        }
        p {
          margin: 1.5em 0px 2.5em;
        }
      }
      .menu {
        width: 20%;
        background-color: #e6e6e6;
        border-radius: 5px;
        float: left;
        ul {
          list-style: none;
          padding: 5px;
          li {
            border-radius: 5px;
            padding: 3px;
            cursor: pointer;
            &:hover {
              text-decoration: underline;
            }
            &.active {
              background-color: #ccc;
            }
          }
        }
      }
    }
  }
}

</style>
