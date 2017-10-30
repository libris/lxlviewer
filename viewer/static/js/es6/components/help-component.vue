<script>
import * as LayoutUtil from '../utils/layout';
import { getStatus } from '../vuex/getters';
import { changeStatus } from '../vuex/actions';
import * as helpdocsJson from '../../../../helpdocs/helpdocs';

export default {
  name: 'help-component',
  data() {
    return {
      openAll: 'open-all',
      activeSection: '',
      activeCategory: '',
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
    setSection(value) {
      this.changeStatus('helpSection', value);
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
    helpCategories() {
      const json = this.docs;
      const categories = {};
      for (const section in json) {
        const cat = json[section].section;
        if (categories.hasOwnProperty(cat) === false) {
          categories[cat] = [];
        }
        categories[cat].push(json[section]);
      }
      return categories;
    },
    docs() {
      const json = helpdocsJson;
      delete json.default;
      delete json.readme;
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
            <ul class="categories">
              <li v-for="(key, value) in helpCategories" v-bind:class="{'active': key == activeCategory }" v-on:click="activeCategory = key">
                {{key}}
                <ul class="sections">
                  <li v-for="section in value" v-bind:class="{'active': section.title == helpSection }" v-on:click="setSection(section.title)">{{section.title}}</li>
                </ul>
              </li>
            </ul>
          </div>
          <div class="content">
            <div v-show="helpSection == ''">
              <h1>Hjälp</h1>
              <p>
                Här kan du få hjälp. Välj avsnitt till vänster.
              </p>
            </div>
            <div v-for="section in docs" v-html="section.body" v-show="section.title == helpSection"></div>
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
    max-width: 1000px;
    .body {
      padding: 0em 0em 0em 1em;
      overflow-y: scroll;
      .content {
        padding: 2em 2em 3em 1em;
        height: 100%;
        overflow-y: scroll;
        width: 80%;
        float: right;
        h1, h2, h3, h4 {
          font-weight: normal;
          margin-top: 0;
          border: solid;
          border-width: 0px 0px 1px 0px;
        }
        p {
          margin: 0.5em 0px 1em;
        }
        code {
          padding: 4px;
          font-size: 90%;
          color: #000000;
          background-color: #fbebef;
        }
      }
      .menu {
        width: 20%;
        margin: 1em 0em 0em 0em;
        background-color: #e6e6e6;
        border-radius: 5px;
        float: left;
        ul.categories {
          list-style: none;
          padding: 5px 10px;
          > li {
            font-weight: bold;
            // cursor: pointer;
            ul.sections {
              // display: none; // SHOW ALL
              list-style: none;
              padding: 0;
              li {
                font-weight: normal;
                border-radius: 5px;
                padding: 0 0.3em;
                cursor: pointer;
                &:hover {
                  text-decoration: underline;
                }
                &.active {
                  background-color: #ccc;
                }
              }
            }
            &.active {
              > ul {
                display: block;
              }
            }
          }
        }
      }
    }
  }
}

</style>
