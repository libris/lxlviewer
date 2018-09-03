<script>
import * as _ from 'lodash';
import * as LayoutUtil from '@/utils/layout';
import helpdocsJson from '@/resources/json/help.json';
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
    getImagePath(imgName) {
      const pathParts = imgName.split('/');
      const fileName = pathParts[pathParts.length-1];
      let fetchedFileName = '';
      try {
        fetchedFileName = require(`@/assets/img/generated/${fileName}`);
      }
      catch(error) {
        console.warn(`Could not resolve path for image "${fileName}"`);
      }
      return fetchedFileName;
    },
    resolveImages(html) {
      const parser=new DOMParser();
      const htmldoc=parser.parseFromString(html, "text/html");
      const images = htmldoc.getElementsByTagName('img');
      for (let img of images) {
        img.src = this.getImagePath(img.src);
      }
      return htmldoc.body.innerHTML;
    },
    getHTML(markdown) {
      const html = this.transformMarkdownToHTML(markdown);
      const htmlFixedImages = this.resolveImages(html);
      return htmlFixedImages;
    },
    transformMarkdownToHTML(markdown) {
      const html = marked(markdown);
      return html;
    },
    changeSection(value) {
      this.$router.push({ path: `/help/${value}` });
    },
  },
  mounted() {
  },
  watch: {
  },
  events: {
  },
  computed: {
    activeSection() {
      return this.$route.params.section || '';
    },
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

  <div class="HelpSection">
    <div class="row">
      <div class="col-md-3">
        <div class="HelpSection-menu">
          <ul class="HelpSection-categories">
            <li class="HelpSection-categoryItem"
              v-for="(value, key) in helpCategories" 
              :key="key" 
              v-bind:class="{'is-active': key == activeCategory }" 
              v-on:click="activeCategory = key">
              <span class="HelpSection-categoryItemLabel">{{key}}</span>
              <ul class="HelpSection-categoryList">
                <li class="HelpSection-categoryListItem" v-for="(section, index) in value" 
                  :key="index" 
                  v-bind:class="{'active': section.basename == activeSection }" 
                  v-on:click="changeSection(section.basename)">{{section.title}}</li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
      <div class="col-md-9">
        <article class="HelpSection-article is-fromMarkdown panel panel-default">
          <div v-show="activeSection == ''">
            <h1 class="HelpSection-title">Hjälp</h1>
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
          <div v-for="(sectionValue, sectionKey) in docs" 
            :key="sectionKey" v-if="sectionValue.basename == activeSection">
            <div v-html="getHTML(docs[sectionKey].content)"></div>
          </div>
        </article>
      </div>
    </div>
  </div>
</template>

<style lang="less">

.HelpSection {
  &-article {
    padding: 30px;
    height: 100%;

    &.is-fromMarkdown {
      h2, h3, h4 {
        font-weight: normal;
        margin: 20px 0 15px;
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

      img {
        max-width: 100%;
      }

      table {
        font-size: 12px;
        font-size: 1.2rem;
        border: 1px solid @gray-lighter;
        width: 100%;
      }

      tr {
        width: 100%;
      }

      td {
        padding: 5px;
      }

      tr:nth-child(even) {
        background: @list-item-bg-even;
      }

      th {
        background: @gray-lighter;
        padding: 5px;
        text-transform: uppercase;
        line-height: 1.2;
      }
    }
  }

  &-categories {
    list-style: none;
    padding: 0;
  }

  &-categoryItem {
    display: block;
    margin: 10px 0;
    overflow: hidden;
  }

  &-categoryItemLabel {
    color: @black;
    font-size: 14px;
    font-size: 1.4rem;
    text-transform: uppercase;
    padding: 0;
    font-weight: 600;
  }

  &-categoryList {
    list-style: none;
    padding: 0;
  }

  &-categoryListItem {
    margin: 3px 0px;
    cursor: pointer;

    &:hover:not(.active) {
      text-decoration: underline;
    }

    &.active {
      font-weight: 700;
      cursor: initial;
    }
  }
}

</style>
