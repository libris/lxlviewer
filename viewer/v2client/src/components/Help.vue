<script>
import * as _ from 'lodash';
import * as LayoutUtil from '@/utils/layout';
// import helpdocsJson from '@/resources/json/help.json';
import marked from 'marked';

export default {
  name: 'help-component',
  data() {
    return {
      openAll: 'open-all',
      activeCategory: '',
    }
  },
  methods: {
    setSection(value) {
      this.$store.dispatch('setStatus', { property: 'helpSection', value });
    },
    transformMarkdownToHTML(markdown) {
      return marked(markdown);
    }
  },
  events: {
  },
  computed: {
    status() {
      return this.$store.getters.status;
    },
    helpSection() {
      return this.status.helpSection;
    },
    helpCategories() {
      const json = this.docs;
      const sortedJson = _.orderBy(json, ['order'],['asc']);
      const categories = {};
      for (const section in sortedJson) {
        const cat = sortedJson[section].section;
        if (categories.hasOwnProperty(cat) === false) {
          categories[cat] = [];
        }
        categories[cat].push(sortedJson[section]);
      }
      return categories;
    },
    docs() {
      const json = helpdocsJson;
      delete json.default;
      delete json.readme;
      return json;
    },
  },
};
</script>

<template>

  <div class="help-component">
    <div class="row">
      <div class="col-md-3">
        <div class="menu panel panel-default">
          <ul class="categories">
            <li v-for="(value, key) in helpCategories" :key="key" v-bind:class="{'active': key == activeCategory }" v-on:click="activeCategory = key">
              <span class="label">{{key}}</span>
              <ul class="sections">
                <li v-for="(section, index) in value" :key="index" v-bind:class="{'active': section.title == helpSection }" v-on:click="setSection(section.title)">{{section.title}}</li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
      <div class="col-md-9">
        <div class="content panel panel-default">
          <div v-show="helpSection == 'none'">
            <h1>Hjälp</h1>
            <p>
              Den här hjälpen omfattar instruktioner för gränssnittet och materialtyper, välj avsnitt till vänster för att läsa mer.
            </p>
            <h2>Nyttiga länkar</h2>
            <ul>
              <li>Om du vill läsa om Formatet (mappning och basvokabulär) så har du det <a href="https://id-qa.kb.se/" target="_blank">här</a>.</li>
              <li>Är du ute efter instruktionsmaterial hittar du det <a href="http://librisbloggen.kb.se/2017/10/31/sjalvstudier-infor-overgangen-till-nya-libris-och-xl/" target="_blank">här</a>.</li>
              <li>Vill du komma i kontakt med kundservice gör du det <a href="http://www.kb.se/libris/kontakta/" target="_blank">här</a>.</li>
              <li><a href="https://goo.gl/forms/3mL7jTlEpbU3BQM13" target="_blank">Här</a> kan du rapportera fel.</li>
              <li><a href="https://goo.gl/forms/dPxkhMqE10RvKQFE2" target="_blank">Här</a> kan du ge ändringsförslag.</li>
            </ul>
          </div>
          <div v-for="(sectionValue, sectionKey) in docs" :key="sectionKey" v-show="sectionValue.title == helpSection">
            <span v-html="transformMarkdownToHTML(docs[sectionKey].content)"></span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="less">

.help-component {
  .content {
    padding: 1em;
    height: 100%;
    h1, h2, h3, h4 {
      font-weight: normal;
      margin-top: 0;
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
    ul.categories {
      list-style: none;
      padding: 5px 10px;
      > li {
        font-weight: bold;
        // cursor: pointer;
        .label {
          color: @black;
          text-transform: uppercase;
          padding: 0;
        }
        ul.sections {
          // display: none; // SHOW ALL
          list-style: none;
          padding: 0;
          li {
            font-weight: normal;
            border-radius: 5px;
            padding: 0 0.3em;
            margin: 3px 0px;
            cursor: pointer;
            &:hover {
              background-color: @gray-lighter;
            }
            &.active {
              background-color: @brand-primary;
              color: @neutral-color;
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

</style>
